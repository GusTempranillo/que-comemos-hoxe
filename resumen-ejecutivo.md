# Resumen Ejecutivo

## La idea
Web app privada (PWA) para una familia: recetario compartido con adaptaciones por persona, calendario semanal de menús y lista de la compra. Interfaz en gallego. Se descartó la integración con WhatsApp y la IA en v1, a favor de un formulario estructurado.

## Problema y público
Familia de 8 comensales con 3 cocineros que planifican y cocinan por turnos. El problema real: coordinar qué se come cada día y adaptar platos a los gustos/restricciones de cada miembro, sin resolverlo por WhatsApp. Dos perfiles: cocineros activos (ganan organización) y consultores pasivos (solo usan la app si es más fácil que preguntar).

## Propuesta de valor
Diferenciador real frente a AnyList, Paprika o Mealime: **adaptaciones por comensal y por receta**. Las reglas no son globales ("Isabel: sin cebolla") sino por plato ("Isabel: sin cebolla en la tortilla, pero sí en los pimientos de Padrón"). El modelo admite tres niveles: receta base, ajuste de ingrediente por persona, y sustitución total del plato (la carne de Coral). Ninguna app generalista hace esto bien.

## Fortalezas detectadas en el interrogatorio
- **Decisiones técnicas sensatas:** se eliminaron los dos mayores riesgos (bot de WhatsApp, IA) en cuanto se cuestionaron.
- **Diferenciador concreto y validado con casos reales**, no con abstracciones.
- **Modelo de datos bien pensado:** recetario como base de la que dependen calendario y lista de la compra.
- **Alcance pragmático:** lista de la compra "manual con ayuda" en vez de agregación automática (que exigiría normalizar unidades y aplicar ajustes: un pozo sin fondo).
- **Stack adecuado:** PWA + Claude Code, evitando stores y doble desarrollo móvil.
- **Enfoque en el usuario reacio:** diseñar para el consultor pasivo, no para el cocinero.

## Puntos débiles y preguntas sin resolver
- **El riesgo no es técnico, es de hábito:** si la familia sigue preguntando por WhatsApp "¿qué hay de comer?", la app muere.
- **Login de consultores sin definir:** debe ser fricción mínima (sesión larga o enlace mágico); sin concretar.
- **Usuario menos tecnológico no identificado** ni su plan de contingencia.
- **Sin métrica de éxito ni plazo cerrados** por el usuario (la pregunta 11 quedó sin respuesta).
- **Experiencia técnica y dedicación semanal del constructor, sin confirmar.**
- El gallego debe quedarse en la capa de interfaz, fuera del modelo de datos (apuntado, no decidido).

## Veredicto
Proyecto viable y bien acotado, con un diferenciador genuino (ajustes por persona y receta) y decisiones de alcance maduras. Recomendación final: **v1 mínima = login simple + recetario con ajustes + calendario semanal + pantalla "hoy se come"**. Lista de la compra a v2. Criterio de éxito: una semana completa planificada en la app sin que nadie pregunte por WhatsApp. Si eso ocurre, hay producto; si no, ninguna función adicional lo salvará.