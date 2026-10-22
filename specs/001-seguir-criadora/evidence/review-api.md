# Revisão da Fase 2 (API): T042

Revisor: reviewer (agente genérico com o texto de `.claude/agents/reviewer.md`), somente leitura. Nenhum arquivo foi criado, editado ou apagado e não houve commit. O E2E não foi rodado.

Escopo: os arquivos listados por `git status --porcelain --untracked-files=all` (src/, db/, scripts/db.mjs, tests/, configs, Docker, package.json, tsconfig*) e as evidências, conferidos contra AGENTS.md, a constituição, spec, plan, tasks, contratos e o enunciado.

Comandos rodados: `sha256sum -c --quiet` (saída 0) e lista de arquivos idêntica (16); `npm run lint` sem erros nem avisos; `test:unit` 20/20; `test:int` 107/107 em 7 suítes; sondagem manual contra o banco de teste (porta 3199) só com requisições inválidas ou que não gravam, depois encerrada.

## Bloqueante

Nenhum.

## Importante

### I1. Erros 413 e 415 do body-parser viram 500 `INTERNAL_ERROR`

- **Onde:** `src/common/filters/http-exception.filter.ts:63`, `:76-82` e `:66-73`. O ramo `isMalformedBody` só reconhece `exception.status === 400`; o resto cai no 500.
- **Evidência:** `POST /creators/1/followers` com corpo JSON de cerca de 200 KB, com `Content-Type: application/json; charset=latin1` e com `Content-Encoding: foo` respondeu `500 INTERNAL_ERROR`.
- **Por que importa:** são erros do cliente que o body-parser já marca como 4xx. Contraria "nenhum 5xx previsível", a US3 e o espírito de FR-014. Nenhum teste cobre (`tests/integration/validation.spec.ts:138-147` testa só o JSON malformado).
- **Correção sugerida:** tratar como `VALIDATION_ERROR` 400 todo erro que não seja `HttpException` e tenha `status` entre 400 e 499. Ordem: primeiro o qa-guardian escreve o teste que falha, depois o developer corrige o filtro.
- **Tratamento:** feito na Fase 3, junto do red do E2E; o hash é regerado em T050.

## Menor

- **M1.** Pool do `pg` sem ouvinte do evento `error` (`src/database/database.module.ts:12-17`); um cliente ocioso que perde a conexão derruba o processo, e o serviço `api` do compose não tem `restart`.
- **M2.** O log do 500 descarta o stack (`http-exception.filter.ts:66-68`); o plan proíbe stack só na resposta.
- **M3.** `strictPropertyInitialization: false` (`tsconfig.json:19`) enfraquece o strict do projeto todo por causa de um campo (`follow-creator.request.ts:7`); alternativa local: `userId!: number`.
- **M4.** `no-floating-promises` e `no-unsafe-argument` como `warn` (`eslint.config.mjs:29-30`) e `lint` sem `--max-warnings 0`.
- **M5.** Dependências de desenvolvimento sem uso, sobras do template da CLI: `@eslint/eslintrc`, `source-map-support`, `ts-loader`, `tsconfig-paths` (`package.json`).
- **M6.** O container final roda como root (`Dockerfile:9-18`, sem `USER node`).
- **M7.** Indício de implementação antes do red: `src/followers/followers.controller.ts:32` (`response.status(created ? 201 : 200)`) e os demais controllers e DTOs de resposta já nasceram completos no esqueleto da Fase 1 (mesmo mtime). O red continua válido (106 de 107 testes falharam por asserção), mas o desvio não estava registrado; registrado em `suposicoes.md`.

## Itens sem achado

1. **FR → tarefa → teste e ordem QA → DEV:** FR-001 a FR-018 têm tarefa (T022–T029) e teste com o FR no nome; tarefas [QA] T021–T031 antes das [DEV] T032–T039; o diff de `tasks.md` muda só checkboxes. FR-019 a FR-030 são da Fase 3.
2. **Endpoints iguais ao enunciado:** os três em `followers.controller.ts:18,22,36,45`, sem prefixo global, `count` antes de `:userId`; as 3 leituras extras são as da spec.
3. **Hash dos testes:** saída 0 e lista idêntica (16 arquivos); `e2e/` ainda não existe (esperado).
4. **Escrita no banco:** sem leitura antes de escrever (`followers.service.ts:14` e `:30`); `INSERT ... ON CONFLICT DO NOTHING RETURNING 1` atômico; sem contador denormalizado; `COUNT(*)::int`; sem CTE nem transação explícita; PK `(creator_id, user_id)`; todo SQL parametrizado.
5. **Erros previsíveis (fora o I1):** `23503` → `'missingReference'` → 404 com criadora primeiro; id acima de 2147483647 → 400 na rota e no corpo; a sondagem deu 400 para corpo `[]`, `null`, `text/plain`, `userId` objeto, `1e400`, URI malformada e id de 23 dígitos, e 404 `NOT_FOUND` para `PUT`, `OPTIONS`, `/creators` e path traversal.
6. **Camadas:** SQL só nos repositories; controllers só com pipe, status e DTO; `UsersController` chama o repository direto, como decidido; DTOs de resposta só com os campos do contrato.
7. **Comentários, `any`, nomes e idioma:** só falsos positivos (regex e globs); nenhum `any`, `eslint-disable` ou `ts-ignore`; mensagens ao usuário em português, logs em inglês.
8. **Segredos:** `.env.example` só com placeholders; compose com `${VAR:?}`; `.env` ignorado e fora de `git ls-files`.
9. **Página:** não se aplica nesta fase (`public/index.html` é só o esqueleto).
10. **Testes fracos:** fake só do repository, service real, asserções estritas; FR-018 com teste que muda a ordem física das linhas; as mutações (a) a (d) morreram.
11. **Over-engineering:** helpers proporcionais, sem camada ou endpoint extra; só as dependências de M5.

## Veredito

**Fase 2 aprovada, sem achados bloqueantes.** Condição: corrigir o I1 com teste que falha escrito pelo qa-guardian e correção do developer antes da revisão da Fase 3 (T058).
