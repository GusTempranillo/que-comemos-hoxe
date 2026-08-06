# AI_GUIDELINES.md
# Guía para asistentes de IA

## Propósito

Este documento define as normas que deben seguir todas as IA (ChatGPT, Claude Code, Gemini, Copilot...) ao colaborar no proxecto **Que comemos hoxe**.

A prioridade non é escribir código rapidamente, senón manter unha arquitectura coherente e unha visión estable.

---

# Filosofía

A aplicación é **a memoria culinaria da familia**.

Toda decisión debe contribuír a conservar, organizar ou mellorar ese patrimonio.

Se unha proposta non achega valor a ese obxectivo, debe descartarse.

---

# Principios irrenunciables

- Non introducir frameworks (React, Vue, Angular...).
- Non introducir procesos de compilación (Vite, Webpack...).
- O frontend será sempre HTML + CSS + JavaScript.
- A aplicación debe ser unha PWA.
- O móbil é a plataforma principal.
- A experiencia de uso prima sobre a sofisticación técnica.

---

# Arquitectura

- Frontend estático publicado en Cloudflare Pages.
- Backend implementado en n8n.
- Base de datos en Supabase (PostgreSQL).
- Imaxes en Cloudflare R2.
- Toda a IA intégrase a través de n8n.

Nunca acceder directamente á base de datos desde o navegador.

---

# Seguridade

- Nunca gardar segredos nin API Keys no frontend.
- Validar sempre no backend.
- Utilizar HTTPS.
- Minimizar os datos enviados ao cliente.

---

# Deseño do código

- Código claro e lexible.
- Funcións pequenas.
- Evitar duplicación.
- Favorecer módulos independentes.
- Manter compatibilidade coas receitas existentes.

---

# Intelixencia Artificial

A IA é un asistente culinario.

Debe poder:

- redactar e mellorar receitas;
- calcular información nutricional;
- propoñer menús equilibrados;
- adaptar receitas;
- aproveitar sobras;
- aprender dos hábitos da familia.

Nunca substitúe a decisión final do cociñeiro.

---

# Receitas

As receitas son documentos vivos.

Nunca eliminar información histórica.

Empregar versións e historial.

As fotografías tamén forman parte da memoria da receita.

---

# UX

- Interface limpa.
- Poucos clics.
- Optimizada para uso cunha soa man.
- Boa visibilidade na cociña.
- Funcionar tamén sen conexión.

---

# Antes de propoñer cambios

Responder mentalmente a estas preguntas:

1. Respecta a filosofía do proxecto?
2. Mantén a arquitectura definida?
3. É útil para as persoas que cociñan?
4. Simplifica ou complica?
5. Axuda a conservar a memoria culinaria?

Se algunha resposta é negativa, reconsiderar a proposta.

---

# Norma final

As IA deben actuar como colaboradoras do proxecto, non como autoras. Deben respectar a visión definida en `VISION.md`, a arquitectura de `ARCHITECTURE.md` e o modelo conceptual de `DATABASE_MODEL.md`.
