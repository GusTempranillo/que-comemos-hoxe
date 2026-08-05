# FUNCTIONAL_SPECIFICATION.md
# Especificación funcional
## Que comemos hoxe – A memoria culinaria da familia

> Este documento describe o comportamento funcional da aplicación. Define que debe facer cada pantalla, como interactúan os usuarios e como se integra o backend, independentemente da tecnoloxía empregada.

---

# 1. Obxectivo

A aplicación permite ás persoas que cociñan:

- planificar o xantar diario;
- manter un receitario vivo;
- conservar a memoria culinaria da familia;
- recibir axuda da IA;
- compartir o menú diario cos comensais.

Os comensais **non utilizan a aplicación**.

---

# 2. Perfís de usuario

## Cociñeiro

Único perfil existente.

Pode:

- iniciar sesión;
- crear e editar receitas;
- planificar o menú;
- subir fotografías;
- solicitar axuda á IA;
- compartir o menú diario;
- consultar estatísticas.

## Comensal

Non accede á aplicación.

Recibe unha URL efémera por WhatsApp co menú do día.

---

# 3. Fluxo principal

1. O cociñeiro abre a aplicación.
2. Consulta o menú do día.
3. Pode modificalo.
4. A IA pode facer recomendacións.
5. Garda os cambios.
6. Comparte o menú.
7. Os datos sincronízanse con n8n.

---

# 4. Pantallas

## Inicio

Mostra:

- menú do día;
- fotografía;
- persoas previstas;
- información nutricional resumida;
- botón "Compartir";
- botón "Editar";
- acceso ao receitario.

---

## Receitario

Permite:

- buscar;
- filtrar;
- ordenar;
- crear receitas;
- editar;
- arquivar.

Cada receita mostra:

- foto;
- nome;
- valoración;
- última vez preparada.

---

## Ficha da receita

Contén:

- descrición;
- ingredientes;
- elaboración;
- fotografías;
- nutrición;
- adaptacións;
- versións;
- historial;
- botón "Cociñar";
- botón "Editar";
- botón "Solicitar axuda á IA".

---

## Editor de receitas

Permite modificar:

- título;
- descrición;
- ingredientes;
- pasos;
- fotografías;
- observacións.

Antes de gardar, a IA pode:

- mellorar o texto;
- revisar a claridade;
- calcular nutrición.

---

## Modo cociñar

Interface simplificada:

- un paso por pantalla;
- temporizadores;
- pantalla sempre activa;
- navegación sinxela.

---

## Planificación

Calendario mensual.

Permite:

- asignar receitas;
- cambiar días;
- repetir menús;
- ver equilibrio nutricional.

Só existe un xantar por día.

---

## Configuración

Inclúe:

- sincronización con n8n;
- token;
- preferencias;
- copia de seguridade;
- información da aplicación.

---

# 5. Compartición do menú

Ao premer "Compartir":

1. n8n crea unha URL aleatoria.
2. A URL caduca automaticamente.
3. Ábrese WhatsApp co enlace.

A páxina pública mostra:

- prato;
- fotografía;
- ingredientes;
- elaboración resumida;
- alérxenos;
- nutrición;
- persoas previstas;
- equilibrio semanal e mensual.

---

# 6. Intelixencia Artificial

A IA nunca modifica datos automaticamente.

Sempre propón cambios.

Funcións:

- redactar;
- resumir;
- traducir;
- adaptar;
- calcular nutrición;
- crear menús;
- recomendar receitas;
- aproveitar sobras.

---

# 7. Fotografías

Os cociñeiros poden:

- facer fotos coa cámara;
- seleccionar da galería;
- cambiar a foto principal;
- eliminar fotografías;
- engadir descricións.

---

# 8. Funcionamento offline

A aplicación debe:

- abrir sen conexión;
- permitir consultar receitas;
- almacenar cambios localmente;
- sincronizar ao recuperar Internet.

---

# 9. Erros

O sistema debe mostrar mensaxes claras.

Nunca perder información.

Se falla a sincronización:

- conservar cambios;
- reintentar automaticamente.

---

# 10. Requisitos non funcionais

- Interface rápida.
- Optimizada para móbil.
- Accesible.
- Navegación intuitiva.
- Tempo de carga mínimo.
- Compatible cos principais navegadores.

---

# 11. Criterios de aceptación

Considérase que unha funcionalidade está rematada cando:

- funciona correctamente;
- é sinxela de usar;
- respecta VISION.md;
- respecta ARCHITECTURE.md;
- non rompe compatibilidade;
- está documentada.

---

# 12. Visión final

O éxito do proxecto non se medirá polo número de funcionalidades, senón pola capacidade da aplicación para converterse na memoria culinaria viva da familia e nun asistente fiable para quen cociña cada día.
