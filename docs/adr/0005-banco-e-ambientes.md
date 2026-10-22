# 0005. Banco e ambientes

- **Status**: Aceito
- **Data**: 2026-10-22

## Contexto

O esquema tem três tabelas e dados pré-cadastrados. Os testes precisam de um banco isolado do
banco usado pela aplicação, e a API e o banco rodam no Docker Compose.

## Decisão

- `db/schema.sql` idempotente (`CREATE ... IF NOT EXISTS`), sem ferramenta de migrations.
- `db/seed.sql` idempotente: ids explícitos com `ON CONFLICT (id) DO NOTHING` e `setval` nas sequências de `users` e `creators`, para que inserções futuras não colidam com os ids do seed.
- `scripts/db.mjs setup` aplica schema e seed; o container da API roda isso antes de subir.
- Banco de teste separado, `seguir_criadora_test`, criado por `db/init/01-test-db.sql` na primeira inicialização do volume.
- `scripts/db.mjs rebuild` apaga e recria as tabelas e só aceita `--test`, sempre em `DATABASE_URL_TEST`. Os testes abortam se `DATABASE_URL_TEST` faltar ou for igual a `DATABASE_URL`.
- Portas: Postgres em 5433 no host (para não colidir com um Postgres local em 5432); API em 3000; servidor dos testes E2E em 3100 (para não colidir com a API do compose).

## Alternativas

- **Ferramenta de migrations** (node-pg-migrate, Flyway): justificável com esquema que evolui; aqui é um esquema fixo.
- **Mesmo banco para app e testes**: os testes apagariam dados da aplicação.
- **Seed sem `setval`**: a próxima inserção sem id colidiria com o id 1.

## Consequências

- Subir do zero e rodar de novo dão o mesmo resultado.
- Mudança de esquema exige editar `schema.sql` e recriar o banco; não há histórico de versões do esquema.
- O rebuild nunca atinge o banco da aplicação.
