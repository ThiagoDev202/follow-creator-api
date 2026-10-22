# Feature Specification: Seguir criadora

**Feature Branch**: `001-seguir-criadora`

**Created**: 2026-10-22

**Status**: Draft

**Input**: User description: "Seguir criadora: uma API e uma página em que um usuário segue e deixa de seguir uma criadora e vê quantos seguidores ela tem."

## Contrato obrigatório

Definido pelo cliente; não pode ser alterado.

| Operação | Requisição | Resposta |
|----------|-----------|----------|
| Seguir | `POST /creators/{creatorId}/followers` com corpo `{ "userId": ... }` | informa se a relação foi criada ou já existia |
| Deixar de seguir | `DELETE /creators/{creatorId}/followers/{userId}` | confirma, seguindo ou não |
| Contagem | `GET /creators/{creatorId}/followers/count` | `{ "creatorId": ..., "count": ... }` |

Leituras extras, só para a página: nome da criadora, se um usuário segue uma criadora e lista de usuários.

Dados pré-cadastrados: usuários 1 Ana, 2 Bruno e 3 Carla; criadoras 1 Luna Prado e 2 Mel Duarte. Não há login: o usuário é informado na requisição e escolhido numa lista na página.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seguir e deixar de seguir pela API (Priority: P1)

Um cliente da API faz um usuário seguir uma criadora, deixar de segui-la e consulta quantos
seguidores ela tem. Repetir uma operação nunca causa dano.

**Why this priority**: é o contrato do enunciado; sem ele não existe produto.

**Independent Test**: com o banco no estado inicial, chamar seguir, contagem e deixar de seguir
para Ana e Luna Prado e conferir respostas e contagens.

**Acceptance Scenarios**:

1. **Given** Ana não segue Luna Prado, **When** Ana segue Luna Prado, **Then** a resposta informa que a relação foi criada e a contagem de Luna Prado passa a 1.
2. **Given** Ana já segue Luna Prado, **When** Ana segue Luna Prado de novo, **Then** a resposta informa que a relação já existia e a contagem continua 1.
3. **Given** Ana segue Luna Prado, **When** Ana deixa de seguir, **Then** a operação é confirmada e a contagem volta a 0.
4. **Given** Ana não segue Luna Prado, **When** Ana deixa de seguir, **Then** a operação é confirmada da mesma forma e nada muda.

---

### User Story 2 - Página da criadora (Priority: P2)

Uma pessoa abre a página, escolhe quem ela é no seletor "Você é", vê o nome da criadora e quantos
seguidores ela tem e usa o botão "Seguir" / "Deixar de seguir".

**Why this priority**: é a interface pedida no enunciado, mas depende da API.

**Independent Test**: abrir a página com o banco no estado inicial, seguir e deixar de seguir e
conferir botão e contagem.

**Acceptance Scenarios**:

1. **Given** o banco no estado inicial, **When** a página abre sem parâmetros, **Then** mostra Luna Prado, "0 seguidores", o seletor "Você é" com Ana e o botão "Seguir".
2. **Given** a página de Luna Prado com Ana selecionada, **When** Ana clica em "Seguir", **Then** o botão passa a "Deixar de seguir" e a contagem a "1 seguidor".
3. **Given** a página aberta com `?creatorId=999`, **When** carrega, **Then** mostra "Criadora não encontrada." e nenhum botão.

---

### User Story 3 - Robustez sob concorrência e entradas inválidas (Priority: P3)

Requisições simultâneas, identificadores inválidos e registros inexistentes nunca corrompem o
estado nem geram erro interno; o cliente recebe uma resposta clara em português.

**Why this priority**: garante a confiabilidade das histórias 1 e 2.

**Independent Test**: disparar requisições simultâneas e entradas inválidas contra a API e conferir
estado final, contagens e respostas.

**Acceptance Scenarios**:

1. **Given** Ana não segue Luna Prado, **When** 30 pedidos simultâneos de Ana para seguir Luna Prado chegam, **Then** existe uma única relação, só um pedido é reportado como criação e a contagem é 1.
2. **Given** 30 usuários que não seguem Luna Prado, **When** todos seguem ao mesmo tempo, **Then** a contagem é exatamente 30.
3. **Given** um identificador `abc`, **When** usado em qualquer operação, **Then** a resposta é requisição inválida com mensagem em português.

---

### Edge Cases

- Criadora e usuário inexistentes ao mesmo tempo: a resposta informa que a criadora não foi encontrada.
- Criadora ou usuário removido durante a operação: resposta de não encontrado indicando qual, nunca erro interno.
- Identificador `2147483648` (acima do limite): requisição inválida, nunca erro interno.
- `userId` enviado como texto (`"1"`): requisição inválida.
- Duplo clique no botão: uma única ação.
- Outro usuário segue a mesma criadora enquanto a página está aberta: após a próxima ação, a contagem exibida já inclui esse seguidor.
- `?creatorId=` ausente ou vazio: a página usa a criadora 1.
- `?creatorId=` inválido (por exemplo `abc` ou `0`): a página mostra "Criadora não encontrada." e nenhum botão.

## Requirements *(mandatory)*

### Functional Requirements

#### API: seguir e deixar de seguir

- **FR-001**: Seguir DEVE criar a relação entre usuário e criadora e informar que ela foi criada.
  - **Given** Ana não segue Luna Prado, **When** `POST /creators/1/followers` com `{ "userId": 1 }`, **Then** a resposta informa criação e a contagem de Luna Prado passa a 1.
- **FR-002**: Seguir de novo DEVE ser inofensivo e informar que a relação já existia.
  - **Given** Ana segue Luna Prado, **When** o mesmo pedido é repetido, **Then** a resposta informa que já existia e a contagem continua 1.
- **FR-003**: Deixar de seguir DEVE remover a relação e confirmar a operação.
  - **Given** Ana segue Luna Prado, **When** `DELETE /creators/1/followers/1`, **Then** a operação é confirmada e a contagem passa a 0.
- **FR-004**: Deixar de seguir DEVE ser idempotente, inclusive para quem não seguia.
  - **Given** Ana não segue Luna Prado, **When** `DELETE /creators/1/followers/1`, **Then** a resposta é a mesma confirmação de FR-003 e a contagem continua 0.

#### API: concorrência

- **FR-005**: O mesmo usuário NUNCA DEVE seguir a mesma criadora duas vezes, nem com requisições simultâneas, e só uma delas DEVE ser reportada como criação.
  - **Given** Ana não segue Luna Prado, **When** 30 pedidos simultâneos de seguir de Ana chegam, **Then** exatamente 1 é reportado como criação, 29 como já existente, e a contagem é 1.
- **FR-006**: Vários usuários seguindo a mesma criadora ao mesmo tempo DEVEM resultar em contagem exata.
  - **Given** 30 usuários que não seguem Luna Prado, **When** todos seguem simultaneamente, **Then** a contagem é 30.
- **FR-007**: Seguir e deixar de seguir simultâneos do mesmo usuário NUNCA DEVEM corromper o estado nem gerar erro interno; o estado final DEVE ser o de uma das duas ordens.
  - **Given** Ana e Luna Prado, **When** 40 pedidos alternados de seguir e deixar de seguir chegam ao mesmo tempo, **Then** nenhum resulta em erro interno, existe no máximo 1 relação e a consulta "Ana segue Luna Prado?" coincide com o estado armazenado.

#### API: contagem

- **FR-008**: A contagem DEVE responder `{ "creatorId": ..., "count": ... }`, com `count` numérico (não texto) igual ao número real de seguidores naquele momento.
  - **Given** Ana e Bruno seguem Luna Prado, **When** `GET /creators/1/followers/count`, **Then** a resposta é `{ "creatorId": 1, "count": 2 }` com ambos os valores numéricos.

#### API: inexistentes

- **FR-009**: Criadora inexistente DEVE resultar em não encontrado indicando a criadora, em todas as operações que recebem criadora.
  - **Given** a criadora 999 não existe, **When** seguir, deixar de seguir, contagem, consulta de nome ou consulta de "segue?" com criadora 999, **Then** a resposta é não encontrado indicando a criadora.
- **FR-010**: Usuário inexistente DEVE resultar em não encontrado indicando o usuário.
  - **Given** o usuário 999 não existe, **When** seguir, deixar de seguir ou consulta de "segue?" com usuário 999 e criadora 1, **Then** a resposta é não encontrado indicando o usuário.
- **FR-011**: Se criadora e usuário não existem, a resposta DEVE indicar a criadora.
  - **Given** criadora 999 e usuário 999 inexistentes, **When** seguir ou deixar de seguir, **Then** a resposta é não encontrado indicando a criadora.
- **FR-012**: Criadora ou usuário removido durante a operação DEVE resultar em não encontrado indicando qual, nunca erro interno.
  - **Given** um usuário que deixa de existir antes do registro da relação, **When** ele segue uma criadora, **Then** a resposta é não encontrado indicando o usuário.

#### API: entradas inválidas

- **FR-013**: Identificador de criadora ou usuário na rota que não seja inteiro positivo até 2147483647 DEVE resultar em requisição inválida.
  - **Given** os identificadores `0`, `-1`, `abc`, `1.5` e `2147483648`, **When** usados como `creatorId` ou `userId` na rota, **Then** a resposta é requisição inválida.
- **FR-014**: Corpo de seguir sem `userId`, com `userId` que não seja número inteiro positivo até 2147483647 (inclusive o texto `"1"`), com campo extra ou malformado DEVE resultar em requisição inválida.
  - **Given** os corpos `{}`, `{ "userId": "1" }`, `{ "userId": 1, "extra": true }` e um JSON malformado, **When** enviados para seguir, **Then** a resposta é requisição inválida e nada é gravado.
- **FR-015**: Toda resposta de erro DEVE trazer uma mensagem ao usuário em português.
  - **Given** qualquer erro de FR-009 a FR-014, **When** a resposta é recebida, **Then** contém mensagem em português ("Criadora não encontrada.", "Usuário não encontrado." ou "Requisição inválida.").

#### API: leituras extras para a página

- **FR-016**: O sistema DEVE informar o nome de uma criadora.
  - **Given** a criadora 1, **When** consultada, **Then** a resposta traz o identificador 1 e o nome "Luna Prado".
- **FR-017**: O sistema DEVE informar se um usuário segue uma criadora.
  - **Given** Ana segue Luna Prado e Bruno não, **When** consultados, **Then** a resposta é "segue" para Ana e "não segue" para Bruno.
- **FR-018**: O sistema DEVE listar os usuários em ordem crescente de identificador.
  - **Given** o estado inicial, **When** a lista é consultada, **Then** traz Ana (1), Bruno (2) e Carla (3), nessa ordem.

#### Página

- **FR-019**: A página DEVE mostrar o nome da criadora, o número de seguidores e um botão "Seguir" ou "Deixar de seguir".
  - **Given** o estado inicial, **When** a página abre, **Then** mostra "Luna Prado", "0 seguidores" e o botão "Seguir".
- **FR-020**: A criadora exibida DEVE ser definida por `?creatorId=` na URL, com padrão 1 quando ausente ou vazio.
  - **Given** a URL com `?creatorId=2`, **When** a página abre, **Then** mostra "Mel Duarte".
- **FR-021**: Criadora inexistente ou `?creatorId=` inválido DEVE mostrar "Criadora não encontrada." e nenhum botão.
  - **Given** a URL com `?creatorId=999`, **When** a página abre, **Then** mostra "Criadora não encontrada." e não há botão "Seguir" nem "Deixar de seguir".
- **FR-022**: O usuário atual DEVE ser escolhido num seletor com rótulo "Você é", com o primeiro da lista como padrão; trocar o usuário DEVE atualizar o botão.
  - **Given** Ana segue Luna Prado e Bruno não, **When** a página abre e o seletor muda de Ana para Bruno, **Then** o botão passa de "Deixar de seguir" a "Seguir".
- **FR-023**: A contagem DEVE ser exibida como "1 seguidor" ou "N seguidores", inclusive "0 seguidores".
  - **Given** 0, 1 e 2 seguidores, **When** a página mostra a contagem, **Then** exibe "0 seguidores", "1 seguidor" e "2 seguidores".
- **FR-024**: A contagem exibida DEVE vir sempre do servidor; após uma ação, DEVE incluir ações de outros usuários feitas nesse meio tempo.
  - **Given** Ana e Bruno com a página aberta vendo "0 seguidores", **When** Ana segue e depois Bruno segue sem recarregar, **Then** a página de Bruno mostra "2 seguidores".
- **FR-025**: Durante uma ação o botão DEVE ficar desabilitado e um duplo clique DEVE gerar uma única ação.
  - **Given** a página com o botão "Seguir", **When** o botão recebe duplo clique, **Then** um único pedido de seguir é enviado.
- **FR-026**: Falha de rede ou erro do servidor DEVE mostrar "Não foi possível concluir a ação. Tente novamente." e manter contagem e botão como estavam.
  - **Given** a página com "0 seguidores" e botão "Seguir", **When** o pedido de seguir falha por rede, **Then** a mensagem aparece, a contagem continua "0 seguidores" e o botão continua "Seguir".
- **FR-027**: A página DEVE mostrar "Carregando…" até os dados iniciais chegarem.
  - **Given** os dados iniciais ainda não chegaram, **When** a página é exibida, **Then** mostra "Carregando…".
- **FR-028**: A página DEVE ser operável só pelo teclado.
  - **Given** a página carregada, **When** a pessoa usa apenas Tab, Enter, Espaço e setas, **Then** consegue escolher o usuário e seguir ou deixar de seguir.
- **FR-029**: O estado do botão e as mudanças da contagem DEVEM ser anunciados a leitores de tela.
  - **Given** a página carregada, **When** a pessoa segue, **Then** o botão expõe seu estado (pressionado ou não) e a nova contagem fica numa região anunciada automaticamente.
- **FR-030**: A página DEVE ser utilizável em celular e desktop.
  - **Given** uma tela de 375 px e outra de 1280 px de largura, **When** a página abre, **Then** todo o conteúdo fica visível sem rolagem horizontal.

### Key Entities

- **Usuário**: pessoa pré-cadastrada que segue criadoras; tem identificador e nome.
- **Criadora**: pessoa pré-cadastrada que é seguida; tem identificador e nome.
- **Relação de seguir**: liga um usuário a uma criadora; no máximo uma por par usuário–criadora; a contagem de seguidores de uma criadora é o número dessas relações.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das requisições do contrato obrigatório respondem no formato do enunciado.
- **SC-002**: Com 30 pedidos simultâneos de seguir do mesmo usuário, existe exatamente 1 relação e exatamente 1 pedido é reportado como criação.
- **SC-003**: Com 30 usuários seguindo ao mesmo tempo, a contagem é exatamente 30.
- **SC-004**: Nenhuma das entradas inválidas ou referências inexistentes listadas nesta spec produz erro interno.
- **SC-005**: Uma pessoa segue ou deixa de seguir uma criadora na página com uma única ação, usando mouse ou só o teclado.
- **SC-006**: 100% das mensagens exibidas ao usuário estão em português.

## Assumptions

- Usuários e criadoras são pré-cadastrados; não há cadastro, edição nem remoção pela API ou pela página.
- O limite dos identificadores é 2147483647; acima disso a requisição é inválida.
- O texto de confirmação de "deixar de seguir" é o mesmo para quem seguia e para quem não seguia.
- Quando seguir e deixar de seguir chegam ao mesmo tempo, vale a última operação aplicada.

### Fora de escopo

- Autenticação e autorização. **Risco**: qualquer cliente pode agir em nome de qualquer usuário, porque o `userId` vem da requisição, como define o enunciado.
- Cadastro de usuários ou criadoras.
- Notificações.
- Lista de seguidores de uma criadora.
- Paginação.
