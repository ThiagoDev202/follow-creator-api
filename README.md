# Seguir criadora

API e página em que um usuário segue e deixa de seguir uma criadora e vê quantos seguidores ela tem. A API é feita com NestJS, TypeScript e PostgreSQL (SQL puro, sem ORM). A página é estática (HTML, CSS e JavaScript puro) e é servida pela própria API.

## Pré-requisitos

- Node.js 24 e npm (só para rodar lint, build e testes fora do Docker; há um `.nvmrc`).
- Docker com Docker Compose.

## Configuração

Crie o `.env` a partir do exemplo:

```bash
cp .env.example .env
```

As senhas do `.env.example` (`change_me`) são placeholders: troque-as no `.env`, mantendo a mesma senha em `POSTGRES_PASSWORD`, `DATABASE_URL` e `DATABASE_URL_TEST`. O `.env` não vai para o git.

## Subir a aplicação

```bash
docker compose up -d --build
```

Isso sobe o PostgreSQL 17 e a API. Ao iniciar, a API aplica o esquema e os dados iniciais (3 usuários e 2 criadoras) antes de escutar.

Abra http://localhost:3000 (criadora 1, Luna Prado) ou http://localhost:3000/?creatorId=2 (criadora 2, Mel Duarte). Escolha o usuário em "Você é" e clique em "Seguir" ou "Deixar de seguir".

Para parar: `docker compose stop api` (ou `npm run db:down` para derrubar os serviços).

## Endpoints

Erros têm sempre o formato `{ "error": { "code", "message" } }`, com `code` em inglês e `message` em português. Identificadores são inteiros positivos até 2147483647; fora disso a resposta é 400 `VALIDATION_ERROR`.

Seguir (201 na primeira vez, 200 se já seguia):

```bash
curl -i -X POST http://localhost:3000/creators/1/followers \
  -H 'Content-Type: application/json' -d '{"userId": 1}'
```

```json
{ "creatorId": 1, "count": 1 }
```

Deixar de seguir (204 sem corpo, seguindo ou não):

```bash
curl -i -X DELETE http://localhost:3000/creators/1/followers/1
```

Contagem de seguidores:

```bash
curl http://localhost:3000/creators/1/followers/count
```

```json
{ "creatorId": 1, "count": 0 }
```

Criadora inexistente (404):

```bash
curl -i -X POST http://localhost:3000/creators/99/followers \
  -H 'Content-Type: application/json' -d '{"userId": 1}'
```

```json
{ "error": { "code": "CREATOR_NOT_FOUND", "message": "Criadora não encontrada." } }
```

Leituras extras, usadas pela página:

```bash
curl http://localhost:3000/creators/1                # {"id":1,"name":"Luna Prado"}
curl http://localhost:3000/creators/1/followers/1    # {"following":false}
curl http://localhost:3000/users                     # [{"id":1,"name":"Ana"},...]
```

O contrato completo está em `specs/001-seguir-criadora/contracts/http-api.md`.

## Testes

Os testes de integração e os E2E usam um banco separado (`seguir_criadora_test`), criado na primeira inicialização do volume do Postgres.

```bash
npm ci
npx playwright install chromium
npm run db:up
npm run verify
```

`npm run verify` roda lint, build, testes unitários, de integração e E2E em sequência. Cada nível também roda separado:

```bash
npm run test:unit
npm run test:int
npm run test:e2e
```

Outros scripts: `npm run lint`, `npm run build`, `npm run start:dev`, `npm run db:setup` (aplica esquema e dados em `DATABASE_URL`) e `npm run db:setup:test` (o mesmo em `DATABASE_URL_TEST`).

## Estrutura

```
src/         API NestJS (controller, service, repository por módulo)
  followers/ seguir, deixar de seguir, contagem e estado
  creators/  leitura de criadora
  users/     lista de usuários
  common/    filtro de erros e pipe de identificadores
  database/  pool do pg
public/      página estática
db/          schema.sql, seed.sql e init/ (criação do banco de teste)
scripts/     db.mjs (setup e rebuild do banco)
tests/       testes unitários e de integração (Jest)
e2e/         testes E2E (Playwright)
docs/adr/    decisões de arquitetura
specs/       especificação, plano, tarefas e evidências
```

## Decisões

- [0001 Stack](docs/adr/0001-stack.md): NestJS, pg com SQL puro, PostgreSQL 17, Jest e Playwright, página sem framework.
- [0002 Idempotência e concorrência](docs/adr/0002-idempotencia-e-concorrencia.md): unicidade pela chave primária, `INSERT ... ON CONFLICT DO NOTHING`, contagem em consulta separada; a página só atualiza depois de reler a contagem.
- [0003 Contrato e erros](docs/adr/0003-contrato-e-erros.md): formato de erro, limites de id, endpoints extras e validação sem conversão de tipos.
- [0004 Sem autenticação](docs/adr/0004-sem-autenticacao.md): o `userId` é confiado ao cliente.
- [0005 Banco e ambientes](docs/adr/0005-banco-e-ambientes.md): esquema idempotente, banco de teste separado com proteção no rebuild, container sem root.

## Limitações

- Sem autenticação: qualquer cliente age em nome de qualquer usuário. Não exponha publicamente.
- Os E2E rodam só em Chromium.
- Não há lista de seguidores nem paginação; só a contagem.
- Usuários e criadoras são pré-cadastrados; não há endpoints para criá-los.
- O banco de teste é separado do da aplicação; o `rebuild` do banco só aceita o de teste (nome terminado em `_test` e diferente de `DATABASE_URL`).
- Portas usadas no host: 3000 (API), 3100 (servidor dos E2E) e 5433 (PostgreSQL).
