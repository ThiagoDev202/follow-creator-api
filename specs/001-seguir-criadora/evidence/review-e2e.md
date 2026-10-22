# Revisão da Fase 3 (página + E2E): T058

Revisor: reviewer (agente com o texto de `.claude/agents/reviewer.md`), somente leitura. Nenhum arquivo do repositório foi criado, editado ou apagado e não houve commit. O E2E não foi rodado e `evidence/` não mudou.

Escopo: `public/`, `e2e/**`, `tests/integration/validation.spec.ts`, `src/common/filters/http-exception.filter.ts`, `tsconfig*.json`, `nest-cli.json`, `playwright.config.ts`, `package.json`, `eslint.config.mjs`, `Dockerfile`, `src/database/database.module.ts` e as evidências (`red-e2e.txt`, `mutacoes-e2e.md`, `review-api.md`, `suposicoes.md`, `tests.sha256`), conferidos contra AGENTS.md, a constituição, spec, plan, tasks e contratos.

Comandos rodados: `sha256sum -c --quiet` (saída 0, 23 entradas, lista idêntica); `npm run lint` sem erros nem avisos; `test:unit` 20/20; `test:int` 110/110; sondagem da página com o build atual (porta 3197, banco de teste) por script Playwright fora do repositório, sem screenshots; relações criadas apagadas no fim e servidor encerrado.

## Bloqueante

Nenhum.

## Importante

### I1. Corrida: trocar de usuário durante uma ação mostra o estado errado para o novo usuário

- **Onde:** `public/app.js:84` guarda `userId`, mas `public/app.js:99` faz `following = !following` sobre o valor atual de `following`, que pode já ter sido trocado por `onUserChange` (`public/app.js:62-65`). O seletor (`public/index.html:15`) continua habilitado durante a ação.
- **Evidência (sondagem):** Ana e Bruno não seguem; o POST de Ana fica retido; troca para Bruno (`GET .../followers/2` responde `false`); o POST é liberado. Resultado: seletor em Bruno com o botão "Deixar de seguir" e `aria-pressed="true"`, enquanto a API diz `{ following: false }`.
- **Por que importa:** contraria FR-022 e o contrato da página (o botão reflete o estado lido); o leitor de tela anuncia "pressionado" para quem não segue. Nenhum E2E cobre.
- **Correção sugerida:** desabilitar o seletor enquanto `busy`, ou derivar o novo estado da ação feita e só renderizar se `userId === select.value`. Ordem: o qa-guardian escreve o E2E que falha, depois o developer corrige.

### I2. O foco do teclado se perde depois de cada ação

- **Onde:** `public/app.js:82` (`button.disabled = true`) com o botão focado; o Chromium tira o foco de um elemento desabilitado e `public/app.js:105-107` não o devolve.
- **Evidência (sondagem):** antes do Enter, `document.activeElement.id === 'follow-button'`; depois da ação, `document.activeElement` é `BODY`. Um segundo Espaço não faz nada.
- **Por que importa:** FR-028 e FR-029: quem usa só o teclado precisa voltar ao início da página a cada ação; o leitor de tela não ouve o novo `aria-pressed`. O E2E de teclado (`e2e/page-a11y.spec.ts:46-55` e `:65-76`) faz uma única ação e não confere o foco depois.
- **Correção sugerida:** usar `aria-disabled="true"` com a trava `busy` existente no lugar de `disabled`, ou devolver o foco ao botão no `finally`. Ordem: o qa-guardian acrescenta `toBeFocused()` depois da ação (red), depois o developer corrige.

## Menor

- **M1.** A troca de usuário que falha deixa o estado do usuário anterior e a mensagem fica para trás (`public/app.js:58-74`; só o clique limpa a área de erro em `:81`). O contrato não define esse estado.
- **M2.** O ramo `status === 400` do carregamento (`public/app.js:121`) não tem teste: `abc` e `0` são barrados antes pela regex; `?creatorId=2147483648` mostraria a falha genérica sem nenhum teste falhar.
- **M3.** A trava `busy` (`public/app.js:77-79`) não é exercida por nenhum teste, porque o `dblclick` já cai no botão desabilitado; a mutação (f) removeu a trava e o `disabled` juntos.
- **M4.** `e2e/global-setup.ts:4-11` repete `tests/helpers/global-setup.ts:4-11`.
- **M5.** O lint não cobre `public/app.js` nem `playwright.config.ts` (`package.json:16`).
- **M6.** Os menores da revisão da API M1 a M6 não foram tratados nem registrados como aceitos (pool sem ouvinte de `error`; log do 500 sem stack; `strictPropertyInitialization: false`; `no-floating-promises` e `no-unsafe-argument` como `warn`; dependências sem uso; container final como root).

## Itens sem achado

1. **FR → tarefa → teste e ordem QA → DEV:** FR-019 a FR-030 têm teste E2E com o FR no título (20 testes em 4 arquivos); T043 a T050 [QA] antes de T051 a T054 [DEV]; red de 19:02:46 com 20 de 20 falhando por asserção e 3 falhas de integração, exatamente os testes novos de FR-014; hash de 19:02:59 anterior às mudanças do developer.
2. **Endpoints:** nenhuma rota nova; a página usa só os 3 do enunciado e as 3 leituras extras, na ordem de `contracts/page.md`.
3. **Hash:** saída 0 e lista idêntica (23 arquivos); todos os arquivos de `e2e/` e `tests/` têm mtime anterior ao hash, o que prova que o developer não os tocou; o verde final corresponde ao `app.js` atual.
4. **Escrita no banco:** sem mudança fora do filtro; a contagem da página nunca é ajustada localmente.
5. **Erros previsíveis:** o filtro mapeia todo erro não `HttpException` com `status` de 400 a 499 para 400 `VALIDATION_ERROR`; cobertura em `tests/integration/validation.spec.ts:149-181` (corpo de 200 KB, `charset=latin1`, `Content-Encoding: foo`); build corrigido (`incremental` removido; `dist/main.js` coerente com `start`, `webServer` e `Dockerfile`).
6. **Camadas:** o filtro só traduz HTTP; nenhum SQL ou regra fora do lugar.
7. **Comentários, `any` e idioma:** nada em `public/`, `e2e/`, `src/` e `playwright.config.ts`; textos da página em português, identificadores em inglês.
8. **Segredos:** `.env.example` só com `change_me`; compose com `${VAR:?}`; `.env` ignorado e fora do `git ls-files`.
9. **Página:** sem `innerHTML`, `outerHTML`, `insertAdjacentHTML` ou `eval`; `label for` ligado ao `select`; ordem de Tab seletor e botão; `aria-pressed`, `aria-live="polite"`, `role="alert"` e `:focus-visible`; contagem sempre do servidor e botão só muda depois dela; `?creatorId=` inválido não chama a API (confirmado com `..%2Fusers`, `1%0A`, `%20`, `1.0`, `+1`).
10. **Testes E2E:** locators só por papel e nome acessível; nenhum `waitForTimeout`; asserções estritas; gate de requisições sem depender de tempo; FR-024 com dois contextos reais; a mutação (e) morreu. O import dinâmico de `e2e/fixtures.ts` é justificado e registrado.
11. **Over-engineering:** página sem framework nem build, `app.js` com 155 linhas; só a duplicação de M4.

## Veredito

**Fase 3 aprovada com condições, sem achados bloqueantes.** Antes da Fase 4, I1 e I2 devem ser corrigidos no fluxo red → green (E2E que falha, correção do developer em `public/app.js`, hash regerado e mutação conferida). Os menores M1 a M6 devem ser corrigidos ou registrados em `suposicoes.md`.
