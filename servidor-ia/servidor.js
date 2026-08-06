/*
 * Servidor mínimo de axuda por IA para "Que comemos hoxe?", pensado para
 * correr no VPS xunto a n8n/Supabase, pero SEN depender de n8n: só fala
 * coa API de IA que configures en .env. Substitúe (opcionalmente) a acción
 * POST /ia/axuda que hoxe implementa un workflow de n8n que non responde
 * en produción (ver DOCS/BACKEND_N8N_STATUS.md no repositorio principal).
 *
 * Deseño deliberado:
 *   - Sen base de datos propia. O frontend xa ten a receita enteira en
 *     memoria (QCH.receita(id)), así que a envía no corpo da petición —
 *     este servidor non precisa ler Supabase nin coñecer o esquema de
 *     qch_receitas. Iso manténo independente de calquera cambio no resto
 *     da infraestrutura.
 *   - Un só segredo compartido (IA_ACCESS_TOKEN), non sesións: máis simple
 *     ca replicar o sistema de login de n8n, e dabondo para un uso
 *     familiar. Calquera persoa coa app xa ten ese token — é o mesmo
 *     concepto có "código de acceso da casa" que xa usa n8n.
 *   - Sen dependencias fóra de "express", "cors" e "dotenv": fácil de
 *     auditar e de manter.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const PORT = process.env.PORT || 3001;
const IA_ACCESS_TOKEN = process.env.IA_ACCESS_TOKEN;
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.moonshot.cn/v1';
const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'moonshot-v1-8k';
const ORIXES_PERMITIDAS = (process.env.ORIXES_PERMITIDAS || 'https://qch.pages.dev')
  .split(',').map(s => s.trim()).filter(Boolean);

if (!IA_ACCESS_TOKEN) { console.error('Falta IA_ACCESS_TOKEN no .env. Non arranco.'); process.exit(1); }
if (!AI_API_KEY) { console.error('Falta AI_API_KEY no .env. Non arranco.'); process.exit(1); }

const app = express();
app.use(cors({ origin: ORIXES_PERMITIDAS }));
app.use(express.json({ limit: '256kb' }));

/* ---------- Autenticación: segredo compartido simple ---------- */
function esixirToken(req, res, next) {
  const cabeceira = req.get('authorization') || '';
  const token = cabeceira.startsWith('Bearer ') ? cabeceira.slice(7) : null;
  if (!token || token !== IA_ACCESS_TOKEN) {
    return res.status(401).json({ erro: true, codigo: 'non_autorizado', mensaxe: 'Token non válido' });
  }
  next();
}

/* ---------- Prompts por acción ----------
   Cada un devolve { sistema, usuario, esquema } — `esquema` é só texto
   descritivo para o prompt, non validación real: se a IA non responde JSON
   válido, `proposta` cae a texto cru (ver chamarIA) en vez de romper. */
function construirPrompt(accion, receita, contexto) {
  const comensais = (contexto && contexto.comensais) || [];
  const baseReceita = receita
    ? `Receita: ${receita.nome}\nIngredientes (para ${receita.racions || 4} racións): ` +
      (receita.ingredientes || []).map(i => `${i.cant} ${i.unid} de ${i.id}`).join(', ') +
      `\nPasos actuais: ${(receita.pasos || []).join(' | ')}`
    : '';

  switch (accion) {
    case 'mellorar':
      return {
        sistema: 'Es un axudante de cociña familiar galego. Mellora a redacción de receitas mantendo o sentido e as cantidades exactas — nunca inventes ingredientes novos. Responde en galego.',
        usuario: `${baseReceita}\n\nReescribe os pasos para que sexan máis claros e doados de seguir. Responde en JSON coa forma {"pasos": ["paso 1", "paso 2", ...]}.`
      };
    case 'nutricion': {
      const local = contexto && contexto.estimacionLocal;
      return {
        sistema: 'Es un nutricionista. Traballas con estimacións por ración a partir dunha lista de ingredientes. Responde en galego, só coa forma pedida.',
        usuario: `${baseReceita}\n\n` +
          (local
            ? `Un cálculo local simple (suma de ingredientes por 100 g, sen axustar por método de cociñado) deu esta estimación por ración: ${JSON.stringify(local)}. Axústaa tendo en conta o método de cociñado real (ex.: se se fritir, non se absorbe todo o aceite listado; se se cociña en auga, parte dos nutrientes hidrosolubles pérdense).` :
            'Calcula unha estimación nutricional por ración.') +
          '\nResponde en JSON coa forma {"calorias": N, "proteinas": N, "hidratos": N, "graxas": N, "fibra": N} (números, por ración).'
      };
    }
    case 'adaptar':
      return {
        sistema: 'Suxires adaptacións dun prato para persoas concretas dunha familia, sen cambiar o prato para o resto. Responde en galego.',
        usuario: `${baseReceita}\nComensais de hoxe: ${comensais.join(', ') || 'non especificado'}.\n\nSuxire adaptacións razoables (sen un ingrediente, substitución, ou prato á parte). Responde en JSON coa forma {"suxestions": [{"persoa": "nome", "tipo": "sen|substituir|prato", "texto": "..."}]}.`
      };
    case 'redactar':
      return {
        sistema: 'Escribes receitas novas para un receitario familiar galego, en galego, con ton cercano.',
        usuario: `Escribe unha receita nova a partir desta idea: "${(contexto && contexto.idea) || 'sen idea concreta, propón algo de tempada'}".\nResponde en JSON coa forma {"nome": "...", "subtitulo": "...", "ingredientes": ["cantidade + ingrediente", ...], "pasos": ["...", "..."]}.`
      };
    case 'sobras':
      return {
        sistema: 'Suxires que facer con sobras de comida, para non tiralas. Responde en galego.',
        usuario: `${baseReceita}\n\nQue se pode facer coas sobras deste prato? Responde en JSON coa forma {"suxestions": ["idea 1", "idea 2"]}.`
      };
    default:
      return null;
  }
}

/* ---------- Chamada á IA (API compatible con OpenAI, ex. Moonshot/Kimi) ---------- */
async function chamarIA(prompt) {
  const resposta = await fetch(AI_BASE_URL.replace(/\/$/, '') + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + AI_API_KEY
    },
    body: JSON.stringify({
      model: AI_MODEL,
      temperature: 0.4,
      messages: [
        { role: 'system', content: prompt.sistema },
        { role: 'user', content: prompt.usuario }
      ]
    })
  });

  if (!resposta.ok) {
    const corpo = await resposta.text().catch(() => '');
    throw new Error('A API de IA respondeu ' + resposta.status + ': ' + corpo.slice(0, 300));
  }

  const datos = await resposta.json();
  const texto = datos && datos.choices && datos.choices[0] && datos.choices[0].message && datos.choices[0].message.content;
  if (!texto) throw new Error('A API de IA non devolveu contido');

  // A IA pode envolver o JSON en ```json ... ``` ou engadir texto arredor;
  // tentamos extraer o primeiro bloque {...} antes de renderizar en cru.
  const match = texto.match(/\{[\s\S]*\}/);
  if (match) {
    try { return { proposta: JSON.parse(match[0]), cru: false }; } catch (e) { /* segue a texto cru */ }
  }
  return { proposta: texto.trim(), cru: true };
}

/* ---------- Endpoint ---------- */
app.post('/ia/axuda', esixirToken, async (req, res) => {
  const { accion, receita, contexto } = req.body || {};
  const prompt = construirPrompt(accion, receita, contexto);
  if (!prompt) {
    return res.status(400).json({ erro: true, codigo: 'accion_descoñecida', mensaxe: 'Acción "' + accion + '" non soportada por este servidor' });
  }

  try {
    const { proposta } = await chamarIA(prompt);
    res.json({ accion, modelo: AI_MODEL, proposta });
  } catch (e) {
    console.error('[ia/axuda]', accion, e.message);
    res.status(502).json({ erro: true, codigo: 'ia_fallou', mensaxe: 'Non se puido contactar coa IA' });
  }
});

app.get('/saude', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log('Servidor de IA escoitando no porto ' + PORT));
