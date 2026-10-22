# Relatório da Fase 1 (Setup): T001 a T020

Autor: developer (executado como agente genérico com o texto de `.claude/agents/developer.md`).

Todas as 20 tarefas foram concluídas e marcadas [X] em `tasks.md`. Não houve commit nem push.

## O que foi feito

- **Projeto Nest:** gerado com a CLI oficial em diretório temporário e copiado para a raiz. O `.gitignore` existente foi mantido. Foram removidos `app.controller.ts`, `app.service.ts`, `app.controller.spec.ts`, a pasta `test/`, o bloco `jest` e os scripts fora do plan. O README gerado foi descartado.
- **Dependências (T002):** produção: `@nestjs/serve-static@^5`, `class-validator`, `class-transformer`, `pg`, `dotenv`. Desenvolvimento: `@types/pg`, `@playwright/test`.
- **Configuração:** `tsconfig.json` com `strict: true` e `include` de `src`, `tests`, `e2e` e os três configs `.ts`; `tsconfig.build.json` compila só `src`; `eslint.config.mjs` sem `// @ts-check` e com `no-explicit-any: error`; `.nvmrc` com `24` e `engines >=24 <25`; `.env.example` com os placeholders do plan, copiado para `.env` (ignorado pelo git).
- **Banco:** `db/schema.sql`, `db/seed.sql` e `db/init/01-test-db.sql` como no plan. `scripts/db.mjs` tem `setup` e `rebuild`, com todas as recusas pedidas.
- **Docker:** `Dockerfile` multi-stage `node:24-alpine`, `.dockerignore` e `docker-compose.yml` (db `postgres:17` em 5433, api em 3000, `${VAR:?}`, sem credencial fixa).
- **Scripts npm:** exatamente os 12 da tabela do plan.
- **Configs de teste:** `jest.unit.config.ts`, `jest.int.config.ts` e `playwright.config.ts`.
- **Esqueleto:** `src/` conforme o plan. `main.ts`, `app.module.ts` e `database.module.ts` funcionais, com `APP_FILTER` e sem `APP_PIPE`. Filtro responde sempre 500 `INTERNAL_ERROR`; o pipe não valida. Services e repositories lançam `NotImplementedException`. Controllers com as rotas do plan, `followers/count` antes de `followers/:userId`.
- **Página:** `public/index.html` mínimo.

## Arquivos criados ou alterados

- Raiz: `.dockerignore`, `.env.example`, `.env` (local), `.nvmrc`, `.prettierrc`, `Dockerfile`, `docker-compose.yml`, `eslint.config.mjs`, `jest.int.config.ts`, `jest.unit.config.ts`, `nest-cli.json`, `package.json`, `package-lock.json`, `playwright.config.ts`, `tsconfig.json`, `tsconfig.build.json`.
- `.gitignore`: só ganhou `*.tsbuildinfo`.
- `db/schema.sql`, `db/seed.sql`, `db/init/01-test-db.sql`, `scripts/db.mjs`, `public/index.html`.
- `src/` (25 arquivos): `main.ts`, `app.module.ts`, `database/database.module.ts`; `common/` (2 erros, filtro, pipe); `followers/` (module, controller, service, repository e 3 DTOs); `creators/` (module, controller, service, repository, DTO); `users/` (module, controller, repository, DTO).
- `specs/001-seguir-criadora/tasks.md` (T001 a T020 marcadas [X]) e `evidence/suposicoes.md` (seção "Prompt 5 (implement)").

## Desvios do plan (todos em suposicoes.md)

1. A versão mais recente da CLI do Nest (12) gera ESM, Vitest, oxlint e TypeScript 6, o que contradiz o plan; usada a `@nestjs/cli@11` (Nest 11, Jest 30, ts-jest, ESLint 9, CommonJS).
2. `@nestjs/serve-static` na linha `^5`, porque a 12 exige Nest 12.
3. `tsconfig.json` com `strict: true`; `strictPropertyInitialization: false` para os DTOs de entrada; removidos `baseUrl` e `types`.
4. Regra extra no ESLint: `no-unused-vars` com `argsIgnorePattern: '^_'`, porque os parâmetros do esqueleto só lançam `NotImplementedException`; na Fase 2 perdem o `_`.
5. O pipe do esqueleto devolve `Number(value)` sem validar, para os controllers já terem o tipo `number`.
6. Tipos de retorno do esqueleto: `getCount` devolve `Promise<number>`, `getStatus` devolve `Promise<boolean>`, e `FollowersRepository` exporta `InsertFollowResult`.
7. `ServeStaticModule` com `renderPath: '/'` bastou, sem fallback de SPA.
8. `jest.int.config.ts` e `playwright.config.ts` apontam para `tests/helpers/env.ts`, `tests/helpers/global-setup.ts` e `e2e/global-setup.ts`, que ainda não existem (são do qa-guardian).
9. `playwright.config.ts` lança erro ao ser carregado sem `DATABASE_URL_TEST`.

## Validações (T020)

- `npm run build`: verde.
- `npm run lint`: verde, sem erros nem avisos.
- Comentários: nenhum em `src/`.
- `docker compose config -q`: válido.
- `docker compose up -d --build`: `db` saudável em 5433 e `api` em 3000.
- API respondendo: `GET /` devolve 200 com o `index.html`; `GET /users` e `GET /nope` devolvem 500 `INTERNAL_ERROR` (esperado no esqueleto); `/nope` não devolveu `index.html`, então não há fallback de SPA.
- `npm run db:setup:test`: concluído; banco `seguir_criadora_test` criado pelo init.
- `node scripts/db.mjs rebuild` sem `--test`: recusa com `rebuild requires the --test flag.` e exit 1.
- `rebuild --test`: exit 0; banco de teste com 3 usuários e 2 criadoras; banco principal intocado.
- Recusas de `rebuild --test` antes de conectar, todas com exit 1: `DATABASE_URL_TEST` igual a `DATABASE_URL`, vazio, ou com nome de banco sem sufixo `_test`.

## Estado final

`docker compose stop api` executado; o `db` continua de pé e saudável em 5433 com os dois bancos semeados. `.env` local com placeholders. Chromium do Playwright ainda não instalado.
