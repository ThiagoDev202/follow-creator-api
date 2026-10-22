# 0001. Stack

- **Status**: Aceito
- **Data**: 2026-10-22

## Contexto

O desafio pede backend em Node.js/TypeScript ou C#/.NET, banco relacional (PostgreSQL com Docker
ou SQLite), testes automatizados da API e uma página simples. O tempo é curto e o código precisa
ser fácil de revisar.

## Decisão

- NestJS tradicional (Express), no formato controller → service → repository.
- `pg` com SQL puro, sem ORM nem query builder.
- PostgreSQL 17 e a API no Docker Compose.
- Jest (com supertest e `@nestjs/testing`) para testes unitários e de integração; Playwright, só Chromium, para E2E.
- Página estática em HTML, CSS e JavaScript puro, servida pela própria API.

## Alternativas

- **Fastify**: mais rápido, mas o ganho é irrelevante aqui e o Express é o padrão do Nest.
- **Prisma, TypeORM ou Kysely**: escondem o SQL que garante a concorrência (`ON CONFLICT`, `COUNT(*)::int`) e acrescentam dependência e geração de código.
- **SQLite**: mais simples de rodar, mas com concorrência de escrita limitada e longe do que roda em produção.
- **Vitest**: rápido, mas o Nest já vem integrado ao Jest.
- **Cypress ou Selenium**: mais pesados que o Playwright e sem o mesmo suporte a vários contextos e interceptação de rede.
- **React ou Vue**: uma tela com um botão não justifica framework nem build.

## Consequências

- O SQL fica explícito e revisável no repository.
- Os testes de integração precisam de um Postgres rodando (o do compose).
- A página não tem build: o que está em `public/` é o que roda.
- O `npm run verify` encadeia lint (sem warnings), build, testes unitários, de integração e E2E.
