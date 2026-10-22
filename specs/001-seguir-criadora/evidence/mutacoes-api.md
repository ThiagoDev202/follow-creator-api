# Mutações e validação da API (Fase 2: T040 e T041)

Autor: qa-guardian (agente genérico com o texto de `.claude/agents/qa-guardian.md`). Nenhum teste foi editado; nenhum arquivo de `src/`, `db/` ou `scripts/` ficou alterado; sem commit.

## T040: integridade dos testes

- `sha256sum -c specs/001-seguir-criadora/evidence/tests.sha256` terminou com código de saída 0; os 16 arquivos conferem.
- A lista de `find tests e2e jest.unit.config.ts jest.int.config.ts playwright.config.ts -type f | sort` é idêntica à coluna de caminhos do hash (16 entradas). Sem arquivo novo ou removido. `e2e/` ainda não existe (esperado na Fase 2).
- Linha de base antes das mutações: `test:unit` 20/20 e `test:int` 107/107 (7 suítes).

## T041: mutações

Procedimento, uma por vez: cópia do alvo para o scratchpad e conferência com `cmp`; mutação; `test:unit` e `test:int` (o globalSetup refaz o banco de teste com `rebuild --test`, então o schema mutado da (a) chegou ao banco: a tabela ficou sem `follows_pkey`); restauração com `cp` e `cmp`; suítes de novo, verdes.

| Mut. | Mutação | Arquivo | Testes que falharam | Resultado | Restauração |
|---|---|---|---|---|---|
| (a) | Remover `PRIMARY KEY (creator_id, user_id)` de `follows` | `db/schema.sql` | unit 0/20; int 3/107: `follow.spec` FR-002 (recebeu 201); `concurrency.spec` FR-005 (30 × 201) e FR-007 (4 linhas, esperado ≤ 1) | Morta | cmp OK; 20/20 e 107/107 |
| (b) | `INSERT ... ON CONFLICT DO NOTHING RETURNING 1` trocado por SELECT seguido de INSERT | `src/followers/followers.repository.ts` | unit 0/20; int 2/107: `concurrency.spec` FR-005 (26 × 200 em vez de 29) e FR-007 (8 × 500 por violação da PK sob corrida) | Morta | cmp OK; 20/20 e 107/107 |
| (c) | `COUNT(*)::int` trocado por `COUNT(*)` | `src/followers/followers.repository.ts` | unit 0/20; int 13/107 em 4 suítes (follow, unfollow, count, concurrency); `count` voltou como string `"1"` | Morta | cmp OK; 20/20 e 107/107 |
| (d) | Remover o tratamento do `23503` (e a constante, sem deixar código morto) | `src/followers/followers.repository.ts` | unit 0/20; int 6/107: `not-found.spec` FR-009/010/011/012 (POST) e `validation.spec` FR-014 (userId 2147483647); todos receberam 500 em vez de 404 | Morta | cmp OK; 20/20 e 107/107 |

**Placar: 4 mortas e 0 sobreviventes.**

Estado final: alvos idênticos às cópias (cmp e sha256); `node scripts/db.mjs rebuild --test` rodado no fim, banco de teste com `follows_pkey`; hash dos testes íntegro de novo; `git status` igual ao instantâneo inicial. `src/` e `db/` ainda não estão no git, então a prova da restauração é o `cmp` mais o sha256.

## FR → testes da Fase 2

Contagens da execução real (relatório `--json` do Jest). Todos os 127 testes citam algum FR.

| FR | Unit (`followers.service.spec.ts`) | Integração |
|---|---|---|
| FR-001 | 1 | follow × 3 |
| FR-002 | 1 | follow × 1 |
| FR-003 | 1 | unfollow × 2 |
| FR-004 | 1 | unfollow × 2 |
| FR-005 | – | concurrency × 2 (inclui `PG_POOL max > 1`) |
| FR-006 | – | concurrency × 2 (inclui `PG_POOL max > 1`) |
| FR-007 | – | concurrency × 1 |
| FR-008 | 2 | count × 3 |
| FR-009 | 4 | not-found × 5 |
| FR-010 | 3 | not-found × 3 |
| FR-011 | 3 | not-found × 3 |
| FR-012 | 3 | not-found × 5 |
| FR-013 | – | validation × 59 |
| FR-014 | – | validation × 11 |
| FR-015 | – | validation × 67, not-found × 16 |
| FR-016 | – | read-endpoints × 2 |
| FR-017 | 1 | read-endpoints × 2 |
| FR-018 | – | read-endpoints × 2 |

## Lacunas conhecidas

1. A suíte unitária não matou nenhuma mutação: elas estão no SQL e no schema, e o unitário usa repositório falso. A proteção do repository vem só da integração.
2. A mutação (b) depende de concorrência real: só os testes de concorrência a matam. A margem foi larga em uma execução, mas uma máquina muito lenta ou um pool serializado poderia deixá-la passar. Nenhum teste sequencial distingue SELECT + INSERT do INSERT atômico.
3. A (a) é morta de forma determinística por FR-002.
4. `PG_POOL max > 1` verifica configuração, não comportamento: exceção deliberada registrada no Complexity Tracking.
5. A remoção da criadora entre o INSERT e a contagem (FR-012) só é coberta pelo teste unitário com repositório falso.
6. Sem mutação: o caminho do DELETE e o `isFollowing`; não foi testada uma variante de (d) que trate qualquer erro como `'missingReference'`.
7. FR-019 a FR-030 ficam para a Fase 3 (E2E); o hash será regerado em T050.
