# DATABASE_MODEL.md
# Modelo conceptual da base de datos

> Este documento define **que información debe conservar o sistema**, non como se implementará en SQL.

---

# Principios

- Unha única fonte de verdade: **Supabase (PostgreSQL)**.
- O frontend nunca accede directamente á base de datos.
- Toda operación pasa por **n8n**.
- O coñecemento nunca se elimina; evoluciona mediante historial e versións.

---

# Entidades principais

## Persoa

Representa un membro da familia.

Campos principais:

- id
- nome
- alcume (opcional)
- activo
- observacións

---

## Receita

É o elemento central do sistema.

Cada receita almacena:

- nome
- descrición
- elaboración
- tempo de preparación
- tempo de cociñado
- dificultade
- número de racións
- custo estimado
- estado (borrador/publicada)
- data de creación
- data de actualización

Relacións:

- ingredientes
- fotografías
- versións
- adaptacións
- información nutricional
- eventos de cociñado
- valoracións

---

## Ingrediente

Catálogo único de ingredientes.

Campos:

- nome
- categoría
- unidade habitual
- estacionalidade
- observacións

---

## ReceitaIngrediente

Táboa de relación.

- receita
- ingrediente
- cantidade
- unidade
- observacións

---

## Adaptación

Permite personalizar unha receita para unha persoa concreta.

Exemplos:

- eliminar ingrediente
- substituír ingrediente
- modificar cantidades
- instrucións específicas

---

## Fotografía

Cada receita pode ter varias fotografías.

Tipos:

- principal
- proceso
- presentación
- variante

Datos:

- URL (Cloudflare R2)
- autor
- data
- descrición

---

## Versión

Nunca se perde información.

Cada cambio importante crea unha nova versión.

Campos:

- número
- autor
- data
- motivo
- resumo dos cambios

---

## Información nutricional

Por receita e por ración.

Inclúe:

- calorías
- proteínas
- hidratos
- graxas
- fibra
- sodio (futuro)
- observacións

---

## Planificación

Representa o xantar dun día.

Campos:

- data
- receita
- comensais
- responsable de cociñar
- observacións

Só existe un **xantar** por día.

---

## Evento de cociñado

Cada vez que unha receita se prepara créase un rexistro.

Permite coñecer:

- cando se cociñou
- quen a preparou
- valoración
- tempo real
- comentarios
- fotografía do resultado

Isto constitúe o diario culinario da familia.

---

## Compartición

Cada URL pública xerada por WhatsApp queda rexistrada.

Campos:

- token aleatorio
- data
- hora de caducidade
- receita
- estado

---

# Relacións conceptuais

```text
Persoa
 ├── Adaptacións
 ├── Eventos de cociñado
 └── Planificación

Receita
 ├── Ingredientes
 ├── Fotografías
 ├── Versións
 ├── Adaptacións
 ├── Nutrición
 ├── Eventos
 └── Planificación
```

---

# Datos derivados

A IA e n8n calcularán automaticamente:

- equilibrio nutricional semanal
- equilibrio mensual
- frecuencia de consumo
- custo medio
- receitas esquecidas
- ingredientes de tempada
- aproveitamento de sobras
- propostas de menú
- lista da compra

---

# Filosofía do modelo

A base de datos non garda simplemente receitas.

Garda a historia culinaria da familia:

- como evolucionan os pratos;
- quen os prepara;
- que cambios funcionan;
- que fotos os acompañan;
- que aprendizaxes se acumulan.

É a memoria viva do proxecto.
