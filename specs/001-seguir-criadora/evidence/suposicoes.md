# Suposições

Decisões tomadas sem perguntar, pela opção mais conservadora.

## Prompt 1 (constitution)

1. O comando `/speckit-constitution` limita seu escopo à constituição. AGENTS.md e `.claude/agents/` foram criados mesmo assim, porque o prompt pede explicitamente e são artefatos de governança, não código de aplicação.
2. Versão inicial da constituição: 1.0.0, ratificada e emendada em 2026-10-22 (data da criação).
3. O Sync Impact Report exigido pelo Spec Kit ficou como comentário HTML no topo da constituição. A regra "zero comentários" vale para código, não para documentação.
4. Seções da constituição em português, com os títulos estruturais do template (`Core Principles`, `Governance`) mantidos como no template do Spec Kit.

## Prompt 2 (specify)

1. Diretório da feature: `specs/001-seguir-criadora`, como fixa AGENTS.md. A numeração automática do Spec Kit daria `002`, porque a pasta já existia com `evidence/` criada no Prompt 1.
2. Sem branch de feature: não há extensão git do Spec Kit instalada; o trabalho segue em `main`.
3. Limite dos identificadores: 2147483647 (maior inteiro de 32 bits com sinal), para tornar "acima do limite" testável.
4. Mensagens de erro fixadas na spec: "Criadora não encontrada.", "Usuário não encontrado." e "Requisição inválida.".
5. `?creatorId=` ausente ou vazio usa a criadora 1; inválido (por exemplo `abc` ou `0`) é tratado como criadora inexistente: "Criadora não encontrada." e nenhum botão.
6. Lista de usuários em ordem crescente de identificador; o "primeiro da lista" é o de menor identificador (Ana).
7. Seguir e deixar de seguir simultâneos: vale a última operação aplicada.
8. Falha no carregamento inicial da página (rede ou servidor, exceto criadora inexistente) não foi especificada e não é exigida.
9. "Responsiva" foi tornada testável como: conteúdo visível sem rolagem horizontal em 375 px e 1280 px de largura.

## Prompt 3 (plan)

1. Os ADRs 0001 a 0005 foram escritos já nesta fase, porque o prompt os pede e o research.md precisa linkar arquivos existentes. Na fase 4 de tasks, a tarefa de ADRs passa a ser revisão e ajuste.
2. Os global setups de teste ficam em `tests/helpers/global-setup.ts` (Jest) e `e2e/global-setup.ts` (Playwright), de autoria do qa-guardian, porque `tests/` e `e2e/` são dele. Os configs (`jest.*.config.ts`, `playwright.config.ts`) são do developer e apenas apontam para esses arquivos.
3. `ServeStaticModule` sem fallback de SPA: por padrão ele devolveria `index.html` para qualquer GET desconhecido e capturaria rotas da API; sem fallback, rota inexistente responde 404 `NOT_FOUND`.
4. JSON malformado pode chegar ao filtro como erro do body-parser (não `HttpException`) com `status` 400; o filtro o trata como `VALIDATION_ERROR` para não virar 500.
5. Para cumprir "todo FR com teste", foram acrescentados testes que o prompt não listava: integração para FR-012 (registro removido antes da operação) e FR-016 a FR-018 (leituras extras); E2E para FR-020 (`?creatorId=2`), FR-027 ("Carregando…"), FR-028 (teclado), FR-029 (`aria-pressed` e `aria-live`) e FR-030 (375 px e 1280 px sem rolagem horizontal).
6. Página: `GET /creators/:id` com 400 (creatorId inválido) é tratado como criadora inexistente; falha no carregamento inicial por outro motivo mostra a mensagem genérica de falha e nenhum botão.
7. Arquivos que a CLI do Nest gera e o plano não usa são removidos (`app.controller.ts`, `app.service.ts`, `app.controller.spec.ts`, `test/`, bloco `jest` do `package.json`); os scripts npm são exatamente os da tabela do plan.
8. ESLint com `@typescript-eslint/no-explicit-any` como `error` (regra "sem any") e sem o comentário `// @ts-check` gerado pela CLI (regra "zero comentários").
9. Compose usa `${VAR:?}` para falhar se uma variável do `.env` faltar, em vez de valor padrão com credencial.
10. A rota `followers/count` é declarada antes de `followers/:userId`; "count" nunca é tratado como userId.
11. `engines`: `">=24 <25"`; `.nvmrc`: `24`.
12. `pg` e `dotenv` são dependências de produção, porque `scripts/db.mjs` roda no container final.

## Prompt 4 (tasks)

1. As fases seguem as 4 fixadas no prompt (setup, API, página + E2E, documentação), e não uma fase por história como no template do Spec Kit. A fase da API entrega US1 e US3; a da página entrega US2.
2. "NotImplementedError" não existe em JS/Nest; services e repositories do esqueleto usam `NotImplementedException` do `@nestjs/common`. Filtro e pipe do esqueleto são neutros (o filtro responde sempre 500 `INTERNAL_ERROR`, o pipe repassa o valor) e o DTO não tem decoradores, para o red falhar por asserção e não por setup. Infraestrutura sem regra (`main.ts`, `app.module.ts`, `database.module.ts`) já nasce funcional.
3. A Fase 1 cria um `public/index.html` mínimo, para o estático ter raiz antes da Fase 3.
4. O hash `evidence/tests.sha256` é conferido no início da Fase 3 (prova que `tests/` não mudou) e regerado depois do red E2E, cobrindo `tests/` e `e2e/`.
5. A tarefa de ADRs da Fase 4 é revisão e ajuste, porque os ADRs já foram escritos no Prompt 3; o developer é o dono de `README.md` e `docs/adr/`, como fixa AGENTS.md.
6. Os testes E2E reaproveitam o reset de `tests/helpers/database.ts`; ambos são do qa-guardian.
7. A tabela de cobertura FR → tarefas fica em `tasks.md`; o `npm run verify` final e o `evidence/verify.txt` ficam com a sessão principal no Prompt 5.
8. O subagente `reviewer` não estava carregado na sessão (os subagentes foram criados no Prompt 1, depois do último reinício do Claude Code). A auditoria foi feita por um agente genérico com o modelo opus, recebendo literalmente as instruções de `.claude/agents/reviewer.md` e restrito a ferramentas de leitura.
9. `AppModule` registra o `ValidationPipe` e o filtro com `APP_PIPE` e `APP_FILTER`, para que a app dos testes de integração (criada a partir do `AppModule`) os tenha sem repetir configuração.
10. Se `renderPath: '/'` não bastar para o `ServeStaticModule` deixar rota desconhecida cair em 404 `NOT_FOUND`, o developer usa a opção equivalente da biblioteca e registra a escolha aqui.
11. Depois de `'missingReference'`, se `findExistence` mostrar criadora e usuário existentes (registro recriado entre os dois comandos), o service lança `CreatorNotFoundError`, a opção mais conservadora (a criadora é verificada primeiro). A mesma resposta vale quando `countFollowers` devolve `null` após o INSERT.
12. FR-012 "durante a operação": a remoção entre o INSERT e a contagem não é reproduzível de forma determinística por HTTP; é coberta por teste unitário com repository falso, e a remoção anterior à operação, por integração.
13. O `ValidationPipe` global usa `transform: false`: com `transform: true` ele converte o parâmetro de rota (`"1e3"` vira 1000) antes do `PositiveIntPipe`, que então aceitaria ids fora do contrato. O corpo continua validado, só não vira instância do DTO.
14. O hash dos testes cobre também `jest.unit.config.ts`, `jest.int.config.ts` e `playwright.config.ts`, e a validação compara a lista de arquivos, para que arquivo novo em `tests/` ou `e2e/` ou mudança nos configs seja detectada.
15. A revisão [REV] de cada fase lê os arquivos da fase (`git status --porcelain --untracked-files=all`), porque não há commit entre as fases, e não roda o E2E para não sobrescrever os screenshots de evidência.

## Prompt 5 (implement)

1. A CLI mais recente do Nest (`@nestjs/cli` 12) gera projeto ESM com Vitest, oxlint e TypeScript 6, incompatível com o plan (Jest, ts-jest, ESLint, `eslint.config.mjs`, `jest.*.config.ts`). Foi usada a CLI 11 (`npm exec --package=@nestjs/cli@11 -- nest new`), que gera Nest 11, Jest 30, ts-jest, ESLint 9 flat config e saída CommonJS, como o plan descreve.
2. `@nestjs/serve-static@12` exige Nest 12; foi instalada a linha `^5`, compatível com Nest 11.
3. O `tsconfig.json` gerado pela CLI foi limpo: `"strict": true` no lugar de `strictNullChecks`/`noImplicitAny: false`/`strictBindCallApply: false`, sem `baseUrl` e sem `types`, com `include` de `src`, `tests`, `e2e` e os três configs `.ts`. `strictPropertyInitialization` ficou `false` para os DTOs de entrada sem inicializador.
4. ESLint: além de `no-explicit-any: error`, `@typescript-eslint/no-unused-vars` com `argsIgnorePattern: '^_'`, para que os parâmetros do esqueleto (que apenas lançam `NotImplementedException`) não quebrem o lint. Na Fase 2 os parâmetros passam a ser usados e perdem o prefixo `_`.
5. `PositiveIntPipe` do esqueleto devolve `Number(value)` (sem validar), para o tipo `number` já valer nos controllers; a validação entra na Fase 2.
6. Retornos do esqueleto: `FollowersService.getCount` devolve `Promise<number>` e `getStatus` devolve `Promise<boolean>`; os controllers montam os DTOs de resposta. `FollowersRepository.insertFollow` devolve o tipo exportado `InsertFollowResult`.
7. Os erros de domínio têm mensagem interna em inglês (`Creator not found`, `User not found`); a mensagem ao usuário em português é do filtro (Fase 2).
8. `import type { Response } from 'express'` é obrigatório nos arquivos com decorador por causa de `isolatedModules` + `emitDecoratorMetadata`.
9. `jest.int.config.ts` e `playwright.config.ts` referenciam `tests/helpers/*` e `e2e/global-setup.ts`, que ainda não existem (escritos pelo qa-guardian nas Fases 2 e 3); `playwright.config.ts` aborta ao ser carregado sem `DATABASE_URL_TEST`.
10. `scripts/db.mjs`: sem argumento ou comando desconhecido imprime o uso e sai com 1.
11. `ServeStaticModule` com `renderPath: '/'` não capturou rotas desconhecidas: `GET /nope` caiu no filtro (500 no esqueleto, que vira 404 `NOT_FOUND` na Fase 2). Nenhuma opção alternativa foi necessária.
12. O compose usa `${VAR:?}` também em `DATABASE_URL` do serviço `api`; o `.env` local (cópia do `.env.example`, ignorado pelo git) mantém `change_me`.
13. `*.tsbuildinfo` entrou no `.gitignore` (artefato do build incremental do `nest build`).
14. Fase 2 (T032 a T039): a regra extra de `no-unused-vars` com `argsIgnorePattern: '^_'` foi removida de `eslint.config.mjs`, porque os parâmetros do esqueleto agora são usados e perderam o `_`.
15. `HttpExceptionFilter` trata JSON malformado do body-parser como objeto não `HttpException` com `status === 400` (`VALIDATION_ERROR`). Exceções HTTP do Nest com status diferente de 400 e 404 caem em 500 `INTERNAL_ERROR`, como a tabela do plan ("qualquer outro erro"). O 500 é logado com `Logger` como `Unhandled error: <mensagem>`, sem stack.
16. `FollowersRepository.insertFollow` usa `rowCount === 1` do `RETURNING 1` para distinguir `'created'` de `'existing'`; o erro 23503 é identificado por `error.code`.
17. `ValidationPipe` é registrado com `useValue` em `APP_PIPE` no `AppModule`, com as três opções do plan.
18. Revisão da Fase 2 (M7): controllers e DTOs de resposta já nasceram completos no esqueleto da Fase 1 (status 201/200 e 204 incluídos), apesar de T017 pedir só esqueleto e T036 atribuir isso à Fase 2. O red continua válido, porque services e repositories lançavam `NotImplementedException` e o filtro respondia sempre 500; 106 de 107 testes falharam por asserção.
19. Revisão da Fase 2 (I1): o filtro deve tratar como `VALIDATION_ERROR` 400 todo erro que não seja `HttpException` e tenha `status` entre 400 e 499 (corpo acima do limite, charset ou encoding não suportado). O teste que falha é escrito pelo qa-guardian no início da Fase 3 e o developer corrige o filtro na implementação da Fase 3; o hash é regerado em T050.
20. Fase 3 (QA, FR-014): o corpo acima do limite é um JSON válido `{"userId": 1}` com 200 KB de espaços, para que o 400 dependa só do limite do body-parser e não de campo extra. Charset `latin1` e `Content-Encoding: foo` também exigem 400 `VALIDATION_ERROR` e nada gravado.
21. Fase 3 (QA): o reset do E2E usa `tests/helpers/database.ts` por fixtures automáticas em `e2e/fixtures.ts`, com `import()` dinâmico. O import estático rodava `tests/helpers/env.ts` no processo principal do Playwright durante a coleta dos testes, trocava `DATABASE_URL` pelo banco de teste e os workers herdavam esse ambiente, fazendo o `playwright.config.ts` abortar (`DATABASE_URL_TEST` igual a `DATABASE_URL`).
22. Fase 3 (QA, FR-028): a ordem de Tab segue a tabela de `contracts/page.md`: o seletor "Você é" é o primeiro elemento focável e o botão o segundo. A troca de usuário pelo teclado usa seta para baixo no seletor fechado (no Chromium do Linux isso troca a opção e dispara `change`).
23. Fase 3 (QA, FR-021): além de nenhum botão, o E2E afirma que não há seletor, como diz `contracts/page.md` ("sem seletor, contagem nem botão").
24. Fase 3 (QA, FR-025): depois da ação, o E2E exige que o botão não tenha `aria-busy="true"`. Remover o atributo ou deixá-lo `"false"` são aceitos.
25. Fase 3 (QA, FR-026): depois de uma falha, a ação seguinte bem-sucedida não mostra mais a mensagem, como diz o plan ("Ao clicar: limpa a área de erro").
26. Fase 3 (DEV, build): `incremental: true` foi removido de `tsconfig.json`. Com `deleteOutDir: true` no `nest-cli.json`, o segundo `nest build` apagava `dist/` e o `tsbuildinfo` dizia que nada mudou, então nada era emitido. `npm run build` repetido três vezes seguidas sempre gera `dist/main.js`. A entrada `*.tsbuildinfo` do `.gitignore` ficou, sem efeito.
27. Fase 3 (DEV, I1): `HttpExceptionFilter.isMalformedBody` passou a aceitar qualquer erro que não seja `HttpException` com `status` numérico entre 400 e 499 (413, 415 etc.), respondendo 400 `VALIDATION_ERROR` "Requisição inválida.".
28. Fase 3 (DEV): ao terminar o carregamento (sucesso ou falha) o elemento "Carregando…" é removido do DOM com `remove()`, e não só escondido, porque o E2E de FR-021 conta ocorrências do texto com `toHaveCount(0)`, que também conta elementos com `hidden`.
29. Fase 3 (DEV): no carregamento inicial qualquer resposta de `/users`, `/creators/:id` ou `/count` fora de 2xx (exceto 400 e 404 da criadora) e lista de usuários vazia mostram a mensagem genérica de falha; `creatorId` fora de `/^[1-9]\d*$/` mostra "Criadora não encontrada." sem chamar a API.
30. Fase 3 (DEV): durante a troca de usuário o botão fica desabilitado até a releitura do estado terminar, e a resposta de um usuário que não é mais o selecionado é descartada. O duplo clique é barrado por botão desabilitado e pela trava `busy`.
31. Fase 3 (DEV): `public/` foi formatado com `prettier --write` usando o `.prettierrc` do projeto.
32. Revisão da Fase 3 (I1 e I2): condições aprovadas pelo reviewer antes da Fase 4. O qa-guardian escreve E2E que falham (troca de usuário durante a ação; foco no botão depois da ação; também `?creatorId=2147483648` e a trava `busy`), o developer corrige `public/app.js` e o hash é regerado; as mutações (e) e (f) são rodadas de novo.
33. Revisão da Fase 3 (M1 a M6): o developer trata os menores baratos (pool com ouvinte de `error`, stack no log do 500, `strictPropertyInitialization` padrão com `userId!`, lint com `--max-warnings 0`, dependências sem uso removidas, `USER node` no Dockerfile, mensagem de erro limpa na troca de usuário). Duplicação do global-setup em `e2e/` e lint de `public/app.js` ficam como aceitos e registrados.
34. Prompt 5 (DEV, I1 e I2 da revisão da Fase 3): durante a ação o seletor fica `disabled` e o botão recebe `aria-disabled="true"` e `aria-busy="true"` no lugar de `disabled`, de modo que o foco continua no botão; a trava `busy` barra o segundo clique (um único POST). O novo valor de `following` é o `!following` capturado antes da ação e só é renderizado se o usuário ainda for o selecionado. `public/styles.css` estiliza `.follow[aria-disabled='true']` como `:disabled`. A troca de usuário continua usando `disabled` no botão, pois o foco está no seletor.
35. Prompt 5 (DEV, M1 da página): a área de erro é limpa no início de cada troca de usuário e após a releitura bem-sucedida.
36. Prompt 5 (DEV, menores da API): pool do pg com ouvinte de `error` (Logger `DatabasePool`, inglês, com stack no log); log do 500 no filtro passa o stack ao Logger e nunca à resposta; `strictPropertyInitialization: false` removido e `userId!: number` no DTO; `lint` com `--max-warnings 0`; devDependencies `@eslint/eslintrc`, `source-map-support`, `ts-loader` e `tsconfig-paths` removidas (nenhuma referência em configs; lint, build duplo e testes verdes) e `package-lock.json` regenerado; `Dockerfile` com `USER node` no estágio final (compose sobe, API responde 200 em localhost:3000 como uid 1000; `docker compose stop api` feito).
37. Prompt 5 (aceitos): lint de `public/app.js` (M5 de web) e duplicação de `e2e/global-setup.ts` (M4) ficam registrados como aceitos, sem mudança.
38. Prompt 5 (DEV, T059): os ADRs 0001 a 0005 foram ajustados só com o que está no código e nos testes: `ValidationPipe` com `transform: false` (o corpo não sofre conversão de tipo, então `"1"` falha em `@IsInt()`; o motivo é derivado do comportamento testado, não de comentário no código), erros 4xx do body-parser como `VALIDATION_ERROR`, `USER node`, proteção do rebuild, releitura da contagem antes de atualizar a página e seletor desabilitado com `aria-disabled` no botão. Status Aceito e data 2026-10-22 mantidos.
39. Prompt 5 (DEV, T060): o README não documenta `npm start`, porque exige `npm run build` e `.env` e não é o caminho recomendado; os comandos citados existem em `package.json` ou no compose. Os exemplos de curl foram executados contra a API do compose e batem (201, 200, 204, 404 `CREATOR_NOT_FOUND`); os dados criados foram removidos com DELETE e a `api` foi parada com `docker compose stop api`.
