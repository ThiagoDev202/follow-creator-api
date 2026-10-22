# 0002. Idempotência e concorrência

- **Status**: Aceito
- **Data**: 2026-10-22

## Contexto

O mesmo usuário não pode seguir a mesma criadora duas vezes, nem com requisições simultâneas.
Vários usuários seguindo ao mesmo tempo devem resultar em contagem exata, e seguir e deixar de
seguir simultâneos não podem corromper o estado.

## Decisão

- Tabela `follows` com PRIMARY KEY composta `(creator_id, user_id)`: a unicidade é do banco.
- Seguir é um único comando: `INSERT INTO follows (creator_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING 1`. Linha retornada significa criado; nenhuma, já existia.
- POST responde 201 quando cria e 200 quando já seguia, sempre com `{ creatorId, count }`.
- DELETE é idempotente: 204 seguindo ou não.
- Seguir e deixar de seguir simultâneos: vale a última operação aplicada no banco (last-write-wins). Cada comando é atômico em READ COMMITTED, sem transação explícita.
- Contagem com `COUNT(*)::int` em consulta separada, depois da escrita. O `::int` garante número em JSON, e não texto (o `pg` devolve `bigint` como string).
- A página só atualiza o botão e a contagem depois que a ação foi aceita (resposta 2xx) e a contagem foi lida de novo em `GET /creators/:creatorId/followers/count`; se o usuário selecionado mudou nesse intervalo, a resposta é descartada. Falha em qualquer etapa mostra uma mensagem em português e mantém o estado anterior.
- Durante a ação o seletor de usuário fica desabilitado e o botão recebe `aria-disabled="true"` e `aria-busy="true"` em vez de `disabled`, para o foco do teclado não sair do botão; uma trava interna barra o segundo clique, então há um único POST ou DELETE por ação.
- Criadora ou usuário inexistente na escrita é detectado pelo erro de FK `23503`, sem consulta prévia.

## Alternativas

- **SELECT seguido de INSERT**: duas requisições simultâneas podem ler "não segue" e ambas tentar inserir; exige tratar o erro de unicidade como fluxo.
- **Contador denormalizado em `creators`**: precisa ser mantido em sincronia com `follows` e cria disputa de linha a cada seguir.
- **CTE juntando INSERT e COUNT**: o COUNT da mesma instrução não enxerga a linha recém-inserida, então a contagem sai defasada.

- **Atualizar a página de forma otimista** (trocar botão e somar 1 antes da resposta): mostraria estado que o servidor pode recusar e uma contagem que não vem do banco.
- **`disabled` no botão durante a ação**: o navegador tira o foco de um botão desabilitado e quem usa teclado perderia a posição.

## Consequências

- A corretude sob concorrência não depende de código da aplicação, só de restrições do banco.
- A contagem devolvida no POST reflete o momento da leitura e pode incluir ações de outros usuários feitas entre a escrita e a contagem.
- Os testes de integração provam o comportamento com requisições simultâneas reais.
