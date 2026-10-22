---

description: "Tarefas da feature seguir-criadora"
---

# Tasks: Seguir criadora

**Input**: `specs/001-seguir-criadora/` (spec.md, plan.md, data-model.md, contracts/, research.md, quickstart.md)

**Prerequisites**: plan.md, spec.md, constitution (`.specify/memory/constitution.md`), AGENTS.md

**Tests**: obrigatórios (TDD). Em cada fase, as tarefas [QA] de teste e red vêm antes das tarefas [DEV] de implementação.

**Organization**: quatro fases fixadas pelo autor (setup, API, página + E2E, documentação). A fase da API entrega US1 (P1) e US3 (P3); a fase da página entrega US2 (P2).

## Format: `- [ ] [ID] [P?] [Story?] [Dono] Descrição com caminho`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[US1]**, **[US2]**, **[US3]**: história de spec.md
- **Dono**: **[QA]** = qa-guardian (único autor de `tests/` e `e2e/`); **[DEV]** = developer (`src/`, `public/`, `db/`, `scripts/`, Docker, configuração, `README.md` e `docs/adr/`); **[REV]** = reviewer (somente leitura)
- Evidências em `specs/001-seguir-criadora/evidence/` (abreviado `evidence/`)
- Todo teste cita no nome o FR-xxx que cobre
- Nenhum agente faz commit ou push

---

## Phase 1: Setup [DEV]

**Purpose**: projeto compilando, compose subindo, esqueleto completo sem comportamento.

- [ ] T001 [DEV] Gerar o projeto com a CLI oficial do NestJS num diretório temporário (npm, sem git: `npx @nestjs/cli new <tmp> --package-manager npm --skip-git`), copiar para a raiz sem sobrescrever o `.gitignore` existente (mesclar o que faltar), descartar o `README.md` gerado e remover o que o plan não usa: `src/app.controller.ts`, `src/app.service.ts`, `src/app.controller.spec.ts`, pasta `test/`, bloco `jest` e scripts não listados em `package.json`
- [ ] T002 [DEV] Instalar dependências de produção (`@nestjs/serve-static`, `class-validator`, `class-transformer`, `pg`, `dotenv`) e de desenvolvimento (`@types/pg`, `@playwright/test`) em `package.json` e `package-lock.json`
- [ ] T003 [DEV] Configurar `tsconfig.json` (`"strict": true`, incluindo `src`, `tests`, `e2e` e configs `.ts`), `tsconfig.build.json` (só `src`) e `eslint.config.mjs` (`@typescript-eslint/no-explicit-any: error`, sem o comentário `// @ts-check`)
- [ ] T004 [P] [DEV] Criar `.nvmrc` com `24` e `"engines": { "node": ">=24 <25" }` em `package.json`
- [ ] T005 [P] [DEV] Criar `.env.example` com exatamente os placeholders do plan (PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, DATABASE_URL, DATABASE_URL_TEST) e copiar para `.env` local (já no `.gitignore`, nunca versionado)
- [ ] T006 [P] [DEV] Criar `db/schema.sql` idempotente com `users`, `creators` e `follows` exatamente como no plan: `PRIMARY KEY (creator_id, user_id)`, FKs `ON DELETE CASCADE`, `created_at timestamptz NOT NULL DEFAULT now()`, índice em `follows(user_id)` e nenhum índice separado em `creator_id`
- [ ] T007 [P] [DEV] Criar `db/seed.sql` idempotente: usuários 1 Ana, 2 Bruno, 3 Carla e criadoras 1 Luna Prado, 2 Mel Duarte com `ON CONFLICT (id) DO NOTHING`, depois `setval(pg_get_serial_sequence(...), MAX(id))` em `users` e `creators`
- [ ] T008 [P] [DEV] Criar `db/init/01-test-db.sql` com `CREATE DATABASE seguir_criadora_test;`
- [ ] T009 [DEV] Criar `scripts/db.mjs` (JS puro com `dotenv`): `setup` aplica schema e seed em `DATABASE_URL` (ou `DATABASE_URL_TEST` com `--test`); `rebuild` só aceita `--test`, recusa sem a flag, recusa também antes de conectar se `DATABASE_URL_TEST` estiver ausente, for igual a `DATABASE_URL` ou tiver nome de banco que não termine em `_test`, faz `DROP TABLE IF EXISTS follows, users, creators` e reaplica schema e seed em `DATABASE_URL_TEST`
- [ ] T010 [P] [DEV] Criar `Dockerfile` multi-stage `node:24-alpine` (build: `npm ci`, `npm run build`; final: `npm ci --omit=dev` com só `dist/`, `public/`, `db/`, `scripts/`) e `.dockerignore` com `node_modules`, `dist`, `.env`, `tests`, `e2e`, `specs`, `coverage`, `test-results`, `playwright-report`
- [ ] T011 [DEV] Criar `docker-compose.yml` com `db` (`postgres:17`, `5433:5432`, volume nomeado, healthcheck `pg_isready`, credenciais do `.env` com `${VAR:?}`, `./db/init` em `/docker-entrypoint-initdb.d`) e `api` (build, `3000:3000`, `depends_on` db saudável, `PORT=3000`, `DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}`, comando `sh -c "node scripts/db.mjs setup && node dist/main"`), sem credencial fixa
- [ ] T012 [DEV] Definir em `package.json` exatamente os scripts da tabela do plan: `db:up`, `db:down`, `db:setup`, `db:setup:test`, `build`, `start`, `start:dev`, `lint` (sem `--fix`), `test:unit`, `test:int`, `test:e2e`, `verify`
- [ ] T013 [P] [DEV] Criar `jest.unit.config.ts` (`tests/unit`) e `jest.int.config.ts` (`tests/integration`, `setupFiles` com `tests/helpers/env.ts`, `globalSetup` com `tests/helpers/global-setup.ts`; esses arquivos são escritos pelo qa-guardian na Fase 2)
- [ ] T014 [P] [DEV] Criar `playwright.config.ts`: só Chromium, `testDir: 'e2e'`, `workers: 1`, `retries: 0`, `trace: 'retain-on-failure'`, `baseURL` `http://localhost:3100`, `webServer` com `npm run build && node dist/main`, `PORT=3100`, `DATABASE_URL` = `DATABASE_URL_TEST`, `reuseExistingServer: false`, `url` `http://localhost:3100`, `timeout` 120000, `import 'dotenv/config'` no topo e erro se `DATABASE_URL_TEST` estiver ausente ou igual a `DATABASE_URL`, `globalSetup` em `e2e/global-setup.ts` (escrito pelo qa-guardian na Fase 3)
- [ ] T015 [DEV] Criar `src/main.ts`, `src/app.module.ts` e `src/database/database.module.ts` conforme o plan: `main.ts` com `dotenv/config`, `enableShutdownHooks` e `listen(PORT)`; `AppModule` com `ServeStaticModule` (`renderPath: '/'`, sem fallback de SPA) e `APP_FILTER` do `HttpExceptionFilter` (o `APP_PIPE` com o `ValidationPipe` entra na Fase 2, junto dos decoradores do DTO); `PG_POOL` exportado como `export const PG_POOL = 'PG_POOL'`, `PG_POOL` com `max: 20`, `statement_timeout: 5000`, `idleTimeoutMillis: 10000`, `pool.end()` em `onApplicationShutdown`)
- [ ] T016 [P] [DEV] Criar esqueleto de `src/common/errors/creator-not-found.error.ts`, `src/common/errors/user-not-found.error.ts`, `src/common/filters/http-exception.filter.ts` e `src/common/pipes/positive-int.pipe.ts`; o filtro responde sempre 500 `INTERNAL_ERROR` `Erro interno.` e o pipe repassa o valor sem validar (assim o red falha por asserção, e não por setup)
- [ ] T017 [P] [DEV] Criar esqueleto de `src/followers/` (module, controller com as 4 rotas do plan e `followers/count` antes de `followers/:userId`, service, repository e `dto/follow-creator.request.ts` sem decoradores de validação, `dto/followers-count.response.ts`, `dto/follow-status.response.ts`); services e repositories lançam `NotImplementedException`
- [ ] T018 [P] [DEV] Criar esqueleto de `src/creators/` (module, controller, service, repository, `dto/creator.response.ts`) e `src/users/` (module, controller, repository, `dto/user.response.ts`, sem service); services e repositories lançam `NotImplementedException`
- [ ] T019 [P] [DEV] Criar `public/index.html` mínimo (só estrutura do documento, sem comportamento), para o estático ter raiz
- [ ] T020 [DEV] Validar o setup: `npm run build` e `npm run lint` verdes; `docker compose up -d --build` com `db` saudável e `api` respondendo; `npm run db:setup:test` e `node scripts/db.mjs rebuild` (sem `--test`) recusando; relatar em `evidence/setup.md`

**Checkpoint**: projeto compila, compose sobe, nenhum comportamento implementado.

---

## Phase 2: API — US1 (P1) e US3 (P3) 🎯 MVP

**Goal**: contrato do enunciado e leituras extras funcionando, idempotentes e corretos sob concorrência e entradas inválidas.

**Independent Test**: `npm run test:unit` e `npm run test:int` verdes contra o banco de teste.

### Testes e red [QA] (antes de qualquer implementação)

- [ ] T021 [QA] Criar `tests/helpers/env.ts` (carrega `.env`, define `DATABASE_URL = DATABASE_URL_TEST`, aborta se ausente, igual a `DATABASE_URL` ou com nome de banco que não termine em `_test`, e só depois define `DATABASE_URL = DATABASE_URL_TEST`; idempotente), `tests/helpers/database.ts` (importa `./env` primeiro; `TRUNCATE follows, users, creators RESTART IDENTITY CASCADE` + `db/seed.sql`) e `tests/helpers/global-setup.ts` (roda `node scripts/db.mjs rebuild --test`)
- [ ] T022 [P] [US1] [QA] Testes unitários de `FollowersService` com `Test.createTestingModule` e `{ provide: FollowersRepository, useValue: <fake em memória> }` em `tests/unit/followers.service.spec.ts`: criado (FR-001), existente (FR-002), unfollow (FR-003, FR-004), `missingReference` → `CreatorNotFoundError` / `UserNotFoundError` / ambos → criadora (FR-009, FR-010, FR-011), unfollow com criadora ou usuário inexistente (FR-009, FR-010), contagem nula → `CreatorNotFoundError` (FR-009), criadora removida entre o INSERT e a contagem → `CreatorNotFoundError` (FR-012), contagem numérica no retorno de `follow` (FR-008), `missingReference` com criadora e usuário existentes → `CreatorNotFoundError` (FR-012)
- [ ] T023 [P] [US1] [QA] Integração de seguir em `tests/integration/follow.spec.ts`: 201 `{ creatorId: 1, count: 1 }` (FR-001), segundo POST 200 com `count` 1 (FR-002)
- [ ] T024 [P] [US1] [QA] Integração de deixar de seguir em `tests/integration/unfollow.spec.ts`: 204 sem corpo e contagem 0 (FR-003); 204 para quem não seguia (FR-004)
- [ ] T025 [P] [US1] [QA] Integração de contagem em `tests/integration/count.spec.ts`: `{ creatorId: 1, count: 2 }` com Ana e Bruno seguindo e `typeof count === 'number'` (FR-008)
- [ ] T026 [P] [US1] [QA] Integração das leituras extras em `tests/integration/read-endpoints.spec.ts`: `GET /creators/1` → `{ id: 1, name: 'Luna Prado' }` (FR-016); `GET /creators/1/followers/:userId` → `{ following: true }` / `{ following: false }` (FR-017); `GET /users` → Ana, Bruno, Carla em ordem de id (FR-018)
- [ ] T027 [P] [US3] [QA] Integração de inexistentes em `tests/integration/not-found.spec.ts`: criadora 999 em POST, DELETE, count, status e `GET /creators/999` → 404 `CREATOR_NOT_FOUND` "Criadora não encontrada." (FR-009, FR-015); usuário 999 em POST, DELETE e status → 404 `USER_NOT_FOUND` "Usuário não encontrado." (FR-010, FR-015); ambos inexistentes → `CREATOR_NOT_FOUND` (FR-011); usuário e criadora removidos do banco antes da operação → 404 com o `code` certo (FR-012; o caso de remoção entre o INSERT e a contagem é coberto pelo teste unitário de T022)
- [ ] T028 [P] [US3] [QA] Integração de entradas inválidas em `tests/integration/validation.spec.ts`: ids `0`, `-1`, `abc`, `1.5`, `1e3`, `0x10`, `01`, `2147483648` em `creatorId` e `userId` de rota → 400 `VALIDATION_ERROR` "Requisição inválida." (FR-013, FR-015); corpo `{}`, `{ "userId": "1" }`, campo extra e JSON malformado → 400 `VALIDATION_ERROR` e nada gravado (FR-014, FR-015); rota inexistente → 404 `NOT_FOUND`
- [ ] T029 [P] [US3] [QA] Integração de concorrência em `tests/integration/concurrency.spec.ts` com `Promise.all`: 30 POSTs do mesmo usuário → exatamente um 201, 29 200 e `count` 1 (FR-005); 30 usuários inseridos no teste seguindo a mesma criadora → `count` 30 (FR-006); 40 POST/DELETE alternados do mesmo usuário → nenhum 5xx, no máximo 1 linha em `follows` e `GET /creators/:id/followers/:userId` coerente com o banco (FR-007); `PG_POOL` com `max > 1` (FR-005, FR-006; única exceção deliberada à regra de teste de comportamento, existe para os testes de concorrência não ficarem vazios e já passa no red). A app dos testes de integração é criada com `Test.createTestingModule({ imports: [AppModule] }).createNestApplication()`, sem repetir pipe nem filtro, e iniciada com `app.listen(0)`
- [ ] T030 [QA] Rodar `npm run lint` e deixar `tests/` sem erros de lint e formatação; depois provar o red: `npm run test:unit` e `npm run test:int`, confirmar que falham por asserção de comportamento (não por import, sintaxe ou setup) e salvar a saída em `evidence/red-api.txt`
- [ ] T031 [QA] Gerar o hash, que cobre `tests/`, `e2e/` e os configs do Jest e do Playwright: `find tests e2e jest.unit.config.ts jest.int.config.ts playwright.config.ts -type f 2>/dev/null | sort | xargs sha256sum > specs/001-seguir-criadora/evidence/tests.sha256`

### Implementação [DEV] (sem tocar em `tests/`)

- [ ] T032 [US1] [DEV] Implementar `CreatorNotFoundError`, `UserNotFoundError` e o `HttpExceptionFilter` com a tabela de erros do plan (400 `VALIDATION_ERROR`, inclusive JSON malformado do body-parser; 404 `CREATOR_NOT_FOUND`, `USER_NOT_FOUND`, `NOT_FOUND`; 500 `INTERNAL_ERROR` com log em inglês e sem stack) em `src/common/errors/` e `src/common/filters/http-exception.filter.ts`
- [ ] T033 [P] [US3] [DEV] Implementar `PositiveIntPipe` (`/^[1-9]\d*$/` e `<= 2147483647`, senão `BadRequestException`) em `src/common/pipes/positive-int.pipe.ts` e registrar o `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`) com `APP_PIPE` em `src/app.module.ts`
- [ ] T034 [US1] [DEV] Implementar `FollowersRepository` com o SQL exato do plan (`insertFollow` com `ON CONFLICT DO NOTHING RETURNING 1` e `23503` → `'missingReference'`, `deleteFollow`, `findExistence`, `countFollowers` com `COUNT(*)::int`, `isFollowing`) em `src/followers/followers.repository.ts`
- [ ] T035 [US1] [DEV] Implementar `FollowersService` (`follow`, `unfollow`, `getCount`, `getStatus`, criadora verificada primeiro) em `src/followers/followers.service.ts`
- [ ] T036 [US1] [DEV] Implementar `FollowersController` (201/200 via `@Res({ passthrough: true })`, 204 no DELETE, `PositiveIntPipe` nos parâmetros), `FollowCreatorRequest` com `@IsInt() @Min(1) @Max(2147483647)` e os DTOs de resposta em `src/followers/followers.controller.ts` e `src/followers/dto/`
- [ ] T037 [P] [US1] [DEV] Implementar `CreatorsRepository.findById`, `CreatorsService.getById` e `CreatorsController` em `src/creators/`
- [ ] T038 [P] [US1] [DEV] Implementar `UsersRepository.findAll` (`ORDER BY id`) e `UsersController` em `src/users/`
- [ ] T039 [DEV] Rodar `npm run lint`, `npm run build`, `npm run test:unit` e `npm run test:int` até verde; relatar mudanças e desvios do plan

### Validação [QA] e revisão [REV]

- [ ] T040 [QA] Rodar `sha256sum -c specs/001-seguir-criadora/evidence/tests.sha256` e conferir que `find tests e2e jest.unit.config.ts jest.int.config.ts playwright.config.ts -type f | sort` lista exatamente os arquivos do hash; divergência (inclusive arquivo novo ou removido) é bloqueante
- [ ] T041 [QA] Mutações, uma por vez, com cópia em `/tmp`, suíte rodada, ao menos um teste falhando, restauração com `cp` e conferência com `cmp`: (a) remover a `PRIMARY KEY` de `follows` em `db/schema.sql`; (b) trocar o `INSERT ... ON CONFLICT RETURNING` por SELECT seguido de INSERT em `src/followers/followers.repository.ts`; (c) remover o `::int` do COUNT; (d) remover o tratamento do `23503`; registrar em `evidence/mutacoes-api.md` com a tabela FR → testes
- [ ] T042 [REV] Revisar os arquivos da fase (`git status --porcelain --untracked-files=all`, lendo-os diretamente), incluindo os scripts `test:*` do `package.json`, contra AGENTS.md e a constituição (itens 1 a 11 do reviewer), sem rodar o E2E, e salvar em `evidence/review-api.md`

**Checkpoint**: API completa, testes verdes, hash íntegro, mutações (a) a (d) mortas.

---

## Phase 3: Página + E2E — US2 (P2)

**Goal**: página da criadora com seguir/deixar de seguir, acessível e responsiva.

**Independent Test**: `npm run test:e2e` verde.

### Testes e red [QA] (antes de qualquer implementação)

- [ ] T043 [QA] Rodar `sha256sum -c specs/001-seguir-criadora/evidence/tests.sha256` para provar que `tests/` não mudou desde a Fase 2
- [ ] T044 [US2] [QA] Criar `e2e/global-setup.ts` (roda `node scripts/db.mjs rebuild --test`) e o reset antes de cada teste com o helper de `tests/helpers/database.ts` (que importa `./env` e por isso só atinge o banco de teste); locators por papel e label com `exact: true` onde um nome for parte de outro ("Seguir" e "Deixar de seguir"; "1 seguidor" e "1 seguidores")
- [ ] T045 [P] [US2] [QA] E2E de carregamento em `e2e/page-load.spec.ts`: estado inicial com Ana, "Luna Prado", "0 seguidores" e botão "Seguir" (FR-019, FR-022, FR-023), screenshot `evidence/inicial.png`; `?creatorId=2` mostra "Mel Duarte" (FR-020); `?creatorId=999` e `?creatorId=abc` mostram "Criadora não encontrada." e nenhum botão (FR-021); "Carregando…" visível enquanto a resposta inicial está retida por `page.route` (FR-027)
- [ ] T046 [P] [US2] [QA] E2E de ações em `e2e/page-actions.spec.ts`: seguir → "Deixar de seguir" e "1 seguidor", screenshot `evidence/seguindo.png`; deixar de seguir → "Seguir" e "0 seguidores" (FR-019, FR-023); troca de usuário atualiza o botão (FR-022); duplo clique gera uma única requisição contada com `page.on('request')` (FR-025); POST abortado por `page.route` mostra "Não foi possível concluir a ação. Tente novamente." e mantém "0 seguidores" e "Seguir", screenshot `evidence/erro.png`; resposta 500 (`route.fulfill`) no POST e no DELETE, e 500 no GET da contagem depois de um POST bem-sucedido, mostram a mesma mensagem e mantêm contagem e botão como estavam (FR-026)
- [ ] T047 [P] [US2] [QA] E2E com dois contextos em `e2e/page-multi-user.spec.ts`: Ana e Bruno vendo "0 seguidores"; Ana segue; Bruno segue sem recarregar e vê "2 seguidores" (FR-024, FR-023)
- [ ] T048 [P] [US2] [QA] E2E de acessibilidade e layout em `e2e/page-a11y.spec.ts`: fluxo só com teclado (foco no seletor "Você é", troca de usuário, Tab até o botão, Enter/Espaço segue) (FR-028); botão com `aria-pressed` `false`/`true` e contagem dentro de região `aria-live="polite"` (FR-029); 375×812 e 1280×800 sem rolagem horizontal (FR-030)
- [ ] T049 [QA] Rodar `npm run lint` e deixar `tests/` e `e2e/` sem erros; depois provar o red: `npm run test:e2e`, confirmar falha por asserção de comportamento (não por import, sintaxe ou setup) e salvar em `evidence/red-e2e.txt`
- [ ] T050 [QA] Regerar o hash com `tests/`, `e2e/` e os configs: `find tests e2e jest.unit.config.ts jest.int.config.ts playwright.config.ts -type f 2>/dev/null | sort | xargs sha256sum > specs/001-seguir-criadora/evidence/tests.sha256`

### Implementação [DEV] (sem tocar em `e2e/` nem `tests/`)

- [ ] T051 [US2] [DEV] Implementar `public/index.html`: `select` com `label` "Você é", `h1` do nome, avatar com iniciais `aria-hidden="true"`, contagem com `aria-live="polite"`, `button type="button"` com `aria-pressed`, área `role="alert"`, "Carregando…", `<script type="module" src="app.js">`
- [ ] T052 [P] [US2] [DEV] Implementar `public/styles.css`: variáveis em `:root`, fonte do sistema, card centralizado com largura máxima de 420px, foco visível, responsivo, tema escuro via `prefers-color-scheme`
- [ ] T053 [US2] [DEV] Implementar `public/app.js` conforme plan e `contracts/page.md`: carregamento em paralelo, troca de usuário, clique com botão desabilitado e `aria-busy`, contagem sempre relida do servidor (o estado do botão e a contagem só mudam depois da releitura; se ela falhar, mostra a mensagem e mantém tudo), mensagens exatas, criadora inexistente ou `creatorId` inválido, só `textContent` (nunca `innerHTML` com dado do servidor)
- [ ] T054 [DEV] Rodar `npm run lint`, `npm run build`, `npm run test:unit`, `npm run test:int` e `npm run test:e2e` até verde; relatar mudanças e desvios do plan

### Validação [QA] e revisão [REV]

- [ ] T055 [QA] Rodar `sha256sum -c specs/001-seguir-criadora/evidence/tests.sha256` e conferir que `find tests e2e jest.unit.config.ts jest.int.config.ts playwright.config.ts -type f | sort` lista exatamente os arquivos do hash; divergência (inclusive arquivo novo ou removido) é bloqueante
- [ ] T056 [QA] Mutações em `public/app.js`, uma por vez, com cópia em `/tmp`, restauração com `cp` e conferência com `cmp`: (e) atualizar a contagem localmente (+1/-1) em vez de reler do servidor; (f) não desabilitar o botão durante a requisição; registrar em `evidence/mutacoes-e2e.md` com a tabela FR → testes
- [ ] T057 [QA] Conferir os screenshots de evidência `evidence/inicial.png`, `evidence/seguindo.png` e `evidence/erro.png`
- [ ] T058 [REV] Revisar os arquivos da fase (`git status --porcelain --untracked-files=all`, lendo-os diretamente), incluindo os scripts `test:*` do `package.json` e `playwright.config.ts`, contra AGENTS.md e a constituição (itens 1 a 11 do reviewer), sem rodar o E2E, e salvar em `evidence/review-e2e.md`

**Checkpoint**: página completa, E2E verde, hash íntegro, mutações (e) e (f) mortas.

---

## Phase 4: Documentação e relatório final

**Purpose**: docs coerentes com o que foi implementado e prova da Definição de pronto.

- [ ] T059 [P] [DEV] Revisar e ajustar os ADRs `docs/adr/0001-stack.md` a `docs/adr/0005-banco-e-ambientes.md` para refletir a implementação final (formato de AGENTS.md, status Aceito)
- [ ] T060 [P] [DEV] Escrever `README.md` em português: pré-requisitos; criar `.env` a partir do `.env.example`; subir tudo com `docker compose up -d --build`; abrir http://localhost:3000; testes (`npm ci`, `npx playwright install chromium`, `npm run db:up`, `npm run verify` e cada nível: `npm run test:unit`, `npm run test:int`, `npm run test:e2e`); decisões resumidas com link para os ADRs; limitações (sem autenticação etc.); só comandos que existem
- [ ] T061 [QA] Escrever `evidence/relatorio-final.md`: tabela FR-001 a FR-030 → testes, mutações (a) a (f) com resultado, lacunas conhecidas e o checklist da Definição de pronto marcado honestamente

---

## Cobertura FR → tarefas de teste

| FR | Tarefas |
|----|---------|
| FR-001, FR-002 | T022, T023 |
| FR-003, FR-004 | T022, T024 |
| FR-005, FR-006, FR-007 | T029 |
| FR-008 | T022, T025 |
| FR-009, FR-010, FR-011 | T022, T027 |
| FR-012 | T027 |
| FR-013, FR-014 | T028 |
| FR-015 | T027, T028 |
| FR-016, FR-017, FR-018 | T026 |
| FR-019 | T045, T046 |
| FR-020, FR-021, FR-027 | T045 |
| FR-022 | T045, T046 |
| FR-023 | T045, T046, T047 |
| FR-024 | T047 |
| FR-025, FR-026 | T046 |
| FR-028, FR-029, FR-030 | T048 |

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: sem dependências.
- **Phase 2 (API)**: depende da Phase 1. Ordem interna obrigatória: T021–T031 [QA] → T032–T039 [DEV] → T040–T041 [QA] → T042 [REV].
- **Phase 3 (Página)**: depende da Phase 2 (a página consome a API). Ordem interna obrigatória: T043–T050 [QA] → T051–T054 [DEV] → T055–T057 [QA] → T058 [REV].
- **Phase 4 (Docs)**: depende das Phases 2 e 3.

### Within Each Phase

- Nenhuma tarefa [DEV] de implementação começa antes de o red estar salvo e o hash gerado.
- O developer nunca edita `tests/` nem `e2e/`; teste que parecer errado é reportado, não alterado.
- As mutações rodam só depois do verde e do `sha256sum -c` íntegro.

### Story Dependencies

- US1 e US3 são entregues juntas na Phase 2 (mesma camada da API).
- US2 depende da API da Phase 2.

---

## Parallel Opportunities

- Phase 1: T004, T005, T006, T007, T008, T010, T013, T014, T016, T017, T018 e T019 (arquivos diferentes).
- Phase 2 (QA): T022 a T029, depois de T021.
- Phase 2 (DEV): T033, T037 e T038 em paralelo com T034 a T036.
- Phase 3 (QA): T045 a T048, depois de T044.
- Phase 3 (DEV): T052 em paralelo com T051 e T053.
- Phase 4: T059 e T060.

### Parallel Example: Phase 2 (QA)

```text
qa-guardian: T022 tests/unit/followers.service.spec.ts
qa-guardian: T023 tests/integration/follow.spec.ts
qa-guardian: T027 tests/integration/not-found.spec.ts
qa-guardian: T029 tests/integration/concurrency.spec.ts
```

### Parallel Example: Phase 3 (QA)

```text
qa-guardian: T045 e2e/page-load.spec.ts
qa-guardian: T046 e2e/page-actions.spec.ts
qa-guardian: T047 e2e/page-multi-user.spec.ts
qa-guardian: T048 e2e/page-a11y.spec.ts
```

---

## Implementation Strategy

### MVP

Phases 1 e 2: o contrato do enunciado (US1) com as garantias de US3, validado por `npm run test:unit` e `npm run test:int`.

### Incremental Delivery

1. Phase 1 → projeto e compose prontos.
2. Phase 2 → API completa (MVP).
3. Phase 3 → página.
4. Phase 4 → README, ADRs e relatório final; `npm run verify` verde.

## Notes

- Relatórios de cada agente são salvos pela sessão principal em `evidence/` (`setup.md`, `red-api.txt`, `mutacoes-api.md`, `review-api.md`, `red-e2e.txt`, `mutacoes-e2e.md`, `review-e2e.md`, `relatorio-final.md`).
- Bloqueios (teste errado apontado, achado bloqueante) vão para `evidence/bloqueios.md`.
- Dúvidas não cobertas vão para `evidence/suposicoes.md`.
