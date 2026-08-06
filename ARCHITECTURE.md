# ARCHITECTURE.md
# Arquitectura técnica de Que comemos hoxe

## Obxectivo

Este documento define a arquitectura técnica do proxecto e establece as decisións que deberán respectarse durante toda a súa vida útil.

A filosofía principal é manter un **frontend extremadamente sinxelo** e trasladar toda a lóxica de negocio ao backend.

---

# Arquitectura xeral

```
                Usuario
                    │
                    ▼
          Cloudflare Pages (PWA)
                    │
                 HTTPS
                    │
                    ▼
                  n8n
        ┌───────────┼────────────┐
        ▼           ▼            ▼
   Supabase     Cloudflare R2     IA
 (PostgreSQL)    (Imaxes)    (OpenAI / Claude / Gemini...)
```

---

# Frontend

O frontend é unha aplicación web estática.

Tecnoloxías:

- HTML
- CSS
- JavaScript
- Service Worker
- Web App Manifest

Non se utilizarán:

- React
- Vue
- Angular
- Node.js
- Vite
- Webpack
- procesos de compilación

O obxectivo é que a aplicación poida abrirse simplemente servindo ficheiros estáticos.

---

# Publicación

A aplicación publicarase en **Cloudflare Pages**.

Vantaxes:

- HTTPS automático
- CDN mundial
- despregamento continuo desde GitHub
- custo moi reducido
- funcionamento do Service Worker

---

# Backend

Toda a lóxica de negocio reside en **n8n**.

Responsabilidades:

- API da aplicación
- autenticación mediante token
- sincronización
- integración coa IA
- cálculo nutricional
- xeración de URL temporais
- procesamento de imaxes
- automatizacións

O frontend nunca accederá directamente á base de datos.

---

# Base de datos

Empregarase **Supabase (PostgreSQL)**.

Responsabilidades:

- receitas
- ingredientes
- usuarios
- planificación
- fotografías (metadatos)
- historial
- nutrición
- rexistro de eventos

A comunicación realizarase exclusivamente desde n8n.

---

# Almacenamento de imaxes

As fotografías gardaranse en **Cloudflare R2**.

A base de datos almacenará unicamente:

- identificador
- URL
- metadatos

As imaxes optimizaranse automaticamente.

---

# Intelixencia Artificial

Toda interacción coa IA realizarase desde n8n.

Isto permitirá cambiar de provedor sen modificar o frontend.

A IA poderá utilizar distintos modelos segundo a tarefa:

- redacción
- nutrición
- planificación
- análise

---

# Sincronización

Fluxo previsto:

1. O usuario realiza unha acción.
2. O frontend envía unha petición a n8n.
3. n8n valida o token.
4. Actualiza Supabase.
5. Se procede, invoca a IA.
6. Devolve a resposta ao frontend.

---

# Funcionamento sen conexión

A aplicación continuará funcionando grazas ao Service Worker.

Os cambios realizados almacenaranse localmente.

Ao recuperar conexión sincronizaranse automaticamente.

---

# Compartición do menú

Cada día poderá xerarse unha URL pública temporal.

O backend será responsable de:

- crear identificadores aleatorios;
- establecer caducidade;
- impedir indexación;
- eliminar ligazóns caducadas.

---

# Seguridade

Principios:

- nunca almacenar credenciais no navegador;
- comunicación sempre mediante HTTPS;
- toda a validación no backend;
- acceso á base de datos só desde n8n;
- URLs públicas con tokens aleatorios.

---

# Rendemento

Obxectivos:

- carga inicial inferior a 2 segundos;
- funcionamento fluído en móbiles;
- optimización automática de imaxes;
- mínimo tráfico de datos.

---

# Escalabilidade

A arquitectura debe permitir:

- cambiar de provedor de IA;
- ampliar a base de datos;
- incorporar novas automatizacións;
- engadir novos módulos sen modificar o frontend.

---

# Principios arquitectónicos

1. Frontend o máis simple posible.
2. Toda a lóxica en n8n.
3. Unha única fonte de verdade: Supabase.
4. As imaxes viven en R2.
5. A IA nunca se integra directamente no navegador.
6. O sistema debe seguir funcionando aínda que cambie o provedor de IA.
7. O frontend nunca debe conter información sensible.
