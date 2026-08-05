# ROADMAP.md
# Folla de ruta de Que comemos hoxe

> Este documento recolle a evolución prevista do proxecto. É unha guía viva: as prioridades poden cambiar, pero sempre respectando a visión definida en `VISION.md`.

---

# Principios

Cada nova funcionalidade debe cumprir, como mínimo, un destes obxectivos:

- Conservar a memoria culinaria da familia.
- Facilitar o traballo das persoas que cociñan.
- Mellorar a alimentación.
- Reducir o desperdicio.
- Simplificar o uso da aplicación.

---

# Fase 1 — Base do proxecto ✅

Obxectivo: dispoñer dunha aplicación funcional.

Inclúe:

- PWA.
- Receitario básico.
- Planificación do xantar.
- Funcionamento offline.
- Despregamento en Cloudflare Pages.

Estado: **Completada**.

> "Login de cociñeiros" e "Compartición do menú" pasaron á Fase 2: ambas
> precisan dun backend (n8n) que xere tokens e URLs efémeras. O frontend xa
> ten o código cliente para as dúas (`js/api.js`, `js/vistas/configuracion.js`,
> `js/publico.js`), pero se ese backend está realmente activo e accesible en
> produción non se pode confirmar dende este repositorio. Detalle en
> `TASK_PLAN.md` e `BACKEND_N8N_STATUS.md`.

---

# Fase 2 — Sincronización

Obxectivo: deixar de depender do navegador.

Tarefas:

- Integración con n8n.
- API propia.
- Sincronización automática.
- Autenticación mediante token (login de cociñeiros).
- Compartición do menú (URL pública efémera).
- Persistencia dos datos.
- Primeiros workflows.

Estado: **Completada** — os 10 workflows QCH están activos en produción; login, e persistencia de `semana`/`neveira`/`cociñeiros` verificados de punta a punta nun navegador real contra `https://qch.pages.dev` (ver `BACKEND_N8N_STATUS.md`). Quedan sen probar explicitamente a compartición de menú e o comportamento offline/reconexión.

---

# Fase 3 — Base de datos

Obxectivo: construír a memoria permanente.

Inclúe:

- Supabase.
- Modelo relacional.
- Historial.
- Versionado.
- Fotografías.
- Adaptacións.

---

# Fase 4 — Intelixencia Artificial

Converter a IA nun asistente culinario.

Capacidades:

- Redacción de receitas.
- Mellora de textos.
- Cálculo nutricional.
- Menús equilibrados.
- Adaptación de receitas.
- Aproveitamento de sobras.
- Xeración da lista da compra.
- Consellos personalizados.

---

# Fase 5 — Memoria culinaria

Crear un diario da cociña.

Cada elaboración poderá gardar:

- data;
- responsable;
- fotografías;
- cambios realizados;
- valoración;
- comentarios.

---

# Fase 6 — Fotografías

Xestión completa das imaxes.

Inclúe:

- subida desde o móbil;
- galería;
- cambio da foto principal;
- optimización automática;
- almacenamento en Cloudflare R2.

---

# Fase 7 — Nutrición

Crear un seguimento nutricional.

Mostrar:

- calorías;
- proteínas;
- hidratos;
- graxas;
- fibra;
- equilibrio semanal;
- equilibrio mensual.

A IA poderá detectar excesos e carencias.

---

# Fase 8 — Inventario e compras

Engadir:

- neveira;
- despensa;
- produtos de tempada;
- caducidades;
- lista da compra intelixente.

---

# Fase 9 — Modo cociñar

Experiencia optimizada durante a elaboración.

Inclúe:

- pasos un a un;
- temporizadores;
- pantalla sempre activa;
- futuro control por voz.

---

# Fase 10 — Aprendizaxe continua

A IA aprenderá dos hábitos da familia.

Exemplos:

- receitas favoritas;
- frecuencia de consumo;
- preferencias;
- adaptacións habituais;
- equilibrio alimentario.

As recomendacións serán cada vez máis personalizadas.

---

# Ideas futuras

- Importación de receitas desde fotografías.
- Dixitalización de receitas manuscritas.
- OCR.
- Escaneo de códigos de barras.
- Estatísticas anuais.
- Receitas de celebración.
- Receitas de tempada.
- Calendario gastronómico.
- Exportación do receitario a PDF.
- Libro familiar de receitas.
- Integración con asistentes de voz.
- Notificacións intelixentes.

---

# Criterios de prioridade

As funcionalidades implementaranse segundo:

1. Valor para os cociñeiros.
2. Simplicidade.
3. Impacto na memoria culinaria.
4. Reutilización da infraestrutura existente.
5. Facilidade de mantemento.

---

# Visión a longo prazo

O obxectivo final non é crear unha aplicación de receitas.

O obxectivo é construír unha memoria culinaria viva, que medre coa familia, aprenda da súa experiencia e conserve durante anos o seu patrimonio gastronómico.
