# VISION.md
# Que comemos hoxe
## A memoria culinaria da familia

> **Cada familia ten unha forma única de cociñar. Ese coñecemento merece conservarse.**

---

# Visión

**Que comemos hoxe** non nace para ser un simple receitario nin unha aplicación para planificar menús. O seu propósito é converterse no asistente culinario da familia: un lugar onde se conserva, organiza e mellora todo o coñecemento acumulado arredor da comida.

A aplicación debe aprender co paso do tempo, lembrar decisións pasadas, axudar a cociñar mellor e facilitar que ese patrimonio culinario poida transmitirse ás seguintes xeracións.

---

# Filosofía

A tecnoloxía nunca será o protagonista.

Debe desaparecer detrás dunha experiencia sinxela, rápida e útil.

Cada decisión de deseño deberá responder a unha única pregunta:

> **Axuda a conservar, mellorar ou transmitir o coñecemento culinario da familia?**

Se a resposta é non, probablemente esa funcionalidade non pertence ao proxecto.

---

# Obxectivos

- Planificar un único **xantar** diario.
- Manter un receitario vivo.
- Conservar fotografías, versións e historia de cada receita.
- Aproveitar mellor os alimentos.
- Axudar a manter unha alimentación equilibrada.
- Reducir o desperdicio.
- Facilitar o traballo das persoas que cociñan.
- Aprender da experiencia acumulada.

---

# Usuarios

Existe un único perfil: **cociñeiros**.

Todas as persoas que acceden á aplicación poden crear, modificar e planificar.

Os comensais nunca accederán á aplicación.

---

# Compartición diaria

Cada día poderá xerarse unha URL pública efémera para compartir por WhatsApp.

Características:

- válida só durante ese día;
- identificador aleatorio;
- non indexable;
- sen autenticación.

A páxina mostrará:

- fotografía do prato;
- descrición;
- ingredientes;
- alérxenos;
- información nutricional;
- persoas previstas para comer;
- equilibrio nutricional semanal e mensual;
- observacións do día.

---

# Receitario vivo

As receitas evolucionan.

Cada unha poderá gardar:

- ingredientes;
- elaboración;
- tempos;
- custo aproximado;
- información nutricional;
- fotografías;
- versións históricas;
- valoracións;
- adaptacións persoais.

Nunca se elimina coñecemento: créanse novas versións.

---

# Adaptacións

Unha mesma receita poderá ter variantes para distintos membros da familia sen duplicar información.

---

# Memoria culinaria

A aplicación lembrará:

- que pratos gustan máis;
- que cambios funcionaron mellor;
- quen adoita preparar cada receita;
- canto tempo leva sen cociñarse;
- valoracións históricas.

O coñecemento crecerá coa familia.

---

# Intelixencia Artificial

A IA debe actuar como un membro máis da cociña.

Será capaz de:

- redactar receitas;
- mellorar instrucións;
- calcular calorías, proteínas, hidratos, graxas e fibra;
- propoñer menús equilibrados;
- detectar excesos ou carencias;
- adaptar receitas;
- aproveitar sobras;
- crear listas da compra;
- recomendar pratos segundo a neveira, o tempo dispoñible, o orzamento, a estación e o clima.

Co paso do tempo deberá aprender os hábitos da familia.

---

# Fotografías

As fotografías forman parte da memoria culinaria.

Cada receita poderá dispoñer de:

- imaxe principal;
- galería;
- fotografías do proceso.

As imaxes poderán subirse directamente desde o móbil e substituírse en calquera momento.

---

# Modo cociñar

Modo optimizado para a cociña:

- pasos un a un;
- temporizadores;
- pantalla sempre activa;
- futura integración con control por voz.

---

# Arquitectura (visión)

O frontend será sempre unha aplicación estática, lixeira e rápida.

Toda a lóxica de negocio residirá en n8n.

Os datos almacenaranse en Supabase (PostgreSQL).

As imaxes gardaranse en Cloudflare R2.

O despregamento realizarase mediante Cloudflare Pages.

Toda integración con modelos de IA realizarase exclusivamente desde n8n.

---

# Principios

- Simplicidade por enriba da complexidade.
- O móbil é a plataforma principal.
- Sen frameworks innecesarios.
- Sen segredos no navegador.
- A IA complementa ao cociñeiro; non o substitúe.
- As receitas son patrimonio familiar.
- A aplicación debe mellorar coa experiencia.

---

# O soño

Que dentro de dez anos a aplicación non sexa só unha colección de receitas, senón un diario vivo da historia culinaria da familia: os pratos favoritos, as fotografías, as melloras, as tradicións e as lembranzas compartidas.

**Que comemos hoxe** debe converterse na verdadeira memoria culinaria da familia.
