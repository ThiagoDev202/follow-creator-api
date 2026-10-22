# Implementation Plan: Seguir criadora

**Branch**: `001-seguir-criadora` | **Date**: 2026-10-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-seguir-criadora/spec.md`

## Summary

API NestJS (controller → service → repository) com pg e SQL puro sobre PostgreSQL 17, mais uma
página estática em `public/`. A unicidade de "seguir" é garantida pela PRIMARY KEY composta de
`follows` e por `INSERT ... ON CONFLICT DO NOTHING RETURNING 1`, sem ler antes de escrever. A
contagem é um `COUNT(*)::int` em consulta separada. Decisões em [research.md](research.md) e nos
ADRs de `docs/adr/`. Contrato em [contracts/http-api.md](contracts/http-api.md) e
[contracts/page.md](contracts/page.md).

## Technical Context

**Language/Version**: Node.js 24 (`.nvmrc` com `24` e `"engines": { "node": ">=24 <25" }`), TypeScript com `"strict": true`

**Primary Dependencies**: NestJS (Express), `pg`, `class-validator`, `class-transformer`, `@nestjs/serve-static`, `dotenv`

**Storage**: PostgreSQL 17 no Docker Compose; banco de teste separado `seguir_criadora_test`

**Testing**: Jest + ts-jest, supertest, `@nestjs/testing`, Playwright (só Chromium)

**Target Platform**: Linux (container `node:24-alpine`); página em navegadores modernos

**Project Type**: web-service com página estática servida pela própria API

**Performance Goals**: sem meta numérica; corretude sob concorrência (30 a 40 requisições simultâneas)

**Constraints**: zero comentários no código; sem ORM nem query builder; sem Swagger; sem transação explícita; cada escrita é um único comando SQL

**Scale/Scope**: 3 usuários e 2 criadoras pré-cadastrados; 6 endpoints; 1 página

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Como o plano cumpre | Status |
|-----------|---------------------|--------|
| I. Spec é a fonte da verdade | Todo FR mapeado para teste na seção Testes; nada fora da spec | OK |
| II. Test-first | Tarefas de teste (qa-guardian) antes da implementação em cada fase, com red salvo | OK |
| III. Donos por diretório | `tests/` e `e2e/` do qa-guardian, inclusive helpers e global setups; o resto, inclusive README e ADRs, do developer | OK |
| IV. Teste de comportamento | Integração via HTTP real; unitário só do service com fake do repository; E2E por papel e label | OK |
| V. Consistência pelo banco | PK composta, `ON CONFLICT DO NOTHING RETURNING`, FK com 23503; sem SELECT antes de escrever | OK |
| VI. KISS | Sem service em users; sem camadas extras; só os 3 endpoints extras de leitura que a página exige | OK |
| VII. Controller → service → repository | SQL só nos repositories; regra só nos services | OK |
| VIII. Sem segredos | `.env` fora do git; `.env.example` com placeholders; compose sem credencial fixa | OK |
| IX. Idioma | Código em inglês; `message` e textos da página em português | OK |

Re-check pós-design (Fase 1): sem violações; Complexity Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/001-seguir-criadora/
├── plan.md
├── research.md          # só lista e linka os ADRs
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── http-api.md
│   └── page.md
├── checklists/requirements.md
├── evidence/            # suposicoes.md, red-*.txt, tests.sha256, mutacoes-*.md, review-*.md, screenshots
└── tasks.md             # gerado por /speckit-tasks
```

### Source Code (repository root)

```text
.nvmrc
.env.example
.dockerignore
Dockerfile
docker-compose.yml
package.json / package-lock.json
tsconfig.json / tsconfig.build.json / nest-cli.json
eslint.config.mjs / .prettierrc
jest.unit.config.ts
jest.int.config.ts
playwright.config.ts

src/
├── main.ts
├── app.module.ts
├── database/database.module.ts
├── common/
│   ├── errors/creator-not-found.error.ts
│   ├── errors/user-not-found.error.ts
│   ├── filters/http-exception.filter.ts
│   └── pipes/positive-int.pipe.ts
├── followers/
│   ├── followers.module.ts
│   ├── followers.controller.ts
│   ├── followers.service.ts
│   ├── followers.repository.ts
│   └── dto/
│       ├── follow-creator.request.ts
│       ├── followers-count.response.ts
│       └── follow-status.response.ts
├── creators/
│   ├── creators.module.ts
│   ├── creators.controller.ts
│   ├── creators.service.ts
│   ├── creators.repository.ts
│   └── dto/creator.response.ts
└── users/
    ├── users.module.ts
    ├── users.controller.ts
    ├── users.repository.ts
    └── dto/user.response.ts

db/
├── schema.sql
├── seed.sql
└── init/01-test-db.sql

scripts/db.mjs

public/
├── index.html
├── styles.css
└── app.js

tests/
├── helpers/
│   ├── env.ts
│   ├── database.ts
│   └── global-setup.ts
├── unit/
└── integration/

e2e/
└── global-setup.ts e specs *.spec.ts

docs/adr/0001-stack.md … 0005-banco-e-ambientes.md
```

**Structure Decision**: projeto único na raiz; a API serve a página estática. Os arquivos
gerados pela CLI do Nest que não estão na árvore acima (`app.controller.ts`, `app.service.ts`,
`app.controller.spec.ts`, pasta `test/` e o bloco `jest` do `package.json`) são removidos.

## Ambiente

- Projeto gerado com a CLI oficial do NestJS (`npx @nestjs/cli new`, npm); `package-lock.json` versionado; ESLint e Prettier padrão da CLI, sem Swagger.
- `tsconfig.json` com `"strict": true` e incluindo `src`, `tests`, `e2e` e os configs `.ts`; `tsconfig.build.json` compila só `src`.
- ESLint: regra `@typescript-eslint/no-explicit-any` como `error`; sem o comentário `// @ts-check` que a CLI gera (zero comentários).
- `.env.example`, só placeholders:

  ```text
  PORT=3000
  POSTGRES_USER=app
  POSTGRES_PASSWORD=change_me
  POSTGRES_DB=seguir_criadora
  DATABASE_URL=postgres://app:change_me@localhost:5433/seguir_criadora
  DATABASE_URL_TEST=postgres://app:change_me@localhost:5433/seguir_criadora_test
  ```

- `docker-compose.yml`, dois serviços, sem credencial fixa (variáveis com `${VAR:?}` para falhar se faltarem):
  - `db`: `postgres:17`; porta `5433:5432`; volume nomeado; healthcheck com `pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}`; `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB` vindos do `.env`; `./db/init` montado em `/docker-entrypoint-initdb.d`.
  - `api`: build pelo `Dockerfile`; porta `3000:3000`; `depends_on: db: condition: service_healthy`; `PORT=3000`; `DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}`; comando `sh -c "node scripts/db.mjs setup && node dist/main"`.
- `Dockerfile` multi-stage `node:24-alpine`: estágio `build` (`npm ci`, `npm run build`); estágio final com `npm ci --omit=dev` e só `dist/`, `public/`, `db/` e `scripts/`.
- `.dockerignore`: `node_modules`, `dist`, `.env`, `tests`, `e2e`, `specs`, `coverage`, `test-results`, `playwright-report`.
- Dependências de produção: `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/serve-static`, `class-validator`, `class-transformer`, `pg`, `dotenv`, `reflect-metadata`, `rxjs`. `scripts/db.mjs` roda no container, por isso `pg` e `dotenv` são de produção.
- Dependências de desenvolvimento: as da CLI (Jest, ts-jest, supertest, ESLint, Prettier, TypeScript, ts-node) mais `@types/pg` e `@playwright/test`.

## Banco

`db/schema.sql` (idempotente):

```sql
CREATE TABLE IF NOT EXISTS users (
  id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name text NOT NULL
);
CREATE TABLE IF NOT EXISTS creators (
  id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name text NOT NULL
);
CREATE TABLE IF NOT EXISTS follows (
  creator_id integer NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (creator_id, user_id)
);
CREATE INDEX IF NOT EXISTS follows_user_id_idx ON follows (user_id);
```

Sem índice separado em `creator_id`: a PK `(creator_id, user_id)` já cobre.

`db/seed.sql` (idempotente): `INSERT` com ids explícitos `ON CONFLICT (id) DO NOTHING` para usuários
1 Ana, 2 Bruno, 3 Carla e criadoras 1 Luna Prado, 2 Mel Duarte; depois
`SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users))` e o mesmo para
`creators`, para que inserções futuras não colidam com os ids do seed.

`db/init/01-test-db.sql`: `CREATE DATABASE seguir_criadora_test;` (roda só na primeira inicialização
do volume).

`scripts/db.mjs` (JS puro, carrega `.env` com `dotenv` se existir):

- `setup`: aplica `schema.sql` e `seed.sql` em `DATABASE_URL`, ou em `DATABASE_URL_TEST` com `--test`. Idempotente e seguro.
- `rebuild`: só aceita `--test` e sai com erro sem a flag; recusa também, antes de conectar, se `DATABASE_URL_TEST` estiver ausente, for igual a `DATABASE_URL` ou tiver nome de banco que não termine em `_test`; `DROP TABLE IF EXISTS follows, users, creators;` e aplica `schema.sql` e `seed.sql` em `DATABASE_URL_TEST`.

## API

- `main.ts`: importa `dotenv/config`, cria a app, sem prefixo global, `app.enableShutdownHooks()` e escuta em `PORT`. A app lê só `PORT` e `DATABASE_URL`.
- `AppModule` registra o `ValidationPipe` global `{ whitelist: true, forbidNonWhitelisted: true, transform: false }` (sem transformação, para que o `PositiveIntPipe` receba o texto bruto do parâmetro de rota) com `APP_PIPE` e o `HttpExceptionFilter` com `APP_FILTER`. Assim toda app criada a partir do `AppModule`, inclusive nos testes de integração, já tem pipe e filtro, sem repetir configuração.
- `ServeStaticModule` serve `public/` na raiz (`rootPath` = `join(__dirname, '..', 'public')`) com `renderPath: '/'` e **sem fallback de SPA**: só arquivos existentes são servidos; rota desconhecida cai no 404 `NOT_FOUND` do filtro e nenhuma rota da API é capturada pelo estático. O teste de rota inexistente (FR-013) prova isso; se `renderPath: '/'` não bastar, o developer usa a opção equivalente da biblioteca e registra a escolha em `evidence/suposicoes.md`.
- `DatabaseModule` global; o token é exportado como `export const PG_POOL = 'PG_POOL'` em `src/database/database.module.ts`, e o provider é: `new Pool({ connectionString: process.env.DATABASE_URL, max: 20, statement_timeout: 5000, idleTimeoutMillis: 10000 })`, encerrado com `pool.end()` em `onApplicationShutdown`.
- `PositiveIntPipe` em todo parâmetro de rota: aceita só `/^[1-9]\d*$/` com valor `<= 2147483647` e devolve `number`; caso contrário lança `BadRequestException`.
- `FollowCreatorRequest`: `userId` com `@IsInt() @Min(1) @Max(2147483647)`. A string `"1"` é inválida.

### Erros

Sempre `{ "error": { "code": string, "message": string } }`, mapeados pelo `HttpExceptionFilter`:

| Origem | Status | code | message |
|--------|--------|------|---------|
| Exceção HTTP do Nest com status 400 (validação, pipe) e JSON malformado | 400 | `VALIDATION_ERROR` | `Requisição inválida.` |
| `CreatorNotFoundError` | 404 | `CREATOR_NOT_FOUND` | `Criadora não encontrada.` |
| `UserNotFoundError` | 404 | `USER_NOT_FOUND` | `Usuário não encontrado.` |
| Exceção HTTP do Nest com status 404 (rota inexistente) | 404 | `NOT_FOUND` | `Recurso não encontrado.` |
| Qualquer outro erro | 500 | `INTERNAL_ERROR` | `Erro interno.` |

O erro 500 é logado em inglês com o `Logger` do Nest, sem stack na resposta. JSON malformado pode
chegar ao filtro como erro do body-parser (não `HttpException`) com `status` 400; o filtro também o
trata como `VALIDATION_ERROR`.

### Endpoints

| Método e rota | Sucesso | Erros |
|---------------|---------|-------|
| `POST /creators/:creatorId/followers` `{ userId }` | `201 { creatorId, count }` se criou; `200 { creatorId, count }` se já seguia | 400, `CREATOR_NOT_FOUND`, `USER_NOT_FOUND` |
| `DELETE /creators/:creatorId/followers/:userId` | `204` sem corpo, seguindo ou não | 400, `CREATOR_NOT_FOUND`, `USER_NOT_FOUND` |
| `GET /creators/:creatorId/followers/count` | `200 { creatorId, count }` | 400, `CREATOR_NOT_FOUND` |
| `GET /creators/:creatorId/followers/:userId` | `200 { following }` | 400, `CREATOR_NOT_FOUND`, `USER_NOT_FOUND` |
| `GET /creators/:creatorId` | `200 { id, name }` | 400, `CREATOR_NOT_FOUND` |
| `GET /users` | `200 [{ id, name }]` ordenado por id | — |

O status do POST é definido no controller com `@Res({ passthrough: true })`. Se criadora e usuário
não existem, a resposta é `CREATOR_NOT_FOUND` (criadora verificada primeiro). A rota
`followers/count` é declarada antes de `followers/:userId`.

## Responsabilidades

### FollowersRepository (único com SQL de `follows`)

- `insertFollow(creatorId, userId): Promise<'created' | 'existing' | 'missingReference'>`
  `INSERT INTO follows (creator_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING 1`;
  linha retornada → `'created'`; nenhuma → `'existing'`; erro `23503` → `'missingReference'`;
  qualquer outro erro é relançado.
- `deleteFollow(creatorId, userId): Promise<void>`
  `DELETE FROM follows WHERE creator_id = $1 AND user_id = $2`.
- `findExistence(creatorId, userId): Promise<{ creatorExists: boolean; userExists: boolean }>`
  `SELECT EXISTS(SELECT 1 FROM creators WHERE id = $1) AS creator_exists, EXISTS(SELECT 1 FROM users WHERE id = $2) AS user_exists`.
- `countFollowers(creatorId): Promise<number | null>`
  `SELECT c.id, (SELECT COUNT(*)::int FROM follows f WHERE f.creator_id = c.id) AS count FROM creators c WHERE c.id = $1`;
  nenhuma linha → `null`.
- `isFollowing(creatorId, userId): Promise<boolean>`
  `SELECT EXISTS(SELECT 1 FROM follows WHERE creator_id = $1 AND user_id = $2) AS following`.

### CreatorsRepository e UsersRepository

- `CreatorsRepository.findById(id): Promise<{ id: number; name: string } | null>`: `SELECT id, name FROM creators WHERE id = $1`.
- `UsersRepository.findAll(): Promise<{ id: number; name: string }[]>`: `SELECT id, name FROM users ORDER BY id`.

Todo SQL é parametrizado (`$1`, `$2`); colunas `snake_case` são mapeadas para `camelCase` no
repository.

### Services (regra de negócio, sem SQL nem HTTP)

- `FollowersService.follow(creatorId, userId)`: `insertFollow`; se `'missingReference'`, `findExistence` e lança `CreatorNotFoundError` ou `UserNotFoundError` (criadora primeiro); depois `countFollowers` em consulta separada; retorna `{ created, count }`. Se `findExistence` mostrar criadora e usuário existentes depois de `'missingReference'`, ou se `countFollowers` devolver `null` (criadora removida durante a operação, FR-012), lança `CreatorNotFoundError`.
- `FollowersService.unfollow(creatorId, userId)`: `deleteFollow`; depois `findExistence` e lança o erro correspondente se faltar criadora ou usuário (criadora primeiro).
- `FollowersService.getCount(creatorId)`: `countFollowers`; `null` → `CreatorNotFoundError`.
- `FollowersService.getStatus(creatorId, userId)`: `findExistence` (erro se faltar, criadora primeiro) e depois `isFollowing`.
- `CreatorsService.getById(id)`: `findById`; `null` → `CreatorNotFoundError`.
- `UsersController` chama `UsersRepository.findAll` direto.

### Controllers

Só validação (pipe e DTO), status e mapeamento para os DTOs de resposta (`FollowersCountResponse`,
`FollowStatusResponse`, `CreatorResponse`, `UserResponse`), com apenas os campos do contrato.

### Proibido

SELECT para decidir se escreve; capturar erro de unicidade como fluxo; CTE juntando INSERT e COUNT;
contador denormalizado; SQL concatenado; transação explícita (cada comando é atômico em READ
COMMITTED).

## Página

`public/index.html`, `public/styles.css` e `public/app.js` (ES module via
`<script type="module" src="app.js">`), sem framework, sem build, só URLs relativas. Detalhes em
[contracts/page.md](contracts/page.md).

- Ao carregar: lê `?creatorId=` (ausente ou vazio → `1`); busca em paralelo `GET /users`, `GET /creators/:id` e `GET /creators/:id/followers/count`; seleciona o primeiro usuário e busca `GET /creators/:id/followers/:userId`.
- Elementos: `select` com `label` "Você é"; nome da criadora em `h1`; avatar com as iniciais (`aria-hidden="true"`); contagem "1 seguidor" ou "N seguidores" em elemento com `aria-live="polite"`; `button type="button"` "Seguir"/"Deixar de seguir" com `aria-pressed`; área de erro com `role="alert"`; "Carregando…" até os dados iniciais chegarem.
- Ao trocar o usuário: rebusca o estado do botão.
- Ao clicar: limpa a área de erro, desabilita o botão e marca `aria-busy="true"`; envia POST ou DELETE; em sucesso, relê `GET .../count` e só então define o estado (POST → seguindo, DELETE → não seguindo) e a contagem; em falha de rede, resposta não-2xx ou falha na releitura da contagem, mostra "Não foi possível concluir a ação. Tente novamente." e mantém contagem e estado; no fim, reabilita o botão e remove `aria-busy`.
- Criadora inexistente (`GET /creators/:id` responde 404, ou 400 para `creatorId` inválido): mostra "Criadora não encontrada." e não exibe seletor, contagem nem botão.
- Falha no carregamento inicial por outro motivo: mostra "Não foi possível concluir a ação. Tente novamente." e não exibe o botão.
- `textContent` sempre; nunca `innerHTML` com dado do servidor.
- CSS: variáveis em `:root`, fonte do sistema, card centralizado com largura máxima de 420px, foco visível, responsivo, tema escuro via `prefers-color-scheme`.

## Testes

Rodam no host contra o Postgres do compose. Todo teste cita no nome o FR que cobre.

- Jest com dois configs na raiz:
  - `jest.unit.config.ts`: `tests/unit`.
  - `jest.int.config.ts`: `tests/integration`, rodado com `--runInBand`; `setupFiles` com `tests/helpers/env.ts`; `globalSetup` em `tests/helpers/global-setup.ts`, que roda `node scripts/db.mjs rebuild --test`.
- `tests/helpers/env.ts`: carrega `.env`, aborta se `DATABASE_URL_TEST` estiver ausente, for igual a `DATABASE_URL` ou tiver nome de banco que não termine em `_test`, e só depois define `DATABASE_URL = DATABASE_URL_TEST`; idempotente se importado mais de uma vez.
- `tests/helpers/database.ts`: importa `./env` primeiro (só atinge o banco de teste); antes de cada teste, `TRUNCATE follows, users, creators RESTART IDENTITY CASCADE` e aplica `db/seed.sql`.
- Unitários: `FollowersService` via `Test.createTestingModule` com `{ provide: FollowersRepository, useValue: <fake em memória> }`; cobrir criado, existente, `missingReference` (qual erro, inclusive ambos inexistentes → criadora), unfollow com criadora ou usuário inexistente, contagem nula, criadora removida entre o INSERT e a contagem (FR-012) e `missingReference` com criadora e usuário existentes (`CreatorNotFoundError`).
- Integração: app criada com `Test.createTestingModule({ imports: [AppModule] }).createNestApplication()`, sem repetir pipe nem filtro no teste, iniciada com `app.listen(0)` e usada com supertest. Cobrir todo o contrato e os erros:
  - ids `0`, `-1`, `abc`, `1.5`, `1e3`, `0x10`, `01` e `2147483648` em `creatorId` e `userId` de rota → 400 `VALIDATION_ERROR`;
  - corpo sem `userId`, `userId` `"1"`, campo extra e JSON malformado → 400 `VALIDATION_ERROR`;
  - criadora e usuário inexistentes → 404 com o `code` certo (ambos inexistentes → `CREATOR_NOT_FOUND`);
  - usuário ou criadora removidos do banco antes da operação → 404 com o `code` certo (FR-012);
  - `message` em português; `typeof count === 'number'`;
  - leituras extras: `GET /creators/1` → `{ id: 1, name: 'Luna Prado' }`; `GET /creators/1/followers/:userId` → `{ following }`; `GET /users` → Ana, Bruno, Carla em ordem;
  - concorrência com `Promise.all`: 30 POSTs do mesmo usuário → exatamente um 201, 29 200 e `count` 1; 30 usuários inseridos no teste seguindo a mesma criadora → `count` 30; 40 POST/DELETE alternados do mesmo usuário → nenhum 5xx, no máximo 1 linha em `follows` e `GET /creators/:id/followers/:userId` coerente com o banco;
  - um teste afirma que o pool (`PG_POOL`) tem `max > 1`; é a única exceção à regra de teste de comportamento, existe para os testes de concorrência não ficarem vazios, cita FR-005 e FR-006, já passa no red e está registrada no Complexity Tracking.
- E2E: `playwright.config.ts` com só Chromium; `testDir: 'e2e'`; `workers: 1`; `retries: 0`; `trace: 'retain-on-failure'`; `baseURL` `http://localhost:3100`; `webServer` com o comando `npm run build && node dist/main`, env `PORT=3100` e `DATABASE_URL = DATABASE_URL_TEST`, `reuseExistingServer: false`, `url` `http://localhost:3100` e `timeout` 120000; `playwright.config.ts` importa `dotenv/config` e aborta se `DATABASE_URL_TEST` estiver ausente ou igual a `DATABASE_URL`; `globalSetup` em `e2e/global-setup.ts`, que roda `node scripts/db.mjs rebuild --test`; antes de cada teste, o reset de `tests/helpers/database.ts`. Locators por papel e label, com `exact: true` onde um nome for parte de outro ("Seguir" e "Deixar de seguir"; "1 seguidor" e "1 seguidores"). Cenários:
  - estado inicial (Ana, Luna Prado, "0 seguidores", botão "Seguir");
  - seguir e deixar de seguir atualizam botão e contagem ("1 seguidor", "0 seguidores");
  - duplo clique gera uma única requisição (contada com `page.on('request')`);
  - falha de rede via `page.route` abortando o POST, e resposta 500 (`route.fulfill`) no POST e no DELETE, mostram a mensagem e mantêm contagem e botão (FR-026); resposta 500 no `GET` da contagem depois de um POST bem-sucedido mostra a mesma mensagem e mantém contagem e botão como estavam (FR-026);
  - dois contextos abertos (Ana e Bruno, ambos vendo "0 seguidores"): Ana segue, depois Bruno segue sem recarregar e passa a ver "2 seguidores";
  - troca de usuário atualiza o botão;
  - `?creatorId=999` mostra "Criadora não encontrada." e nenhum botão;
  - complementares, para que todo FR tenha teste: `?creatorId=2` mostra "Mel Duarte" (FR-020); "Carregando…" visível enquanto a resposta inicial está retida por `page.route` (FR-027); fluxo só com teclado: foco no seletor, troca de usuário pelo teclado, Tab até o botão e Enter/Espaço segue (FR-028); botão com `aria-pressed` `false`/`true` e contagem dentro de região `aria-live="polite"` (FR-029); viewport de 375×812 e 1280×800 sem rolagem horizontal (FR-030).
  - screenshots salvos em `specs/001-seguir-criadora/evidence/`: `inicial.png`, `seguindo.png` e `erro.png`.
- Navegador instalado com `npx playwright install chromium`.

## Scripts npm

Exatamente estes:

| Script | Comando |
|--------|---------|
| `db:up` | `docker compose up -d --wait db` |
| `db:down` | `docker compose down` |
| `db:setup` | `node scripts/db.mjs setup` |
| `db:setup:test` | `node scripts/db.mjs setup --test` |
| `build` | `nest build` |
| `start` | `node dist/main` |
| `start:dev` | `nest start --watch` |
| `lint` | `eslint "{src,tests,e2e}/**/*.ts"` (sem `--fix`) |
| `test:unit` | `jest -c jest.unit.config.ts` |
| `test:int` | `jest -c jest.int.config.ts --runInBand` |
| `test:e2e` | `playwright test` |
| `verify` | `npm run lint && npm run build && npm run test:unit && npm run test:int && npm run test:e2e` |

## ADRs

Em `docs/adr/`, no formato de AGENTS.md, status Aceito, data 2026-10-22, listados em
[research.md](research.md):

- [0001-stack](../../docs/adr/0001-stack.md)
- [0002-idempotencia-e-concorrencia](../../docs/adr/0002-idempotencia-e-concorrencia.md)
- [0003-contrato-e-erros](../../docs/adr/0003-contrato-e-erros.md)
- [0004-sem-autenticacao](../../docs/adr/0004-sem-autenticacao.md)
- [0005-banco-e-ambientes](../../docs/adr/0005-banco-e-ambientes.md)

## Complexity Tracking

| Violação | Por que é necessária | Alternativa mais simples rejeitada porque |
|----------|----------------------|-------------------------------------------|
| Teste do pool (`PG_POOL` com `max > 1`) verifica detalhe de implementação, contra o princípio IV | Sem pool com mais de uma conexão, os testes de concorrência rodariam em série e provariam pouco | Testar só o comportamento por HTTP: não distingue "concorrência real" de "requisições em fila" |
