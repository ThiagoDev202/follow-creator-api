# Quickstart: validar a feature

## Pré-requisitos

Node 24, npm, Docker com Compose.

## Subir tudo pelo Compose

```bash
cp .env.example .env
docker compose up -d --build
```

Abrir http://localhost:3000. Esperado: Luna Prado, "0 seguidores", seletor "Você é" com Ana e botão
"Seguir".

## Conferir o contrato com curl

```bash
curl -i -X POST localhost:3000/creators/1/followers -H 'Content-Type: application/json' -d '{"userId":1}'
curl -i -X POST localhost:3000/creators/1/followers -H 'Content-Type: application/json' -d '{"userId":1}'
curl -i localhost:3000/creators/1/followers/count
curl -i -X DELETE localhost:3000/creators/1/followers/1
curl -i localhost:3000/creators/999/followers/count
curl -i localhost:3000/creators/abc/followers/count
```

Esperado, na ordem: 201 `{"creatorId":1,"count":1}`; 200 com o mesmo corpo; 200
`{"creatorId":1,"count":1}`; 204; 404 `CREATOR_NOT_FOUND` "Criadora não encontrada."; 400
`VALIDATION_ERROR` "Requisição inválida.". Contrato completo em
[contracts/http-api.md](contracts/http-api.md).

## Rodar os testes no host

```bash
npm ci
npx playwright install chromium
npm run db:up
npm run verify
```

Ou cada nível: `npm run test:unit`, `npm run test:int`, `npm run test:e2e`. Esperado: tudo verde;
screenshots em `specs/001-seguir-criadora/evidence/`.
