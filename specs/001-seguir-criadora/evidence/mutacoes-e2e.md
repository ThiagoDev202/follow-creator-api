# Validação E2E: hash, mutações e screenshots (revalidação após I1 e I2)

Autor: qa-guardian (agente genérico com o texto de `.claude/agents/qa-guardian.md`). Sem commit; nenhum teste editado; `src/`, `public/`, `db/` e `scripts/` sem mudança permanente; sem `git restore`, `checkout`, `stash` ou `worktree`.

## Hash dos testes

- `sha256sum -c --quiet specs/001-seguir-criadora/evidence/tests.sha256`: código de saída 0 (23 entradas).
- `find tests e2e jest.unit.config.ts jest.int.config.ts playwright.config.ts -type f | sort` contra os caminhos do hash: `diff` vazio; 23 arquivos dos dois lados, nenhum novo e nenhum removido.
- Conferido de novo depois das mutações: código 0.
- Resultado: íntegro, sem divergência.

## Mutações em `public/app.js`

O original foi copiado para o scratchpad (sha256 `e1fe56c8...7682`) e conferido com `cmp` antes de cada mutação. Para cada uma: diff mostrado, E2E rodado, restauração com `cp`, `cmp` e sha256, E2E de novo. Suíte de referência: 26/26.

| Mutação | Testes que falharam | Resultado | Restauração |
|---|---|---|---|
| (e) contagem atualizada localmente (+1/-1), sem reler `GET .../count` | `page-actions:206` FR-026 (a mensagem de falha não apareceu depois do 500 na releitura); `page-multi-user:11` FR-024 (Bruno não viu "2 seguidores"); `page-actions:235` FR-022 (timeout esperando a releitura, falha colateral) | Morta (3 falharam, 23 passaram) | cmp OK; sha256 igual; 26/26 |
| (f) botão não é travado nem sinalizado durante a requisição (sem trava `busy`, sem `aria-disabled`) | `page-actions:80` FR-025 (`toBeDisabled` recebeu "enabled"); `page-actions:297` FR-025 (`['POST','POST']`) | Morta (2 falharam, 24 passaram) | cmp OK; sha256 igual; 26/26 |
| (g) só a trava `busy` removida, com `aria-disabled` mantido | `page-actions:80` e `page-actions:297` FR-025 (`['POST','POST']`) | Morta (2 falharam, 24 passaram) | cmp OK; sha256 igual; 26/26 |
| (h) `disabled` real no lugar de `aria-disabled` durante a ação | `page-a11y:141` [Enter] e [Space], FR-028 e FR-029 (`toBeFocused` recebeu "inactive") | Morta (2 falharam, 24 passaram) | cmp OK; sha256 igual; 26/26 |
| (i) estado renderizado sem checar se o usuário ainda é o selecionado, e seletor não desabilitado | `page-actions:235` FR-022 (não existe botão "Seguir" com `pressed: false` para Bruno) | Morta (1 falhou, 25 passaram) | cmp OK; sha256 igual; 26/26 |

O que mudou em cada mutação:

- (e): `let currentCount = 0;` e `renderCount` guardando `currentCount = count`; em `onButtonClick`, a leitura de `GET .../count` virou `const count = currentCount + (following ? -1 : 1);`.
- (f): em `onButtonClick`, saíram o guarda `if (busy) { return; }`, o `setAttribute('aria-disabled', 'true')` e o `removeAttribute('aria-disabled')` do `finally`; ficaram `busy = true`, `aria-busy` e `select.disabled`.
- (g): saiu só o guarda `if (busy) { return; }`.
- (h): `aria-disabled` trocado por `button.disabled = true` (e `false` no `finally`), com a trava `busy` mantida.
- (i): saiu `select.disabled = true` e a condição `if (userId === select.value)`, deixando as três chamadas de renderização incondicionais.

Observações: na (g), os dois testes de FR-025 detectam a ausência da trava sozinhos. Na (h), os testes de duplo clique sobrevivem, como esperado, porque o `disabled` real também barra o segundo clique; só os testes de foco detectam. Na (e), a falha de `page-actions:235` é colateral; a detecção real vem de `:206` e de `page-multi-user:11`.

No fim, `public/app.js` ficou idêntico ao original (cmp e sha256), `npm run test:e2e` deu 26/26 e a porta 3100 ficou livre.

## FR-019 a FR-030 → testes E2E

`npx playwright test --list`: 26 testes em 4 arquivos. Todo teste cita ao menos um FR.

| FR | Testes | Qtde |
|---|---|---|
| FR-019 | page-load:13, page-actions:17 | 2 |
| FR-020 | page-load:34 (`?creatorId=2`), page-load:45 (vazio usa a criadora 1) | 2 |
| FR-021 | page-load:56 × 4 (999, abc, 0, 2147483648) | 4 |
| FR-022 | page-load:13, page-actions:46, page-actions:235 (troca durante a ação), page-actions:335 (troca com 500 e depois troca ok) | 4 |
| FR-023 | page-load:13, page-actions:17, page-actions:46, page-multi-user:11 | 4 |
| FR-024 | page-multi-user:11 | 1 |
| FR-025 | page-actions:80 (dblclick), page-actions:297 (dois cliques na mesma tarefa) | 2 |
| FR-026 | page-actions:121 (rede), :151 (500 no POST), :178 (500 no DELETE), :206 (500 na releitura), :335 (500 na troca de usuário) | 5 |
| FR-027 | page-load:70 | 1 |
| FR-028 | page-a11y:30 (Tab, seta, Enter), page-a11y:58 (Tab, Espaço), page-a11y:141 × 2 (foco com Enter e com Espaço) | 4 |
| FR-029 | page-a11y:79, page-a11y:141 × 2 | 3 |
| FR-030 | page-a11y:112 × 2 (375×812 e 1280×800) | 2 |

## Lacunas conhecidas

As lacunas "troca de usuário durante a ação" e "erro ao reler o estado na troca de usuário" estão cobertas por page-actions:235 e :335. Continuam abertas:

- Falha não-404 no carregamento inicial (500 ou rede em `/users`, `/creators/:id` ou na contagem): nenhum E2E cobre.
- Foco depois de uma ação que falha: não verificado; os testes de foco cobrem só o sucesso.
- A trava `busy` é exercitada só por eventos de clique; não há teste de Enter ou Espaço repetidos durante a ação.
- FR-029 é verificado por atributos (`aria-pressed`, `aria-live="polite"`), não com leitor de tela real.
- FR-030 é verificado por `scrollWidth <= largura`, pelas caixas e pela visibilidade, em duas larguras; sem teste de zoom nem de orientação.
- Só Chromium.

## Screenshots

PNG válidos de 1280×720, não vazios, gravados na execução final verde (26/26):

- `inicial.png` (15.283 bytes): card com "Você é" em Ana, avatar "LP", "Luna Prado", "0 seguidores" e o botão "Seguir".
- `seguindo.png` (15.956 bytes): o mesmo card com "1 seguidor" e o botão com contorno "Deixar de seguir".
- `erro.png` (21.572 bytes): o card com "0 seguidores", o botão "Seguir" e a mensagem em vermelho "Não foi possível concluir a ação. Tente novamente.".
