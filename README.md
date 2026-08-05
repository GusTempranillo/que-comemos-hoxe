# Que comemos hoxe?

Aplicación web (PWA) para unha familia: receitario compartido **con adaptacións por comensal e por receita**, calendario semanal de menús, inventario da neveira e lista da compra derivada. Interface integramente en galego.

O contexto de produto está en [`resumen-ejecutivo.md`](./resumen-ejecutivo.md).

---

## Como se abre

Non hai paso de compilación nin dependencias que instalar:

```
Abre index.html no navegador.
```

Funciona igual desde `file://` (dobre clic no ficheiro) ou servida por HTTP. Se a serves, ademais actívase o service worker e pode instalarse como aplicación no móbil.

```bash
# opcional, para servila en local
python3 -m http.server 8000
```

---

## Decisións técnicas (e por que)

**Sen ferramentas de compilación.** Tailwind compílase no propio navegador e GSAP cárgase como script clásico.

**Sen CDN: as librerías van en `vendor/`.** Un CDN engade un punto de fallo que non controlamos e impide que a app funcione sen conexión — nunha cociña iso importa. Ao ir en local, a app é reproducible e non se rompe se un CDN cambia ou cae.

**Scripts clásicos, non módulos ES.** Os módulos ES non se poden cargar desde `file://` (bloquéaos a política CORS). Como o requisito era que a app funcione abrindo o ficheiro, o código está separado por ficheiros e responsabilidades, pero cárgase con `<script src>` de toda a vida sobre o espazo de nomes `QCH`.

**As ilustracións dos pratos son SVG xerado por código.** Cada receita ten unha composición propia e determinista (a mesma receita debuxa sempre o mesmo). Se ademais se define unha foto en `foto:`, píntase por riba cun fundido; se non carga, non se ve ningún oco porque a ilustración segue debaixo. Ningunha pantalla depende dunha imaxe externa.

**Mobile-first de verdade.** O deseño empeza no móbil e medra: no calendario cada oco é unha fila compacta de 88 px (no escritorio, unha grella de 7 columnas), os obxectivos táctiles nunca baixan de 40 px, e os filtros e modos desprázanse en horizontal en vez de encher a pantalla de filas.

---

## O modelo de datos

O receitario é a peza central; o calendario e a lista da compra dependen del.
Un só xantar por día, cun só cociñeiro.

```
INGREDIENTES  ← catálogo canónico (ids compartidos)
     ↑
  RECEITAS  ────→  SEMANA (7 xantares) ──→  LISTA DA COMPRA
     ↑                                     (semana − neveira)
  PERSOAS ─── adaptacións[receitaId]
```

### As adaptacións, que é o que distingue esta app

As regras **non son globais, son por persoa e por receita**. Isabel non quere cebola *na tortilla*, pero cómea *na empanada*: unha regra do tipo «Isabel: sen cebola» sería falsa. Admítense tres niveis:

| Nivel | Que fai | Exemplo |
|---|---|---|
| `sen` | Quita un ingrediente dese prato | Isabel, tortilla sen cebola |
| `substituir` | Troca un ingrediente só nese prato | Coral, chourizo → cogomelos nas lentellas |
| `prato` | Esa persoa come outra cousa ese día | Coral, tofu á prancha en vez de zorza |

### O xerador de menú

Non hai ningún modelo detrás: é un sistema de puntuación explícito (`js/xerador.js`) que valora o que hai na neveira, a variedade fronte aos días veciños, o tempo dispoñible segundo o día, e o traballo extra que dá adaptar o prato á familia. Escóllese entre os cinco mellores con algo de azar, para que dúas semanas non saian iguais.

Faise así a propósito: a familia ten que poder entender por que lle tocou ese prato. Por iso o botón **«Ver por que»** amosa os motivos de cada elección.

---

## Estrutura

```
index.html              armazón e configuración do tema
css/estilos.css         carga, animacións e accesibilidade
vendor/                 Tailwind e GSAP en local
js/
  datos/                ingredientes, receitas, familia
  utilidades.js         iconas, arte xerativa, formateo
  estado.js             estado único + localStorage + consultas derivadas
  xerador.js            puntuación e xeración do menú
  vistas/               hoxe · semana · receitario · neveira · familia · modais
  app.js                navegación, delegación de eventos, tema, avisos
sw.js, manifest.json    soporte PWA
```

Os datos gárdanse en `localStorage`; se está bloqueado, a app segue funcionando en memoria.

---

## Estado

Prototipo funcional con datos de mostra (14 receitas galegas, 8 comensais de exemplo). O seguinte paso do plan de produto é o login sinxelo para os comensais que só consultan, que aínda está sen definir.
