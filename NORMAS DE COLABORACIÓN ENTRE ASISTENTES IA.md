# Normas de colaboración entre asistentes IA

> Estas normas establecen como colaborar no proxecto sen perder trazabilidade, sen inventar estado e sen pór en risco traballo doutras persoas ou asistentes.

## 1. Propósito e alcance

Estas normas aplican a Claude Code, Codex e calquera outro asistente que participe no proxecto.

O seu obxectivo é que cada cambio sexa:

- verificable;
- trazable;
- proporcionado á tarefa solicitada;
- seguro para o código, os datos e a infraestrutura;
- comprensible para quen continúe o traballo.

Non substitúen as instrucións explícitas da persoa responsable do proxecto. Se estas entran en conflito, prevalece sempre a instrución explícita da persoa responsable.

## 2. Fontes de verdade

Non existe unha única fonte de verdade para todos os tipos de información. Cada afirmación debe contrastarse coa fonte adecuada.

| Tipo de información | Fonte de verdade |
| --- | --- |
| Código, documentación, migracións e configuración non secreta versionada | Repositorio remoto de GitHub |
| Estado publicado da rama e historial de cambios | GitHub |
| Workflows activos, execucións e credenciais de n8n | Instancia de n8n |
| Datos, esquema e políticas aplicadas | Instancia de Supabase/PostgreSQL |
| Configuración e servizos en execución | VPS ou plataforma de despregamento correspondente |
| Traballo sen publicar | Copia local; nunca é unha entrega nin un relevo válido |

Os workflows de n8n, migracións e configuración de infraestrutura que deban conservarse a longo prazo deben exportarse ou describirse no repositorio sen incluír segredos.

## 3. Tipos de documentación

Para evitar contradicións, toda documentación debe deixar claro o seu carácter:

- **Visión:** intención e dirección de futuro; non proba que algo xa exista.
- **Estado actual:** comportamento comprobado no código ou na infraestrutura.
- **Decisión:** acordo de deseño vixente e o seu motivo.
- **Pendentes:** traballo que aínda non está implementado ou verificado.

Se a documentación de estado actual contradí o código ou o sistema despregado, debe corrixirse. A documentación de visión non se considera falsa por describir algo futuro.

## 4. Antes de modificar

Antes de facer unha modificación, o asistente debe comprobar a situación relevante:

```bash
git status --short
git branch --show-current
git fetch origin
```

Tamén debe comprobar que a súa rama parte dunha base recente cando a tarefa o requira. Non debe executar automaticamente `git checkout main`, `git pull`, `reset`, `clean` nin ningunha operación que poida cambiar ou borrar traballo local.

Se traballa nunha rama de tarefa ou nun worktree, debe conservar esa situación e sincronizarse segundo o fluxo da rama, non forzar o cambio a `main`.

As tarefas de só lectura —por exemplo, explicar, revisar, diagnosticar ou investigar— non requiren modificar a rama nin limpar o directorio de traballo.

## 5. Cambios locais preexistentes

Os cambios locais poden pertencer á persoa usuaria ou a outro traballo en curso. O asistente debe preservalos sempre.

- Se a tarefa toca os mesmos ficheiros ou pode interferir cos cambios existentes, debe deter a modificación e pedir indicacións.
- Se a tarefa é de só lectura ou afecta a ficheiros completamente independentes, pode continuar, indicando a existencia do estado previo cando sexa relevante.
- Nunca debe descartar, sobrescribir, facer *stash*, cambiar de rama nin mesturar cambios locais sen autorización explícita.

Os cambios locais non publicados non poden presentarse como unha entrega nin como referencia durable para outro asistente.

## 6. Desenvolvemento

Cada asistente modificará só o necesario para cumprir a tarefa solicitada.

Non debe aproveitar unha tarefa para facer refactors, cambios de estilo, actualizacións de dependencias ou “melloras” alleas ao alcance sen autorización expresa.

As decisións menores poden tomarse con criterio razoable e deben explicitarse se afectan ao comportamento. O asistente debe parar e pedir aclaración antes de:

- realizar accións destrutivas ou difíciles de reverter;
- cambiar datos reais, credenciais, permisos ou infraestrutura de produción;
- ampliar materialmente o alcance;
- tomar unha decisión de produto, seguridade ou privacidade non especificada;
- modificar unha zona que entra en conflito con cambios preexistentes.

## 7. Seguridade e segredos

Nunca se deben publicar nin revelar tokens, contrasinais, chaves de API, datos de credenciais, chaves de cifrado nin ficheiros de segredos.

As integracións deben referenciar credenciais existentes mediante identificador, nome e tipo cando sexa necesario. A documentación debe describir permisos mínimos e pasos de configuración sen copiar valores secretos.

## 8. Verificación e afirmacións

Antes de afirmar que unha funcionalidade existe ou funciona, o asistente debe comprobala na fonte correspondente:

- no código para comportamento implementado;
- en n8n para workflows, nodos e estado de activación;
- en Supabase para datos, esquema ou políticas;
- no sistema despregado para comportamento operativo.

Non se debe documentar como implementado o que só é unha proposta, unha suposición ou un ficheiro local sen publicar.

A verificación debe ser proporcionada ao risco. Non se deben executar workflows con efectos externos só para comprobar que están gardados, salvo autorización explícita.

## 9. Entregas mediante Git

Para un cambio destinado a conservarse ou a servir de relevo, o fluxo é:

```text
comprobar → desenvolver → verificar → revisar diff → commit → push → informar do hash
```

O commit debe ser pequeno, intencional e limitado á tarefa. Antes de facelo, débese revisar o *diff* e comprobar que non inclúe ficheiros ou cambios alleos.

Un cambio sen *push* pode ser útil localmente, pero non se considera entrega compartida nin relevo entre asistentes. Se non se pode publicar, debe dicirse claramente o que falta.

Non se requiren commit nin push para tarefas de só lectura, análises, propostas ou cando a persoa responsable pida expresamente non modificar nada.

## 10. Comunicación e relevo

Os asistentes poden comunicarse mediante mensaxes para coordinar intencións, decisións, riscos ou bloqueos. Non obstante, o relevo durable de código e documentación farase mediante un commit publicado.

Ao entregar un cambio, o asistente debe informar como mínimo de:

- que cambiou;
- como o verificou;
- hash do commit e rama, se se publicou;
- limitacións, riscos ou traballo pendente.

O asistente que continúe o traballo debe comprobar a rama, o historial e o código antes de asumir que a entrega existe ou ten o comportamento descrito.

## 11. Responsabilidades

As responsabilidades indican liderado e revisión preferente; non impiden colaboración puntual cando a tarefa o require.

### Claude Code

Responsable principal da experiencia de frontend:

- HTML, CSS e JavaScript;
- accesibilidade, comportamento móbil e rendemento percibido;
- estrutura de interfaz e documentación de uso.

### Codex

Responsable principal de integración e infraestrutura:

- n8n e a API de integración;
- Supabase e o modelo de datos;
- integracións con modelos de IA;
- VPS, despregamento e configuración operativa non secreta.

Calquera asistente pode realizar un cambio acoutado fóra da súa área principal cando sexa necesario para completar unha tarefa. Nos cambios que crucen áreas, deben preservarse os contratos entre frontend, API, datos e infraestrutura e explicarse os seus efectos.

## 12. Contratos entre capas

Os endpoints, formatos de datos, versións de receitas, políticas de autenticación e integracións de IA son contratos do proxecto.

Un cambio nun contrato debe incluír, segundo corresponda:

- a actualización coordinada de consumidor e provedor;
- validación de entrada e saída;
- compatibilidade ou un plan explícito de migración;
- documentación do estado actual;
- unha comprobación de que non expón segredos no navegador.

## 13. Resolución de discrepancias

Ante información contraditoria, o asistente debe seguir esta orde:

1. identificar que tipo de afirmación se está a comprobar;
2. consultar a fonte de verdade correspondente;
3. comprobar o historial de Git se se trata dun artefacto versionado;
4. documentar a discrepancia e a corrección necesaria;
5. non escoller unha versión por confianza persoal ou memoria da conversa.

Para comportamento en execución prevalece o sistema despregado. Para artefactos versionados prevalece o repositorio remoto. As mensaxes, a memoria da conversa e os cambios locais sen publicar son contexto útil, pero non proba suficiente.

## 14. Fluxo recomendado

```text
Ler a tarefa
   │
   ├─► Comprobar o estado relevante e os cambios locais
   │
   ├─► Confirmar alcance e fonte de verdade
   │
   ├─► Desenvolver só o necesario
   │
   ├─► Verificar na fonte adecuada
   │
   ├─► Revisar o diff
   │
   ├─► Commit e push, se é unha entrega
   │
   └─► Informar con feitos verificables
```

## 15. Norma final

Non se debe declarar como feito aquilo que non se comprobou na fonte correspondente.

O repositorio remoto é a referencia canónica do que está versionado; os sistemas despregados son a referencia canónica do estado operativo; e a persoa responsable do proxecto ten a última palabra sobre o alcance, as prioridades e as excepcións a estas normas.
