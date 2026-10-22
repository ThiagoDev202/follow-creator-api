# 0003. Contrato e erros

- **Status**: Aceito
- **Data**: 2026-10-22

## Contexto

O enunciado fixa três endpoints. A página também precisa do nome da criadora, de saber se o
usuário atual a segue e da lista de usuários. O enunciado não define formato de erro nem limites
dos identificadores.

## Decisão

- Os três endpoints do enunciado ficam exatamente como definidos.
- Três endpoints extras, só de leitura: `GET /creators/:creatorId`, `GET /creators/:creatorId/followers/:userId` e `GET /users`.
- Erros sempre como `{ "error": { "code", "message" } }`: chaves e `code` em inglês (`VALIDATION_ERROR`, `CREATOR_NOT_FOUND`, `USER_NOT_FOUND`, `NOT_FOUND`, `INTERNAL_ERROR`), `message` em português.
- Identificadores são inteiros positivos até 2147483647 (limite do `integer` do PostgreSQL); fora disso, 400. No corpo, `userId` precisa ser número; a string `"1"` é inválida.
- Se criadora e usuário não existem, a resposta é `CREATOR_NOT_FOUND`.
- Erro inesperado responde 500 sem stack, com log em inglês.

## Alternativas

- **Reaproveitar o formato padrão do Nest** (`statusCode`, `message`, `error`): mensagens em inglês e formato diferente entre erros de validação e de domínio.
- **Aceitar `"1"` como número**: conversão implícita esconde cliente mal formado.
- **Sem limite de id**: um id acima do `integer` causaria erro do banco e 500.

## Consequências

- O cliente distingue os casos pelo `code`, e o usuário lê a `message` em português.
- Nenhuma entrada inválida previsível chega ao banco.
- Os endpoints extras não escrevem nada, então não mudam as garantias do contrato.
