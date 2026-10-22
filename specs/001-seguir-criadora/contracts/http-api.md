# Contrato HTTP

Sem prefixo global. Corpo e respostas em JSON. Os três primeiros endpoints são os do enunciado e
não podem mudar.

## Identificadores

`creatorId` e `userId` na rota: só `/^[1-9]\d*$/` e valor `<= 2147483647`. `userId` no corpo:
inteiro JSON de 1 a 2147483647. Qualquer outro valor → 400 `VALIDATION_ERROR`.

## POST /creators/{creatorId}/followers

Corpo: `{ "userId": 1 }`. Campos extras são rejeitados.

| Caso | Status | Corpo |
|------|--------|-------|
| Passou a seguir | 201 | `{ "creatorId": 1, "count": 1 }` |
| Já seguia | 200 | `{ "creatorId": 1, "count": 1 }` |
| Corpo ou id inválido, JSON malformado | 400 | erro `VALIDATION_ERROR` |
| Criadora inexistente (inclusive com usuário inexistente) | 404 | erro `CREATOR_NOT_FOUND` |
| Usuário inexistente | 404 | erro `USER_NOT_FOUND` |

## DELETE /creators/{creatorId}/followers/{userId}

| Caso | Status | Corpo |
|------|--------|-------|
| Seguia ou não seguia | 204 | vazio |
| Id inválido | 400 | erro `VALIDATION_ERROR` |
| Criadora inexistente (inclusive com usuário inexistente) | 404 | erro `CREATOR_NOT_FOUND` |
| Usuário inexistente | 404 | erro `USER_NOT_FOUND` |

## GET /creators/{creatorId}/followers/count

| Caso | Status | Corpo |
|------|--------|-------|
| Sucesso | 200 | `{ "creatorId": 1, "count": 2 }` (`count` sempre número) |
| Id inválido | 400 | erro `VALIDATION_ERROR` |
| Criadora inexistente | 404 | erro `CREATOR_NOT_FOUND` |

## GET /creators/{creatorId}/followers/{userId} (extra, só leitura)

| Caso | Status | Corpo |
|------|--------|-------|
| Sucesso | 200 | `{ "following": true }` |
| Id inválido | 400 | erro `VALIDATION_ERROR` |
| Criadora inexistente (inclusive com usuário inexistente) | 404 | erro `CREATOR_NOT_FOUND` |
| Usuário inexistente | 404 | erro `USER_NOT_FOUND` |

## GET /creators/{creatorId} (extra, só leitura)

| Caso | Status | Corpo |
|------|--------|-------|
| Sucesso | 200 | `{ "id": 1, "name": "Luna Prado" }` |
| Id inválido | 400 | erro `VALIDATION_ERROR` |
| Criadora inexistente | 404 | erro `CREATOR_NOT_FOUND` |

## GET /users (extra, só leitura)

| Caso | Status | Corpo |
|------|--------|-------|
| Sucesso | 200 | `[{ "id": 1, "name": "Ana" }, { "id": 2, "name": "Bruno" }, { "id": 3, "name": "Carla" }]` em ordem de id |

## Formato de erro

```json
{ "error": { "code": "CREATOR_NOT_FOUND", "message": "Criadora não encontrada." } }
```

| code | Status | message |
|------|--------|---------|
| `VALIDATION_ERROR` | 400 | `Requisição inválida.` |
| `CREATOR_NOT_FOUND` | 404 | `Criadora não encontrada.` |
| `USER_NOT_FOUND` | 404 | `Usuário não encontrado.` |
| `NOT_FOUND` | 404 | `Recurso não encontrado.` |
| `INTERNAL_ERROR` | 500 | `Erro interno.` |

A resposta 500 nunca traz stack.
