# Contrato da página

Servida em `/` a partir de `public/`. Textos exatos que os testes E2E procuram.

## URL

`/?creatorId=<id>`; ausente ou vazio → `1`.

## Elementos (papel e nome acessível)

| Elemento | Papel / atributo | Texto |
|----------|------------------|-------|
| Seletor de usuário | `combobox` com label | "Você é" |
| Nome da criadora | `heading` nível 1 | nome da criadora, por exemplo "Luna Prado" |
| Avatar | `aria-hidden="true"` | iniciais, por exemplo "LP" |
| Contagem | região com `aria-live="polite"` | "0 seguidores", "1 seguidor", "N seguidores" |
| Botão | `button` com `aria-pressed` | "Seguir" (`aria-pressed="false"`) ou "Deixar de seguir" (`aria-pressed="true"`) |
| Área de erro | `alert` | vazia ou com a mensagem |
| Carregamento | texto | "Carregando…" |

## Estados

| Estado | O que aparece |
|--------|---------------|
| Carregando | "Carregando…"; sem botão |
| Pronto | seletor, nome, avatar, contagem e botão |
| Ação em andamento | botão desabilitado com `aria-busy="true"` |
| Falha da ação (inclusive falha na releitura da contagem) | alerta "Não foi possível concluir a ação. Tente novamente."; contagem e botão como estavam |
| Criadora inexistente ou `creatorId` inválido | alerta "Criadora não encontrada."; sem seletor, contagem nem botão |
| Falha no carregamento inicial | alerta "Não foi possível concluir a ação. Tente novamente."; sem botão |

## Requisições

| Momento | Requisições |
|---------|-------------|
| Carregamento | em paralelo `GET /users`, `GET /creators/:id` e `GET /creators/:id/followers/count`; depois `GET /creators/:id/followers/:userId` do primeiro usuário |
| Troca de usuário | `GET /creators/:id/followers/:userId` |
| Clique em "Seguir" | `POST /creators/:id/followers` e, se 2xx, `GET /creators/:id/followers/count`; só depois da contagem o botão e a contagem mudam |
| Clique em "Deixar de seguir" | `DELETE /creators/:id/followers/:userId` e, se 2xx, `GET /creators/:id/followers/count`; só depois da contagem o botão e a contagem mudam |

A contagem exibida vem sempre do servidor; nunca é ajustada localmente.
