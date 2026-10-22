# 0004. Sem autenticação

- **Status**: Aceito
- **Data**: 2026-10-22

## Contexto

O enunciado define que o usuário é enviado no corpo (`userId`) ou na rota. Não há login, e
autenticação está fora do escopo do desafio.

## Decisão

O `userId` é confiado ao cliente, como pede o enunciado. A página escolhe o usuário num seletor
"Você é".

## Alternativas

- **Sessão ou token (JWT, OAuth)**: o usuário viria da credencial e não do corpo, o que muda o contrato do enunciado e exige cadastro e login.

## Consequências

- **Risco**: qualquer cliente pode seguir ou deixar de seguir em nome de qualquer usuário.
- O sistema não deve ser exposto publicamente assim. Para produção, o usuário teria de vir de uma credencial autenticada, e o contrato mudaria.
