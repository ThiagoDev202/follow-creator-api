# Data Model: Seguir criadora

SQL completo em [plan.md](plan.md#banco).

## users

| Coluna | Tipo | Regras |
|--------|------|--------|
| `id` | `integer` identity | PRIMARY KEY; 1 a 2147483647 |
| `name` | `text` | NOT NULL |

Seed: 1 Ana, 2 Bruno, 3 Carla.

## creators

| Coluna | Tipo | Regras |
|--------|------|--------|
| `id` | `integer` identity | PRIMARY KEY; 1 a 2147483647 |
| `name` | `text` | NOT NULL |

Seed: 1 Luna Prado, 2 Mel Duarte.

## follows

| Coluna | Tipo | Regras |
|--------|------|--------|
| `creator_id` | `integer` | NOT NULL; FK `creators(id)` ON DELETE CASCADE |
| `user_id` | `integer` | NOT NULL; FK `users(id)` ON DELETE CASCADE |
| `created_at` | `timestamptz` | NOT NULL DEFAULT `now()` |

- PRIMARY KEY `(creator_id, user_id)`: no máximo uma relação por par (FR-005).
- Índice em `user_id`; `creator_id` já é coberto pela PK.

## Relações

- Usuário 1—N follows N—1 Criadora.
- Seguidores de uma criadora = `COUNT(*)` de `follows` com aquele `creator_id`, calculado a cada leitura (sem contador armazenado).

## Estados de uma relação usuário–criadora

```text
não segue --seguir (201)--> segue
segue --seguir (200)--> segue
segue --deixar de seguir (204)--> não segue
não segue --deixar de seguir (204)--> não segue
```

## Mapeamento no repository

`creator_id` → `creatorId`, `user_id` → `userId`, `creator_exists` → `creatorExists`,
`user_exists` → `userExists`. Nenhuma linha do banco é devolvida diretamente na resposta.
