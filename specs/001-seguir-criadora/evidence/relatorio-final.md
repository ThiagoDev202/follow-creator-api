# Relatório final (T061)

Autor: qa-guardian (executado como agente genérico com o texto de `.claude/agents/qa-guardian.md`). Data: 2026-10-22.

Neste relatório nada de `src/`, `public/`, `db/`, `scripts/`, `tests/`, `e2e/` ou configs foi editado. Não houve commit. Os números abaixo vêm de comandos rodados agora, salvo onde está escrito que vêm de uma evidência anterior.

Comandos rodados para este relatório:

- `sha256sum -c --quiet specs/001-seguir-criadora/evidence/tests.sha256`: saída 0.
- `find tests e2e jest.unit.config.ts jest.int.config.ts playwright.config.ts -type f | sort` comparado com os caminhos do hash: `diff` vazio, 23 arquivos.
- `npm run lint`: saída 0. `npm run build`: saída 0, gera `dist/main.js`.
- `npx jest -c jest.unit.config.ts --json`: 20 de 20 passaram, 0 pendentes.
- `npx jest -c jest.int.config.ts --runInBand --json`: 110 de 110 passaram em 7 suítes, 0 pendentes.
- `npx playwright test --list`: 26 testes em 4 arquivos. O E2E **não** foi executado de novo agora, porque a execução sobrescreve os screenshots de evidência. O resultado E2E vem de `verify.txt`.
- Contagem por FR: extraída dos títulos reais (JSON do Jest e lista do Playwright) com um script fora do repositório. Todos os 156 testes (20 + 110 + 26) citam ao menos um FR.

## 1. FR → testes

Arquivos: unit = `tests/unit/followers.service.spec.ts`; int = `tests/integration/<arquivo>`; e2e = `e2e/<arquivo>`. "Qtde" é o número de testes cujo título cita o FR. Um teste que cita dois FRs entra na contagem dos dois.

| FR | Qtde | Testes (arquivo: nome curto) |
|---|---|---|
| FR-001 | 4 | unit: cria a relação e informa criação (1). int `follow.spec.ts`: 201 `{ creatorId: 1, count: 1 }`; contagem passa a 1; seguir a criadora 2 não altera a criadora 1 (3) |
| FR-002 | 2 | unit: seguir de novo informa que já existia (1). int `follow.spec.ts`: segundo POST 200 com `count` 1, sem duplicar (1) |
| FR-003 | 3 | unit: remove a relação existente (1). int `unfollow.spec.ts`: 204 sem corpo e contagem 0; remove só a relação pedida (2) |
| FR-004 | 3 | unit: mesma confirmação para quem não seguia (1). int `unfollow.spec.ts`: 204 para quem não seguia; DELETE repetido 204 duas vezes (2) |
| FR-005 | 2 | int `concurrency.spec.ts`: 30 POSTs simultâneos → um 201, 29 200, `count` 1; pool com `max > 1` (verifica configuração) |
| FR-006 | 2 | int `concurrency.spec.ts`: 30 usuários simultâneos → `count` 30; pool com `max > 1` (o mesmo teste de configuração) |
| FR-007 | 1 | int `concurrency.spec.ts`: 40 POST e DELETE alternados sem 5xx e com estado coerente |
| FR-008 | 5 | unit: contagem numérica no `follow`; `getCount` real (2). int `count.spec.ts`: `{ creatorId: 1, count: 2 }` numéricos; `count` 0 numérico; conta só a criadora consultada (3) |
| FR-009 | 9 | unit: criadora inexistente em follow, unfollow e status; contagem nula (4). int `not-found.spec.ts`: 999 em POST, DELETE, count, status e `GET /creators/999` (5) |
| FR-010 | 6 | unit: usuário inexistente em follow, unfollow e status (3). int `not-found.spec.ts`: usuário 999 em POST, DELETE e status (3) |
| FR-011 | 6 | unit: ambos inexistentes em follow, unfollow e status (3). int `not-found.spec.ts`: ambos em POST, DELETE e status (3) |
| FR-012 | 8 | unit: usuário removido antes do registro; criadora removida entre o registro e a contagem; `missingReference` com ambos existentes (3). int `not-found.spec.ts`: usuário ou criadora removidos antes de seguir, deixar de seguir e contar (5) |
| FR-013 | 59 | int `validation.spec.ts`: `creatorId` inválido (`0`, `-1`, `abc`, `1.5`, `1e3`, `0x10`, `01`, `2147483648`) nas 5 rotas (40); `userId` inválido na rota de DELETE e de status (16); `2147483647` aceito em `creatorId` e `userId` (2); rota inexistente → 404 `NOT_FOUND` (1) |
| FR-014 | 14 | int `validation.spec.ts`: corpo `{}`, `"1"`, campo extra, `0`, `-1`, `1.5`, `2147483648`, `null`, booleano, JSON malformado, corpo acima do limite, charset não suportado, `Content-Encoding` não suportado (13); `2147483647` no corpo aceito (1) |
| FR-015 | 86 | int `validation.spec.ts` (70) e `not-found.spec.ts` (16): mensagem exata em português em cada erro |
| FR-016 | 2 | int `read-endpoints.spec.ts`: `GET /creators/1` e `GET /creators/2` |
| FR-017 | 3 | unit: segue e não segue (1). int `read-endpoints.spec.ts`: `true` para Ana e `false` para Bruno; `false` depois de deixar de seguir (2) |
| FR-018 | 2 | int `read-endpoints.spec.ts`: Ana, Bruno, Carla por id; ordem mantida com a ordem física das linhas trocada |
| FR-019 | 2 | e2e `page-load.spec.ts:13` estado inicial; `page-actions.spec.ts:17` seguir e deixar de seguir |
| FR-020 | 2 | e2e `page-load.spec.ts:34` `?creatorId=2`; `:45` `?creatorId=` vazio usa a criadora 1 |
| FR-021 | 4 | e2e `page-load.spec.ts:56` × 4: `999`, `abc`, `0`, `2147483648` |
| FR-022 | 4 | e2e `page-load.spec.ts:13`; `page-actions.spec.ts:46` troca de usuário; `:235` troca durante a ação; `:335` troca que falha e troca seguinte |
| FR-023 | 4 | e2e `page-load.spec.ts:13`; `page-actions.spec.ts:17` e `:46`; `page-multi-user.spec.ts:11` |
| FR-024 | 1 | e2e `page-multi-user.spec.ts:11`: dois contextos, Bruno vê "2 seguidores" |
| FR-025 | 2 | e2e `page-actions.spec.ts:80` duplo clique; `:297` dois cliques na mesma tarefa |
| FR-026 | 5 | e2e `page-actions.spec.ts:121` rede; `:151` 500 no POST; `:178` 500 no DELETE; `:206` 500 na releitura; `:335` 500 na troca de usuário |
| FR-027 | 1 | e2e `page-load.spec.ts:70`: "Carregando…" com a resposta retida |
| FR-028 | 4 | e2e `page-a11y.spec.ts:30` Tab, seta, Enter; `:58` Tab, Espaço; `:141` × 2 foco mantido com Enter e com Espaço |
| FR-029 | 3 | e2e `page-a11y.spec.ts:79` `aria-pressed` e `aria-live`; `:141` × 2 |
| FR-030 | 2 | e2e `page-a11y.spec.ts:112` × 2: 375×812 e 1280×800 |

Todo FR de FR-001 a FR-030 tem ao menos um teste. Os FRs com cobertura mais fina são:

- FR-007, FR-024 e FR-027, com 1 teste cada.
- FR-005 e FR-006: um dos 2 testes de cada um verifica configuração (`PG_POOL max > 1`), não comportamento. A exceção é deliberada e está no Complexity Tracking.
- FR-012 "durante a operação" (remoção entre o INSERT e a contagem): só o teste unitário cobre, com repositório falso. Por HTTP, o caso não é reproduzível de forma determinística (`suposicoes.md`, Prompt 4, item 12).

## 2. Resultado do verify

`evidence/verify.txt` (20:23:04) registra `npm run verify`: lint, build, `test:unit` 20/20 (1 suíte), `test:int` 110/110 (7 suítes), `test:e2e` 26/26 (Chromium, 1 worker) e `exit=0`.

Nenhum arquivo de `src/`, `public/`, `db/`, `scripts/`, `tests/`, `e2e/`, `package*.json`, `tsconfig*`, `eslint.config.mjs`, `nest-cli.json`, configs de teste, `Dockerfile` ou `docker-compose.yml` é mais novo que `verify.txt`. O verde corresponde ao código atual. Agora reconfirmei lint, build, unit e integração; o E2E foi só listado (26).

## 3. Mutações

Foram 9 mutações, de (a) a (i). Todas morreram e nenhuma sobreviveu. As de (a) a (f) são as pedidas em T041 e T056; (g), (h) e (i) foram acrescentadas na revalidação das correções I1 e I2. Detalhes em `mutacoes-api.md` e `mutacoes-e2e.md`. Em todas, a restauração foi feita com `cp` e conferida com `cmp`.

| Mut. | Alvo | Mutação | Testes que a mataram | Resultado |
|---|---|---|---|---|
| (a) | `db/schema.sql` | remover a `PRIMARY KEY` de `follows` | int 3/107: `follow` FR-002; `concurrency` FR-005 e FR-007 | Morta |
| (b) | `followers.repository.ts` | SELECT seguido de INSERT no lugar de `INSERT ... ON CONFLICT ... RETURNING` | int 2/107: `concurrency` FR-005 (26 × 200) e FR-007 (8 × 500) | Morta |
| (c) | `followers.repository.ts` | `COUNT(*)` sem `::int` | int 13/107 em 4 suítes (`count` como texto) | Morta |
| (d) | `followers.repository.ts` | remover o tratamento do `23503` | int 6/107: `not-found` FR-009 a FR-012 (POST) e `validation` FR-014 (500 em vez de 404) | Morta |
| (e) | `public/app.js` | contagem local +1/-1, sem reler do servidor | e2e 3/26: `page-actions:206` FR-026; `page-multi-user:11` FR-024; `page-actions:235` (colateral) | Morta |
| (f) | `public/app.js` | botão sem trava `busy` e sem `aria-disabled` durante a ação | e2e 2/26: `page-actions:80` e `:297` FR-025 | Morta |
| (g) | `public/app.js` | só a trava `busy` removida | e2e 2/26: `page-actions:80` e `:297` FR-025 | Morta |
| (h) | `public/app.js` | `disabled` real no lugar de `aria-disabled` | e2e 2/26: `page-a11y:141` × 2 FR-028 e FR-029 (foco perdido) | Morta |
| (i) | `public/app.js` | renderizar sem checar o usuário selecionado e seletor habilitado | e2e 1/26: `page-actions:235` FR-022 | Morta |

**Placar: 9 mortas e 0 sobreviventes.**

Ressalvas que conferi:

- Nenhuma mutação foi morta pelo teste unitário: ele usa repositório falso. A proteção do SQL e do schema vem só da integração.
- (a) a (d) rodaram às 18:41 contra a suíte de 107 testes de integração, antes das mudanças posteriores em `src/common/filters/http-exception.filter.ts`, `src/database/database.module.ts` e `src/followers/dto/follow-creator.request.ts` (mtimes mais novos que o hash final). O repository e o schema alvos dessas mutações não mudaram depois. Ainda assim, (a) a (d) **não foram re-executadas** contra o código final. Não as rodei de novo agora, porque a instrução desta tarefa proíbe tocar em `src/` e `db/`. O raciocínio de que a (d) continuaria morta é o seguinte: o erro do `pg` não tem `status` 4xx, então o filtro novo ainda o transformaria em 500. É uma inferência, não um fato medido.
- (b) só morre com concorrência real. Nenhum teste sequencial distingue SELECT + INSERT do INSERT atômico; uma máquina muito lenta ou um pool serializado poderia deixá-la viver.
- (i) foi morta por um único teste; (e) por dois testes reais e um colateral.
- Sem mutação: `PositiveIntPipe`, `ValidationPipe`, `HttpExceptionFilter`, o caminho do DELETE, `isFollowing`, `CreatorsRepository` e `UsersRepository` (o `ORDER BY` tem teste dedicado em FR-018, mas não foi mutado), a variante de (d) que trata qualquer erro como `missingReference` e o `aria-live` da página.

## 4. Definição de pronto

Fontes: AGENTS.md (seção "Pronto") e a constituição ("Definição de pronto"), com os mesmos 7 itens. Acrescentei 2 padrões de AGENTS.md pedidos para esta checagem (comentários e `any`).

- [x] **`npm run verify` verde.** `verify.txt` termina com `exit=0` (20 unit, 110 int, 26 E2E). Nenhum arquivo de código, teste ou config é mais novo que ele. Reconfirmado agora: lint 0, build 0, unit 20/20, int 110/110; E2E listado com 26, sem nova execução (ver seção 2).
- [x] **Todo FR com teste.** FR-001 a FR-030 têm de 1 a 86 testes (tabela da seção 1) e nenhum teste deixa de citar um FR. Ressalva: o teste de `PG_POOL` verifica configuração, e FR-012 "durante a operação" só tem cobertura unitária.
- [x] **Mutações mortas.** 9 de 9 mortas, 0 sobreviventes. Ressalva: (a) a (d) não foram re-executadas depois das últimas mudanças no filtro, no pool e no DTO (seção 3).
- [x] **Hash dos testes inalterado após a implementação.** Conferido agora: `sha256sum -c --quiet` deu saída 0, a lista de arquivos é idêntica (23) e nenhum arquivo de `tests/` ou `e2e/` é mais novo que `tests.sha256` (20:10:39). Os arquivos de implementação mais novos que o hash são `public/app.js`, `public/styles.css`, `src/common/filters/http-exception.filter.ts`, `src/database/database.module.ts` e `src/followers/dto/follow-creator.request.ts`: a implementação veio depois do hash, e os testes não mudaram.

  O hash foi gerado 3 vezes, ou seja, regerado 2 vezes, sempre pelo qa-guardian, depois de um red novo e antes da implementação correspondente:
  1. T031 (Fase 2): 16 arquivos. Conferido em T040 (`mutacoes-api.md`) e na revisão da API (`review-api.md`).
  2. T050 (19:02:59): depois do red do E2E e dos 3 testes novos de FR-014 (I1 da revisão da API), com 23 arquivos. Conferido pelo reviewer em `review-e2e.md` (20:07).
  3. 20:10:39: depois do red das correções I1 e I2 da revisão da Fase 3. Os testes novos ou alterados ficaram em arquivos que já existiam, então continuam 23. Conferido em `mutacoes-e2e.md` e agora.

  O hash final bate com os testes finais.

  Limites dessa prova:
  - As versões anteriores de `tests.sha256` foram sobrescritas e não estão no git, então a sequência acima só se comprova pelo texto das evidências e pelos mtimes.
  - A conferência de T043, no início da Fase 3, não tem saída salva própria.
  - Mudanças de teste entre 18:49 e 19:02:59 foram feitas pelo qa-guardian no seu red, sem outra prova além da ordem documentada.
- [x] **Evidências salvas.** Em `specs/001-seguir-criadora/evidence/`:
  - `analyze.md`, `setup.md`, `suposicoes.md`
  - `red-api.txt`, `red-e2e.txt` (red da Fase 3 e red das correções I1/I2)
  - `tests.sha256`, `mutacoes-api.md`, `mutacoes-e2e.md`
  - `review-api.md`, `review-e2e.md`, `verify.txt`
  - `inicial.png`, `seguindo.png`, `erro.png` (PNG 1280×720 válidos)
  - `relatorio-final.md`

  `bloqueios.md` não existe porque não houve bloqueio. Ressalva: com exceção de `analyze.md` e `suposicoes.md`, as evidências ainda não estão versionadas (não há commit desta fase).
- [x] **README só com comandos que existem.** Os comandos `npm run` citados (`db:up`, `db:down`, `verify`, `test:unit`, `test:int`, `test:e2e`, `lint`, `build`, `start:dev`, `db:setup`, `db:setup:test`) existem todos em `package.json`; `npm start`, que existe, não é citado. Os comandos Docker (`docker compose up -d --build`, `docker compose stop api`) batem com o compose: `docker compose config -q` deu saída 0, com os serviços `db` e `api`. Os arquivos citados existem: `cp .env.example .env`, `.nvmrc`, `contracts/http-api.md` e os 5 links de ADR. `npm ci` e `npx playwright install chromium` são comandos das ferramentas. Não subi o compose agora; os curls do README foram executados pelo developer (`suposicoes.md`, item 39).
- [x] **Nenhum segredo no histórico.** Conferi:
  - `git ls-files | grep -E '\.env$'` vazio. Nenhum `.env` entre os arquivos não ignorados nem em nenhum commit.
  - `.env` está na linha 1 do `.gitignore` (`git check-ignore -v .env` confirma).
  - `.env.example` só tem `change_me`, e o compose usa `${VAR:?}`.
  - Nenhuma URL `postgres://` com credencial literal fora do `change_me`.

  Ressalva sobre o critério literal: `git log -p --all | grep -iE "password|secret|token"`, que o PROMPTS.md espera "sem resultado", devolve 23 linhas. Conferi todas, e são falsos positivos: nomes de variável (`POSTGRES_PASSWORD`), a palavra "token" em ADR, plan, tasks e `PROMPTS.md`, skills e templates do Spec Kit, `common.sh`. O mesmo vale para o grep nos arquivos versionáveis. O histórico atual tem só os 4 commits de documentação; o código ainda não foi commitado, então a checagem precisa ser repetida no commit.
- [x] **Zero comentários no código.** Rodei grep de `//`, `/*` e `<!--` em `src/`, `tests/`, `e2e/`, `public/`, `scripts/`, `db/`, nos configs `.ts`, `eslint.config.mjs`, `tsconfig*.json`, `nest-cli.json`, `Dockerfile` e `docker-compose.yml`; também de `#` no Dockerfile, no compose, no `.dockerignore` e no `.env.example`, e de `--` nos `.sql`. Só sobraram falsos positivos: a regex `/^\//` em `tests/helpers/env.ts:7` e `scripts/db.mjs:19`, os globs `**/*.spec.ts` dos configs do Jest e de `tsconfig.build.json` e a URL do `$schema` em `nest-cli.json`.
- [x] **Sem `any`.** `grep -w any` em `src/`, `tests/` e `e2e/` vazio. Nada de `eslint-disable`, `ts-ignore`, `ts-expect-error` ou `ts-nocheck`. `no-explicit-any` está como `error`, com lint `--max-warnings 0`. Também não há `.skip`, `.only`, `waitForTimeout` ou `setTimeout` em `tests/` e `e2e/`, e o Playwright roda com `retries: 0`.

**Itens não atendidos: nenhum.** Os itens marcados têm as ressalvas escritas acima, que não invalidam o critério mas limitam a prova.

## 5. Lacunas e riscos conhecidos

O que não foi verificado:

- E2E só em Chromium: sem Firefox, WebKit nem dispositivo móvel real. FR-030 foi testado só por largura de viewport (375 e 1280), sem zoom nem orientação.
- Sem teste de carga ou desempenho. A concorrência foi testada com 30 a 40 pedidos simultâneos num processo só.
- Sem autenticação nem autorização (fora de escopo, ADR 0004): qualquer cliente age em nome de qualquer usuário.
- FR-029 foi verificado por atributos (`aria-pressed`, `aria-live="polite"`, `role="alert"`), não com leitor de tela real.
- Falha não-404 no carregamento inicial (500 ou rede em `/users`, `/creators/:id` ou na contagem) não tem E2E. O comportamento existe (`suposicoes.md`, item 29), mas não foi especificado nem testado.
- Foco depois de uma ação que falha não foi verificado. A trava `busy` só é exercida por cliques, sem Enter ou Espaço repetidos durante a ação.
- `docker compose up` não foi re-executado por este relatório. Valem as execuções relatadas em `setup.md` e em `suposicoes.md` (itens 36 e 39).
- As mutações (a) a (d) não foram re-executadas sobre o código final (seção 3).

Processo:

- Os subagentes do projeto (`developer`, `qa-guardian`, `reviewer`) não foram carregados pela sessão, porque foram criados depois do último reinício do Claude Code. Todos os papéis, inclusive este relatório, rodaram como agentes genéricos que receberam o texto de `.claude/agents/*.md`. As restrições de ferramentas e de diretórios dos agentes foram respeitadas por instrução, não impostas pela plataforma.
- reviewer e qa-guardian são convenção, não bloqueio técnico: nada impede o developer de editar `tests/`. A garantia vem do hash, dos mtimes e das revisões, e o hash pode ser regerado por qualquer um.
- As correções I1 e I2 da Fase 3 e a Fase 4 (README, ADRs) não passaram por nova revisão do reviewer. `review-e2e.md` (20:07) é anterior às correções; elas foram validadas só pelo red e pelas mutações (g) a (i) do qa-guardian e pelo verify. A falta de [REV] na Fase 4 já tinha sido apontada em `analyze.md` (menor 13).

O que o reviewer apontou e foi tratado:

- Revisão da API, I1: os erros 413 e 415 do body-parser viravam 500. Primeiro vieram 3 testes de FR-014 em red (`red-e2e.txt`, 500 em vez de 400), depois o filtro foi corrigido e o teste ficou verde.
- Revisão da Fase 3, I1: a troca de usuário durante uma ação mostrava o estado errado. Teste `page-actions:235` em red, correção em `app.js`, mutação (i) morta.
- Revisão da Fase 3, I2: o foco se perdia depois da ação. Testes `page-a11y:141` × 2 em red, `aria-disabled` no lugar de `disabled`, mutação (h) morta.
- Menores da revisão da API, tratados segundo `suposicoes.md` (item 36) e conferidos agora no código:
  - `pool.on('error')` em `src/database/database.module.ts`;
  - stack do 500 só no log;
  - `strictPropertyInitialization` voltou ao padrão, com `userId!` no DTO;
  - lint com `--max-warnings 0`;
  - dependências sem uso removidas de `package.json`;
  - `USER node` no `Dockerfile`.
- Menores da revisão da Fase 3:
  - M1 (erro da troca de usuário) tratado: a área de erro é limpa na troca, teste `page-actions:335`;
  - M2 (`?creatorId=2147483648`) coberto por `page-load:56`;
  - M3 (trava `busy` sem teste) coberto por `page-actions:297` e pela mutação (g).

Achados menores que continuam abertos:

- Duplicação entre `e2e/global-setup.ts` e `tests/helpers/global-setup.ts` (Fase 3, M4), aceita e registrada.
- O lint não cobre `public/app.js`, `scripts/db.mjs`, `playwright.config.ts` nem os configs do Jest (Fase 3, M5; o glob é `{src,tests,e2e}/**/*.ts`), aceito e registrado.
- `no-floating-promises` e `no-unsafe-argument` continuam `warn` em `eslint.config.mjs`. Na prática são barreira por causa do `--max-warnings 0`.
- O serviço `api` do compose não tem `restart` (parte da M1 da API). O ouvinte de `error` do pool foi adicionado, mas um crash não reinicia o container.
- M7 da API: controllers e DTOs de resposta nasceram completos no esqueleto da Fase 1. O red continuou válido (106 de 107 falharam por asserção) e o desvio ficou registrado.
- Menores de `analyze.md` não resolvidos:
  - `spec.md` continua com `Status: Draft`;
  - spec e plan citam a branch `001-seguir-criadora`, mas o trabalho é em `main`;
  - `created_at` e o índice `follows_user_id_idx` não servem a nenhum FR;
  - o teste de rota inexistente (404 `NOT_FOUND`) cita FR-013 e FR-015, mas esse comportamento não está na spec;
  - os sufixos `.request.ts`, `.response.ts` e `.error.ts` não seguem os schematics do Nest.
- Os testes novos que já passaram no red das correções I1/I2 (`page-actions:297` e `page-load:56` com `2147483648`) são de regressão, sem red próprio. O de `:297` foi validado depois pela mutação (g).
