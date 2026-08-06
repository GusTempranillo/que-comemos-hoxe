# NORMAS DE COLABORACIÓN ENTRE ASISTENTES IA

> Este documento é de obrigado cumprimento para Claude Code, Codex e calquera outro asistente que participe neste proxecto.

---

# 1. Autoridade

A única fonte oficial da verdade deste proxecto é o repositorio de GitHub.

Todo o que non estea publicado en GitHub considérase traballo provisional.

Ningún asistente debe asumir que existe código, documentación, infraestrutura ou funcionalidades simplemente porque outro asistente o afirme.

Sempre debe comprobar o estado real do repositorio.

---

# 2. Sincronización obrigatoria

Antes de empezar calquera tarefa é obrigatorio executar:

```bash
git fetch origin
git checkout main
git pull origin main
git status
```

Só se pode comezar a traballar cando o repositorio estea sincronizado con GitHub e o directorio de traballo estea limpo.

Se aparecen cambios locais, commits sen publicar ou conflitos, o asistente debe deter o traballo e explicalo antes de continuar.

Se a tarefa foi asignada explicitamente a unha rama de traballo xa existente (por exemplo, unha rama de feature indicada nas instrucións da tarefa), a sincronización faise contra esa rama en vez de `main`:

```bash
git fetch origin
git checkout <rama-de-traballo>
git pull origin <rama-de-traballo>
git status
```

`main` segue a ser a referencia para saber que hai xa publicado e mesturado; a rama de traballo é onde se desenvolve ata que se abra ou actualice o seu pull request.

---

# 3. Estado limpo

O estado correcto para comezar unha tarefa é ter o directorio de traballo limpo e a rama correspondente (`main`, ou a rama de traballo asignada segundo o §2) sincronizada co seu remoto:

```text
On branch <main-ou-rama-de-traballo>
Your branch is up to date with 'origin/<mesma-rama>'.

nothing to commit, working tree clean
```

Calquera outro estado require explicación antes de modificar ficheiros.

---

# 4. Desenvolvemento

Cada asistente pode modificar unicamente o necesario para completar a tarefa solicitada.

Non debe facer cambios alleos á tarefa.

Non debe aproveitar para "mellorar" outras partes do proxecto sen autorización expresa.

---

# 5. Verificación

Antes de afirmar que unha funcionalidade existe, o asistente debe comprobala no código.

Nunca debe documentar como implementado algo que realmente non existe.

Nunca debe escribir documentación baseada en supostos.

Se hai contradición entre a documentación e o código, prevalece o código.

---

# 6. Commits

Ao rematar unha tarefa é obrigatorio:

1. comprobar que o proxecto segue consistente;
2. facer un commit co traballo realizado;
3. facer push a GitHub;
4. informar do hash do commit.

O traballo non se considera rematado ata que o commit estea publicado en GitHub.

Un commit que só existe na máquina local non forma parte do proxecto.

---

# 7. Comunicación entre asistentes

Os asistentes comunícanse exclusivamente mediante Git.

Nunca mediante:

- cambios locais;
- patches cando sexa posible usar Git;
- mensaxes que afirmen a existencia de código non publicado.

O procedemento correcto é:

1. un asistente fai commit;
2. publica ese commit en GitHub;
3. o seguinte asistente fai `git pull`;
4. continúa desde ese punto.

---

# 8. Responsabilidades

## Claude Code

Responsable principal do frontend.

Pode:

- modificar HTML;
- CSS;
- JavaScript;
- documentación;
- estrutura do proxecto;
- facer commits;
- facer push.

Debe comprobar sempre que a documentación coincide co estado real do repositorio.

---

## Codex

Responsable principal da infraestrutura.

Pode traballar sobre:

- n8n;
- Supabase;
- integración co backend;
- modelos de IA;
- configuración do VPS.

Se modifica tamén o frontend, os cambios deberán publicarse en GitHub antes de considerarse válidos.

---

# 9. Cambios locais

Os cambios locais non publicados non poden utilizarse como referencia para outro asistente.

Se un asistente necesita traballar sobre cambios doutro, estes deberán estar previamente publicados en GitHub.

---

# 10. Resolución de conflitos

Se dous asistentes ofrecen información distinta:

1. comproba o estado do repositorio;
2. comproba o historial de commits;
3. comproba o código.

Nunca se debe escoller unha versión por confianza persoal.

Sempre prevalecen os feitos comprobables.

---

# 11. Infraestrutura

A infraestrutura do VPS (n8n, Supabase, modelos de IA, configuración do servidor) pode evolucionar independentemente do frontend.

A documentación sobre esa infraestrutura debe reflectir unicamente aquilo que poida verificarse ou que o responsable do proxecto confirme expresamente.

---

# 12. Principio de prudencia

Ante calquera dúbida, o asistente debe deter o traballo e solicitar aclaración.

É preferible non facer un cambio que introducir información falsa no repositorio.

---

# 13. Fluxo oficial de traballo

```text
GitHub
   │
   ├────────► git pull
   │
   ├────────► desenvolver
   │
   ├────────► verificar
   │
   ├────────► commit
   │
   ├────────► push
   │
   └────────► seguinte asistente
```

Todos os asistentes deben seguir este fluxo.

---

# 14. Norma suprema

En caso de conflito entre:

- cambios locais;
- mensaxes doutro asistente;
- documentación;
- memoria da conversa;

prevalece sempre o estado actual do repositorio de GitHub.

Ningún asistente está autorizado a ignorar esta norma.