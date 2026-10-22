# PROMPTS

**Ferramenta usada:** Claude Code (com Spec Kit e subagentes)  
**Autocompletar no editor:** usei. Como foram poucos prompts, usei o autocompletar do editor, geralmente com aprovação manual de cada passo.  
**Planejamento:** antes do projeto, usei o Claude (chat) para planejar a estratégia e redigir os prompts abaixo. Os 5 prompts a seguir são a versão final dos que geraram o projeto (ver "Decisões que tomei" sobre a revisão dos textos).  
**Tempo total:** Total de 2 horas de duração. Sendo 30 minutos de planejamento, 1 hora de implementação e 30 minutos finais de correções.

## Prompt 1

**Ferramenta:** Claude Code

**Texto do prompt:**

```
/speckit-constitution Crie três coisas: o AGENTS.md, os subagentes e a constituição. Tudo está decidido; siga literalmente. Se algo não estiver coberto, não pergunte: escolha a opção mais conservadora, registre em specs/001-seguir-criadora/evidence/suposicoes.md e siga. Não execute git commit.

1) Crie AGENTS.md na raiz com exatamente este conteúdo:

# Seguir criadora

Desafio técnico: API e página em que um usuário segue e deixa de seguir uma criadora e vê quantos seguidores ela tem. O escopo é o do enunciado mais as leituras extras que a página exige, descritas em specs/001-seguir-criadora/spec.md. Nada a mais.

## Stack

- Node.js 24, TypeScript strict, NestJS (Express), pg com SQL puro (sem ORM nem query builder), class-validator.
- PostgreSQL 17 e API no Docker Compose.
- Página estática em public/: HTML, CSS e JavaScript puro, sem framework e sem build.
- Testes: Jest, supertest, @nestjs/testing e Playwright (Chromium).

## Regras inegociáveis

- Zero comentários no código: sem comentário de linha, bloco, JSDoc ou TODO.
- KISS: a solução mais simples que cumpre a spec. Sem abstração, interface, camada, dependência, endpoint, tela ou campo que a spec não peça.
- NestJS tradicional: controller → service → repository. Controller só traduz HTTP (validação, status e DTO de resposta). Service concentra a regra de negócio e lança erros de domínio. Repository concentra o SQL e é o único que conhece o pg. Sem SQL fora do repository e sem regra no controller.
- DTOs nas fronteiras: entrada validada com class-validator; resposta mapeada só com os campos do contrato; nunca retornar linha do banco.
- Classes pequenas, um arquivo por classe, nomes explícitos. Sem any, sem estado global mutável, sem validação duplicada.
- Consistência garantida pelo banco: unicidade por PRIMARY KEY, cada escrita em um único comando SQL, proibido ler para decidir se escreve.
- Segredos só em .env; o repositório leva só .env.example com placeholders; docker-compose sem credencial fixa.

## Idioma e nomes

- Inglês: identificadores, arquivos, classes, propriedades, logs e códigos de erro.
- Português: mensagens ao usuário (campo message dos erros e textos da página), README, ADRs e specs.
- Chaves JSON em inglês, como no contrato do enunciado.
- Arquivos em kebab-case com sufixo do Nest (followers.service.ts); classes em PascalCase; variáveis e propriedades em camelCase; códigos de erro em SCREAMING_SNAKE_CASE; tabelas e colunas em snake_case, mapeadas para camelCase no repository.

## Agentes

- Sessão principal: só orquestra; não escreve código de aplicação nem testes.
- qa-guardian: único autor e validador de tests/ e e2e/.
- developer: único autor de src/, public/, db/, scripts/, Docker, configuração, README.md e docs/adr/.
- reviewer: somente leitura.
- Fluxo por fase: red (qa-guardian) → green (developer) → validação por hash e mutação (qa-guardian) → revisão (reviewer).
- Evidências e relatórios em specs/001-seguir-criadora/evidence/.
- Dúvida não coberta: não perguntar; escolher a opção mais conservadora e registrar em evidence/suposicoes.md.

## Git

- Nenhum agente faz commit ou push; os commits são do autor.
- Fora do git: .env, node_modules, dist, coverage, test-results, playwright-report, .claude/settings.local.json.
- Versionados: código, testes, AGENTS.md, .claude/agents/, .specify/, specs/, docs/adr/, README.md e PROMPTS.md.

## Spec Kit

Fluxo: constitution → specify → plan → tasks → implement, com uma feature: specs/001-seguir-criadora. clarify e analyze não são usados por causa do limite de 5 prompts; a auditoria do reviewer substitui o analyze.

## Decisões

- ADRs em docs/adr/NNNN-titulo.md, em português, com título numerado, status, data, contexto, decisão, alternativas e consequências.
- research.md do Spec Kit apenas lista e linka os ADRs.

## Pronto

npm run verify verde; todo FR com teste; mutações mortas; hash dos testes inalterado após a implementação; evidências salvas; README só com comandos que existem; nenhum segredo no histórico.

2) Crie .claude/agents/qa-guardian.md com exatamente este conteúdo:

---
name: qa-guardian
description: Único autor e validador de testes (unitários, integração e E2E). Use para escrever testes antes da implementação (red) e para validá-los depois (hash e mutações). Nunca implementa funcionalidade.
tools: Read, Write, Edit, Bash, Glob, Grep
model: opus
---
Antes de qualquer ação, leia AGENTS.md, specs/001-seguir-criadora/spec.md e specs/001-seguir-criadora/plan.md.
Você é o QA Guardian. Seu trabalho é provar que o sistema cumpre a spec, nunca fazer teste passar.
1. Você é o único que cria ou edita arquivos em tests/ e e2e/. Nunca edite src/, public/, db/ ou scripts/.
2. Escreva testes a partir da spec e do contrato do plan, sem ler a implementação. Todo teste cita no nome o FR-xxx que cobre.
3. Red: rode a suíte, confirme que falha por asserção de comportamento (não por import, sintaxe ou setup) e salve a saída em specs/001-seguir-criadora/evidence/red-<fase>.txt. Depois gere o hash com: find tests e2e jest.unit.config.ts jest.int.config.ts playwright.config.ts -type f 2>/dev/null | sort | xargs sha256sum > specs/001-seguir-criadora/evidence/tests.sha256
4. Proibido: teste tautológico, mock do objeto sob teste, expect.anything onde cabe valor exato, .skip, .only, sleep ou retry para esconder instabilidade, enfraquecer teste para acomodar a implementação, comentários no código.
5. E2E: locators por papel e label, nunca por CSS; screenshot só como evidência, nunca como asserção.
6. Teste válido falhando é bug: reporte com a evidência; não corrija a implementação nem altere o teste.
7. Validação: rode sha256sum -c specs/001-seguir-criadora/evidence/tests.sha256; divergência significa que o implementador alterou testes, reporte como bloqueante. Confira também que find tests e2e jest.unit.config.ts jest.int.config.ts playwright.config.ts -type f | sort lista exatamente os arquivos do hash: arquivo novo ou removido também é divergência. Para cada mutação pedida: copie o arquivo alvo para /tmp, aplique a mutação, rode a suíte, confirme que ao menos um teste falha, restaure com cp a partir de /tmp e confirme com cmp que o arquivo voltou idêntico. Nunca use git restore, git checkout, git stash ou git worktree, porque o trabalho da fase ainda não foi commitado.
8. Entregue na resposta final: tabela FR → testes, mutações mortas e sobreviventes e lacunas conhecidas. Não faça commit.

3) Crie .claude/agents/developer.md com exatamente este conteúdo:

---
name: developer
description: Implementa a aplicação (src/, public/, db/, scripts/, Docker e configuração) até a suíte passar. Use depois que o qa-guardian provou o red.
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
---
Antes de qualquer ação, leia AGENTS.md, specs/001-seguir-criadora/spec.md e specs/001-seguir-criadora/plan.md.
1. Escreva só em src/, public/, db/, scripts/, Dockerfile, docker-compose.yml, .dockerignore, .env.example, package.json, README.md, docs/adr/ e arquivos de configuração. Nunca edite tests/ nem e2e/.
2. Objetivo: a suíte existente passar, seguindo plan.md literalmente. Se um teste parecer errado, pare e reporte; não altere.
3. Siga AGENTS.md: zero comentários, KISS, controller → service → repository, DTOs nas fronteiras, código em inglês, mensagens ao usuário em português, sem any.
4. SQL e concorrência exatamente como em plan.md. Proibido: ler para decidir se escreve, contador denormalizado, CTE juntando INSERT e COUNT, SQL concatenado e innerHTML com dado do servidor.
5. Rode os testes antes de dizer que terminou. Relate o que mudou e qualquer desvio do plan. Não faça commit.

4) Crie .claude/agents/reviewer.md com exatamente este conteúdo:

---
name: reviewer
description: Revisor independente e somente leitura. Audita a consistência entre spec, plan e tasks e revisa diffs contra AGENTS.md e a constituição.
tools: Read, Grep, Glob, Bash
model: opus
---
Antes de qualquer ação, leia AGENTS.md, .specify/memory/constitution.md e os artefatos de specs/001-seguir-criadora/.
Você é um revisor sênior cético. Nunca edite arquivos; use Bash só para ler (git diff, git status e execução de testes).
Verifique: (1) todo FR tem tarefa e teste, e as tarefas [QA] vêm antes das de implementação; (2) os três endpoints obrigatórios são idênticos ao enunciado; (3) sha256sum -c de evidence/tests.sha256; (4) leitura antes de escrita, contador denormalizado, COUNT sem ::int, CTE juntando INSERT e COUNT; (5) 23503 → 404, id acima de 2147483647 → 400, nenhum 5xx previsível; (6) SQL fora do repository, regra de negócio no controller, DTO expondo campo fora do contrato; (7) comentários no código, any, nomes fora do padrão, mensagens ao usuário fora do português; (8) segredos no diff, no compose e no .env.example; (9) página: innerHTML com dado externo, acessibilidade e contagem vinda do servidor; (10) testes fracos; (11) over-engineering: abstração, dependência ou arquivo sem necessidade.
Saída: achados por severidade (bloqueante, importante, menor) com arquivo:linha e evidência; para item sem achado, diga o que verificou. Nunca elogie sem evidência. Não faça commit.

5) Constituição em .specify/memory/constitution.md, curta, com estes princípios e a indicação de que os padrões detalhados estão em AGENTS.md:
I. A spec é a fonte da verdade; código e testes derivam de specs/001-seguir-criadora/spec.md.
II. Test-first inegociável: red provado e salvo em evidência antes de qualquer implementação.
III. Donos por diretório e papéis conforme AGENTS.md; a sessão principal só orquestra.
IV. Teste de comportamento, nunca de implementação; teste que parece errado é reportado, nunca ajustado.
V. Consistência garantida pelo banco, sem leitura para decidir escrita.
VI. KISS e escopo fechado: nada fora da spec.
VII. Separação controller → service → repository.
VIII. Nenhum segredo no repositório.
IX. Código em inglês; mensagens ao usuário e documentação em português.
Inclua a Definição de pronto de AGENTS.md.
```

**Por que este prompt:** Fixar, antes de qualquer código, as regras do jogo: padrões de código (KISS, zero comentários, controller → service → repository, inglês no código e português para o usuário), papéis dos agentes (um guardião de testes, um desenvolvedor e um revisor somente leitura) e os princípios do Spec Kit. Escrevi o conteúdo do AGENTS.md e dos agentes por extenso para que a IA não interpretasse nada.

**O que a IA entregou:** O AGENTS.md, os três subagentes em `.claude/agents/` (qa-guardian, developer e reviewer) e a constituição v1.0.0 com os 9 princípios e a Definição de pronto, mais o `evidence/suposicoes.md`. O commit também inclui a inicialização do Spec Kit (`specify init`, feita por mim) e o `.gitignore`.

**O que estava errado ou faltando, e o que você fez:** (1) Na versão 1.0.11 do Spec Kit os comandos se chamam `/speckit-constitution` (com hífen); com ponto não resolvem. Corrigi o PROMPTS.md. (2) O `/speckit-constitution` limita o próprio escopo à constituição, mas o prompt pedia também AGENTS.md e subagentes; mantive o pedido e registrei em `suposicoes.md`. (3) O Claude Code não carregou os subagentes novos nesta sessão; passei a rodar cada papel como agente genérico com o texto literal do arquivo do subagente. (4) O texto do prompt foi revisado antes da versão final (README e `docs/adr/` passaram a ser do developer; o hash dos testes passou a cobrir os configs), e os arquivos gerados foram ajustados pela IA a partir do relatório, sem reenviar o prompt; o texto enviado foi a versão original, e o que está acima é a versão revisada.

**Como você conferiu:**

- `diff` entre o AGENTS.md gerado e o texto do prompt
- `/agents` listando qa-guardian, developer e reviewer
- leitura da constituição: 9 princípios e Definição de pronto
- `git status` sem commits automáticos

Resultado: AGENTS.md e os três agentes idênticos ao texto do prompt (`diff` sem diferença); constituição com 9 princípios, Definição de pronto e nenhum marcador do template; nenhum commit automático. O `/agents` não listou os subagentes na sessão (ver acima).

## Prompt 2

**Ferramenta:** Claude Code

**Texto do prompt:**

```
/speckit-specify Leia e siga AGENTS.md. Nome curto da feature: seguir-criadora. Seguir criadora: uma API e uma página em que um usuário segue e deixa de seguir uma criadora e vê quantos seguidores ela tem. Tudo está decidido; siga literalmente. Se algo não estiver coberto, não pergunte: escolha a opção mais conservadora, registre em specs/001-seguir-criadora/evidence/suposicoes.md e siga. Não deixe marcadores de NEEDS CLARIFICATION.

Contexto: usuários e criadoras são pré-cadastrados (usuários Ana, Bruno e Carla; criadoras Luna Prado e Mel Duarte). Não há login: o usuário é informado na requisição e escolhido numa lista na tela.

Contrato obrigatório (definido pelo cliente, não alterar):
- seguir: POST /creators/{creatorId}/followers com corpo { userId };
- deixar de seguir: DELETE /creators/{creatorId}/followers/{userId};
- contagem: GET /creators/{creatorId}/followers/count → { "creatorId": ..., "count": ... }.
Leituras extras, só para a página: nome da criadora, se um usuário segue uma criadora e a lista de usuários.

Requisitos funcionais numerados (FR-001...), cada um com Given/When/Then testável:
- seguir cria a relação e informa que ela foi criada; seguir de novo é inofensivo e informa que já existia (idempotência);
- deixar de seguir é idempotente, inclusive para quem não seguia;
- o mesmo usuário nunca segue a mesma criadora duas vezes, nem com requisições simultâneas, e só uma delas é reportada como criação;
- vários usuários seguindo ao mesmo tempo resultam em contagem exata;
- seguir e deixar de seguir simultâneos do mesmo usuário nunca corrompem o estado nem geram erro interno; o estado final é o de uma das duas ordens;
- a contagem é um número e reflete os seguidores reais naquele momento;
- criadora ou usuário inexistente (inclusive removidos durante a operação) → não encontrado, indicando qual; se ambos não existem, informa a criadora;
- identificador inválido (não inteiro positivo ou acima do limite), corpo sem userId, userId que não seja número, campo extra no corpo ou corpo malformado → requisição inválida;
- mensagens de erro ao usuário em português.

Página:
- mostra o nome da criadora, o número de seguidores e um botão "Seguir" / "Deixar de seguir";
- a criadora exibida é definida pela URL (?creatorId=), padrão 1; criadora inexistente mostra "Criadora não encontrada." e nenhum botão;
- o usuário atual é escolhido num seletor com rótulo "Você é"; o padrão é o primeiro da lista; trocar o usuário atualiza o botão;
- contagem exibida como "1 seguidor" ou "N seguidores" (inclusive "0 seguidores"), sempre vinda do servidor; após uma ação, a contagem exibida inclui ações de outros usuários feitas nesse meio tempo;
- durante uma ação o botão fica desabilitado e um duplo clique gera uma única ação;
- falha de rede ou erro do servidor mostra "Não foi possível concluir a ação. Tente novamente." e mantém contagem e botão como estavam;
- mostra "Carregando…" até os dados iniciais chegarem;
- operável só pelo teclado; estado do botão e mudanças da contagem anunciados a leitores de tela; responsiva em celular e desktop.

Fora de escopo: autenticação (registrar o risco de qualquer um agir em nome de qualquer usuário), cadastro, notificações, lista de seguidores e paginação.
```

**Por que este prompt:** Definir o quê e o porquê, sem tecnologia: o contrato obrigatório do enunciado, os requisitos funcionais testáveis (idempotência, concorrência, erros) e o comportamento exato da página, com os textos que o E2E vai procurar.

**O que a IA entregou:** A `spec.md` da feature, com 3 histórias de usuário, 30 requisitos funcionais (FR-001 a FR-030), cada um com Given/When/Then, casos de borda e critérios de sucesso; o checklist de qualidade (todos os itens aprovados) e 9 suposições registradas.

**O que estava errado ou faltando, e o que você fez:** Nada a corrigir na spec. O prompt não define o que a página mostra quando o carregamento inicial falha; registrei como suposição e não exigi teste.

**Como você conferiu:**

- os três endpoints obrigatórios idênticos ao enunciado na spec.md
- todo FR com Given/When/Then
- `grep -c "NEEDS CLARIFICATION" specs/001-seguir-criadora/spec.md` retornando 0
- leitura do suposicoes.md

Resultado: `grep -c "NEEDS CLARIFICATION"` retorna 0; os 3 endpoints do enunciado estão idênticos na spec; os 30 FRs têm Given/When/Then.

## Prompt 3

**Ferramenta:** Claude Code

**Texto do prompt:**

```
/speckit-plan Leia e siga AGENTS.md. Todas as decisões técnicas estão abaixo; siga-as literalmente. Se algo não estiver coberto, não pergunte: escolha a opção mais conservadora, registre em specs/001-seguir-criadora/evidence/suposicoes.md e siga.

AMBIENTE
- Node 24 (.nvmrc e "engines"), npm, TypeScript com strict: true. Projeto gerado com a CLI oficial do NestJS; package-lock.json versionado; ESLint e Prettier padrão da CLI. Sem Swagger.
- .env.example só com placeholders: PORT=3000, POSTGRES_USER=app, POSTGRES_PASSWORD=change_me, POSTGRES_DB=seguir_criadora, DATABASE_URL=postgres://app:change_me@localhost:5433/seguir_criadora, DATABASE_URL_TEST=postgres://app:change_me@localhost:5433/seguir_criadora_test.
- docker-compose.yml com dois serviços:
  - db: postgres:17, porta 5433:5432, volume nomeado, healthcheck com pg_isready, credenciais do .env, db/init montado em /docker-entrypoint-initdb.d.
  - api: build pelo Dockerfile, porta 3000:3000, depends_on db saudável, PORT=3000 e DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}, comando sh -c "node scripts/db.mjs setup && node dist/main".
- Dockerfile multi-stage com node:24-alpine: estágio de build (npm ci, npm run build) e estágio final só com dependências de produção, dist/, public/, db/ e scripts/. .dockerignore com node_modules, dist, .env, tests, e2e, specs, coverage, test-results e playwright-report.

ESTRUTURA
- src/main.ts e src/app.module.ts
- src/database/database.module.ts: módulo global com o provider PG_POOL (Pool do pg), cujo token é exportado como const PG_POOL = 'PG_POOL', encerrado em onApplicationShutdown
- src/common/errors/creator-not-found.error.ts e user-not-found.error.ts: classes simples, sem dependência do Nest
- src/common/filters/http-exception.filter.ts
- src/common/pipes/positive-int.pipe.ts
- src/followers/: followers.module.ts, followers.controller.ts, followers.service.ts, followers.repository.ts, dto/follow-creator.request.ts, dto/followers-count.response.ts, dto/follow-status.response.ts
- src/creators/: creators.module.ts, creators.controller.ts, creators.service.ts, creators.repository.ts, dto/creator.response.ts
- src/users/: users.module.ts, users.controller.ts, users.repository.ts, dto/user.response.ts (sem service: não há regra de negócio na listagem)
- db/schema.sql, db/seed.sql, db/init/01-test-db.sql (CREATE DATABASE seguir_criadora_test)
- scripts/db.mjs (JS puro com dotenv)
- tests/unit/, tests/integration/, tests/helpers/, e2e/
- public/index.html, public/styles.css, public/app.js
- docs/adr/

BANCO
- schema.sql idempotente (CREATE ... IF NOT EXISTS): users(id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, name text NOT NULL); creators(id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, name text NOT NULL); follows(creator_id integer NOT NULL REFERENCES creators(id) ON DELETE CASCADE, user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (creator_id, user_id)); índice em follows(user_id). Sem índice separado em creator_id, porque a PK já cobre.
- seed.sql idempotente: INSERT com ids explícitos ON CONFLICT (id) DO NOTHING para os usuários 1 Ana, 2 Bruno, 3 Carla e as criadoras 1 Luna Prado, 2 Mel Duarte; depois setval(pg_get_serial_sequence(...), MAX(id)) em users e creators, para que inserções futuras não colidam com os ids do seed.
- scripts/db.mjs com dois comandos:
  - setup: aplica schema.sql e seed.sql em DATABASE_URL (ou DATABASE_URL_TEST com --test). Idempotente e seguro.
  - rebuild: só aceita --test (recusa sem a flag) e recusa também se DATABASE_URL_TEST estiver ausente, for igual a DATABASE_URL ou tiver nome de banco que não termine em _test, tudo antes de conectar; DROP TABLE IF EXISTS follows, users, creators; aplica schema.sql e seed.sql em DATABASE_URL_TEST.

API
- main.ts: importa dotenv/config, cria a app, sem prefixo global, enableShutdownHooks e escuta em PORT. O ValidationPipe global { whitelist: true, forbidNonWhitelisted: true, transform: false } (sem transformação, para que o PositiveIntPipe receba o texto bruto do parâmetro de rota) e o HttpExceptionFilter são registrados no AppModule com APP_PIPE e APP_FILTER, para que toda app criada a partir do AppModule (inclusive nos testes) já os tenha. @nestjs/serve-static servindo public/ na raiz com renderPath '/' e sem fallback de SPA: rota desconhecida responde 404 NOT_FOUND pelo filtro. A app lê só PORT e DATABASE_URL.
- Pool do pg: max 20, statement_timeout 5000, idleTimeoutMillis 10000.
- PositiveIntPipe nos parâmetros de rota: aceita só /^[1-9]\d*$/ com valor <= 2147483647; caso contrário, 400.
- FollowCreatorRequest: userId com @IsInt() @Min(1) @Max(2147483647). String "1" é inválida.
- Erros sempre como { error: { code, message } }, mapeados pelo filtro:
  - exceções HTTP do Nest com status 400 (validação, JSON malformado, pipe) → 400 VALIDATION_ERROR "Requisição inválida.";
  - CreatorNotFoundError → 404 CREATOR_NOT_FOUND "Criadora não encontrada.";
  - UserNotFoundError → 404 USER_NOT_FOUND "Usuário não encontrado.";
  - exceções HTTP do Nest com status 404 (rota inexistente) → 404 NOT_FOUND "Recurso não encontrado.";
  - qualquer outro erro → 500 INTERNAL_ERROR "Erro interno.", com log em inglês via Logger do Nest e sem stack na resposta.
- Endpoints:
  - POST /creators/:creatorId/followers { userId } → 201 { creatorId, count } se criou; 200 { creatorId, count } se já seguia. O status é definido no controller com @Res({ passthrough: true }).
  - DELETE /creators/:creatorId/followers/:userId → 204 sem corpo, seguindo ou não.
  - GET /creators/:creatorId/followers/count → 200 { creatorId, count }.
  - GET /creators/:creatorId/followers/:userId → 200 { following }.
  - GET /creators/:creatorId → 200 { id, name }.
  - GET /users → 200 [{ id, name }] ordenado por id.
- Se criadora e usuário não existem, a resposta é CREATOR_NOT_FOUND (criadora verificada primeiro).

RESPONSABILIDADES
- FollowersRepository (único com SQL de follows):
  - insertFollow(creatorId, userId): 'created' | 'existing' | 'missingReference'. Executa INSERT INTO follows (creator_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING 1; linha retornada → 'created'; nenhuma → 'existing'; erro 23503 → 'missingReference'; qualquer outro erro é relançado.
  - deleteFollow(creatorId, userId): DELETE FROM follows WHERE creator_id = $1 AND user_id = $2.
  - findExistence(creatorId, userId): SELECT EXISTS(SELECT 1 FROM creators WHERE id = $1) AS creator_exists, EXISTS(SELECT 1 FROM users WHERE id = $2) AS user_exists.
  - countFollowers(creatorId): number | null. SELECT c.id, (SELECT COUNT(*)::int FROM follows f WHERE f.creator_id = c.id) AS count FROM creators c WHERE c.id = $1; nenhuma linha → null.
  - isFollowing(creatorId, userId): SELECT EXISTS(SELECT 1 FROM follows WHERE creator_id = $1 AND user_id = $2) AS following.
- FollowersService (regra de negócio, sem SQL nem HTTP):
  - follow: insertFollow; se 'missingReference', findExistence e lança CreatorNotFoundError ou UserNotFoundError (criadora primeiro); depois countFollowers em consulta separada; se findExistence mostrar criadora e usuário existentes, ou se countFollowers devolver null (criadora removida durante a operação), lança CreatorNotFoundError; retorna { created, count }.
  - unfollow: deleteFollow; depois findExistence e lança o erro correspondente se faltar criadora ou usuário.
  - getCount: countFollowers; null → CreatorNotFoundError.
  - getStatus: findExistence (erro se faltar) e depois isFollowing.
- CreatorsService.getById: null → CreatorNotFoundError. UsersController chama UsersRepository.findAll direto.
- Controllers: só validação, status e mapeamento para os DTOs de resposta.
- Proibido: SELECT para decidir se escreve; capturar erro de unicidade como fluxo; CTE juntando INSERT e COUNT; contador denormalizado; SQL concatenado; transação explícita (cada comando é atômico em READ COMMITTED).

PÁGINA (public/: HTML + CSS + JavaScript puro como ES module, sem framework, sem build, URLs relativas)
- Ao carregar: lê ?creatorId= (padrão 1); busca em paralelo GET /users, GET /creators/:id e GET /creators/:id/followers/count; seleciona o primeiro usuário e busca GET /creators/:id/followers/:userId.
- Elementos: select com label "Você é"; nome da criadora em h1; avatar com as iniciais; contagem "1 seguidor" ou "N seguidores" em elemento com aria-live="polite"; botão "Seguir"/"Deixar de seguir" com aria-pressed; área de erro com role="alert"; "Carregando…" até os dados iniciais chegarem.
- Ao trocar o usuário: rebusca o estado do botão.
- Ao clicar: desabilita o botão e marca aria-busy="true"; envia POST ou DELETE; em sucesso, relê GET .../count e só então define o estado (POST → seguindo, DELETE → não seguindo) e a contagem; em falha de rede, resposta não-2xx ou falha na releitura da contagem, mostra "Não foi possível concluir a ação. Tente novamente." e mantém contagem e estado; no fim, reabilita o botão e remove aria-busy.
- Criadora inexistente: mostra "Criadora não encontrada." e não exibe o botão.
- textContent sempre; nunca innerHTML com dado do servidor.
- CSS: variáveis em :root, fonte do sistema, card centralizado com largura máxima de 420px, foco visível, responsivo, tema escuro via prefers-color-scheme.

TESTES (rodam no host contra o Postgres do compose)
- Jest com dois configs: jest.unit.config.ts (tests/unit) e jest.int.config.ts (tests/integration, --runInBand, globalSetup que roda node scripts/db.mjs rebuild --test).
- tests/helpers/env.ts: carrega .env, aborta se DATABASE_URL_TEST estiver ausente, for igual a DATABASE_URL ou tiver nome de banco que não termine em _test, e só depois define DATABASE_URL = DATABASE_URL_TEST; idempotente se importado mais de uma vez.
- tests/helpers/database.ts: importa ./env primeiro (só atinge o banco de teste); antes de cada teste, TRUNCATE follows, users, creators RESTART IDENTITY CASCADE e aplica db/seed.sql.
- Unitários: FollowersService via Test.createTestingModule com { provide: FollowersRepository, useValue: fake em memória }; cobrir criado, existente, missingReference (qual erro), unfollow com criadora ou usuário inexistente, contagem nula, criadora removida entre o INSERT e a contagem e missingReference com criadora e usuário existentes (CreatorNotFoundError).
- Integração: app criada com Test.createTestingModule({ imports: [AppModule] }).createNestApplication(), sem repetir pipe nem filtro no teste, iniciada com app.listen(0) e usada com supertest. Cobrir todo o contrato e os erros: ids 0, -1, abc, 1.5, 1e3, 0x10, 01 e 2147483648 → 400; corpo sem userId, userId "1", campo extra e JSON malformado → 400; criadora e usuário inexistentes → 404 com o code certo; message em português; typeof count === 'number'. Concorrência com Promise.all: 30 POSTs do mesmo usuário → exatamente um 201, 29 200 e count 1; 30 usuários inseridos no teste seguindo a mesma criadora → count 30; 40 POST/DELETE alternados do mesmo usuário → nenhum 5xx, no máximo 1 linha em follows e GET /creators/:id/followers/:userId coerente com o banco. Um teste afirma que o pool (PG_POOL) tem max > 1; é a única exceção à regra de teste de comportamento, existe para os testes de concorrência não ficarem vazios, cita FR-005 e FR-006, já passa no red e é registrada como exceção no Complexity Tracking do plan.
- E2E: Playwright só Chromium; testDir e2e; workers 1; retries 0; trace retain-on-failure. webServer com o comando "npm run build && node dist/main", PORT=3100 e DATABASE_URL = DATABASE_URL_TEST, reuseExistingServer false, url http://localhost:3100 e timeout 120000; playwright.config.ts importa dotenv/config e aborta se DATABASE_URL_TEST estiver ausente ou igual a DATABASE_URL; globalSetup roda node scripts/db.mjs rebuild --test; antes de cada teste, aplicar o reset de tests/helpers/database.ts (que importa ./env e por isso só atinge o banco de teste). Locators por papel e label, com exact: true onde um nome for parte de outro ("Seguir" e "Deixar de seguir"; "1 seguidor" e "1 seguidores"). Cenários: estado inicial (Ana, Luna Prado, "0 seguidores", botão "Seguir"); seguir e deixar de seguir atualizam botão e contagem; duplo clique gera uma única requisição (contada com page.on('request')); falha de rede via page.route abortando o POST, e resposta 500 (route.fulfill) no POST e no DELETE, mostram a mensagem e mantêm contagem e botão; resposta 500 no GET da contagem depois de um POST bem-sucedido mostra a mesma mensagem e mantém contagem e botão como estavam; dois contextos abertos (Ana e Bruno, ambos vendo "0 seguidores"): Ana segue, depois Bruno segue sem recarregar e passa a ver "2 seguidores"; troca de usuário atualiza o botão; ?creatorId=999 mostra "Criadora não encontrada.". Screenshots (inicial, seguindo, erro) salvos em specs/001-seguir-criadora/evidence/.
- Navegador instalado com: npx playwright install chromium.

SCRIPTS npm
db:up (docker compose up -d --wait db), db:down (docker compose down), db:setup, db:setup:test, build, start (node dist/main), start:dev, lint (eslint sem --fix), test:unit, test:int, test:e2e, verify (lint, build, test:unit, test:int e test:e2e, nessa ordem).

ADRs em docs/adr/, no formato do AGENTS.md, com data de hoje e status Aceito:
- 0001-stack: NestJS tradicional, pg puro, PostgreSQL e API no compose, Jest e Playwright, página estática (alternativas: Fastify, Prisma/TypeORM/Kysely, SQLite, Vitest, Cypress/Selenium, React/Vue).
- 0002-idempotencia-e-concorrencia: PK composta, INSERT ON CONFLICT RETURNING, 201/200 no POST, 204 idempotente no DELETE, last-write-wins no seguir/deixar simultâneo, COUNT(*)::int em consulta separada (alternativas: SELECT + INSERT, contador denormalizado, CTE).
- 0003-contrato-e-erros: endpoints extras só de leitura, formato de erro com message em português, ids inteiros limitados a int4.
- 0004-sem-autenticacao: userId confiado ao cliente, como pede o enunciado, e o risco disso.
- 0005-banco-e-ambientes: schema.sql idempotente sem migrations, seed idempotente com setval, banco de teste separado com rebuild protegido, portas 5433 e 3100.
research.md apenas lista e linka esses ADRs.
```

**Por que este prompt:** Fechar todas as decisões técnicas para a IA não inventar: SQL exato de cada operação, tratamento de concorrência sem ler antes de escrever, formato de erro, estrutura de pastas, Docker, estratégia de testes e os ADRs a escrever.

**O que a IA entregou:** O `plan.md` com todas as decisões técnicas, o `research.md` (só lista os ADRs), `data-model.md`, os contratos HTTP e da página, o `quickstart.md` e os 5 ADRs em `docs/adr/`, mais 12 suposições registradas.

**O que estava errado ou faltando, e o que você fez:** Os ADRs foram escritos já nesta fase, porque o `research.md` precisa linkar arquivos existentes; a tarefa de ADRs da fase 4 virou revisão. O texto do prompt foi revisado antes da versão final (onde o pipe e o filtro globais são registrados, proteção do banco de teste, ramos do service e dos testes) e os arquivos gerados foram ajustados pela IA a partir do relatório, sem reenviar o prompt; o texto enviado foi a versão original, e o que está acima é a versão revisada.

**Como você conferiu:**

- `grep` no plan.md por `RETURNING`, `::int`, `PRIMARY KEY (creator_id, user_id)` e `setval`
- contagem em consulta separada, sem CTE
- docker-compose sem senha fixa no plano
- lista dos 5 ADRs

Resultado: o plan traz `RETURNING 1`, `::int`, `PRIMARY KEY (creator_id, user_id)` e `setval`; a contagem é uma consulta separada, sem CTE; o compose do plano não tem senha fixa; os 5 links do `research.md` existem.

## Prompt 4

**Ferramenta:** Claude Code

**Texto do prompt:**

```
/speckit-tasks Leia e siga AGENTS.md. Tudo está decidido em spec.md, plan.md e na constituição; siga literalmente. Se algo não estiver coberto, não pergunte: escolha a opção mais conservadora, registre em specs/001-seguir-criadora/evidence/suposicoes.md e siga.
TDD obrigatório e multi-agente. Marque o dono de cada tarefa: [QA]=qa-guardian, [DEV]=developer, [REV]=reviewer. Em cada fase, as tarefas [QA] vêm antes das de implementação e incluem, nesta ordem, rodar npm run lint e deixar tests/ e e2e/ sem erros, provar o red (falha pelo motivo certo, não import, sintaxe ou setup), salvar evidence/red-<fase>.txt e gerar evidence/tests.sha256 (que também cobre jest.unit.config.ts, jest.int.config.ts e playwright.config.ts). Todo teste cita o FR-xxx.
Fases:
1) [DEV] setup: scaffold Nest (gerado num diretório temporário e copiado para a raiz, preservando o .gitignore existente e descartando o README.md gerado), Dockerfile, docker-compose, db/init, .env.example, schema.sql, seed.sql, scripts/db.mjs, scripts npm, configs do Jest e do Playwright, esqueleto (módulos, controllers, services, repositories, DTOs, erros, filtro e pipe) compilando e com o compose subindo: services e repositories lançam NotImplementedException; o filtro responde sempre 500 INTERNAL_ERROR; o pipe repassa o valor sem validar; o DTO não tem decoradores de validação; o AppModule já registra o filtro (APP_FILTER), e o APP_PIPE entra na implementação. Assim o red falha por asserção de comportamento, e não por setup. Crie também o .env local copiando o .env.example (ele já está no .gitignore e nunca é versionado).
2) API: [QA] testes unitários e de integração + red → [DEV] implementação até verde sem tocar em tests/ → [QA] hash + mutações: (a) remover a PRIMARY KEY de follows em schema.sql; (b) trocar o INSERT ... ON CONFLICT RETURNING por SELECT seguido de INSERT; (c) remover o ::int do COUNT; (d) remover o tratamento do 23503 → [REV] revisão dos arquivos da fase (git status --porcelain --untracked-files=all, lendo-os, sem rodar o E2E).
3) Página + E2E: [QA] testes Playwright + red → [DEV] página até verde sem tocar em e2e/ → [QA] hash + mutações: (e) atualizar a contagem localmente (+1/-1) em vez de reler do servidor; (f) não desabilitar o botão durante a requisição → screenshots de evidência → [REV] revisão dos arquivos da fase (git status --porcelain --untracked-files=all, lendo-os, sem rodar o E2E).
4) [DEV] ADRs 0001 a 0005 e README em português com: pré-requisitos, criar .env a partir do .env.example, subir tudo com docker compose up -d --build, abrir http://localhost:3000, rodar os testes (npm ci, npx playwright install chromium, npm run db:up, npm run verify e cada nível separado), decisões resumidas com link para os ADRs e limitações. [QA] relatório final FR → teste com o checklist da Definição de pronto em evidence/relatorio-final.md.
Depois de gerar tasks.md, invoque o reviewer para auditar spec ↔ plan ↔ tasks (FR sem tarefa, ordem TDD, contrato divergente do enunciado, violações de AGENTS.md e da constituição) e salve o relatório em specs/001-seguir-criadora/evidence/analyze.md, sem corrigir nada sozinho.
```

**Por que este prompt:** Ordenar o trabalho em TDD, com dono por tarefa e os testes antes da implementação em cada fase, definir as mutações que provam que os testes pegam erro de verdade e pedir uma auditoria independente da consistência entre spec, plan e tasks antes de implementar.

**O que a IA entregou:** O `tasks.md` com 61 tarefas em 4 fases, cada uma com dono ([QA], [DEV] ou [REV]), testes antes da implementação, as 6 mutações e a tabela de cobertura dos 30 FRs; e o `evidence/analyze.md`, com a auditoria do reviewer sobre spec, plan e tasks.

**O que estava errado ou faltando, e o que você fez:** O subagente `reviewer` não estava carregado na sessão; a auditoria foi feita por um agente genérico com o texto literal de `.claude/agents/reviewer.md`. O `analyze.md` lista os achados menores que ficaram. O texto do prompt foi revisado antes da versão final (ordem lint, red e hash; revisão por arquivos da fase) e os arquivos gerados foram ajustados pela IA a partir do relatório, sem reenviar o prompt; o texto enviado foi a versão original, e o que está acima é a versão revisada.

**Como você conferiu:**

- em cada fase, tarefas [QA] antes de [DEV]
- as 6 mutações presentes no tasks.md
- leitura do evidence/analyze.md do reviewer

Resultado: em cada fase as tarefas [QA] vêm antes das [DEV]; as 6 mutações (a) a (f) estão no `tasks.md`; todos os 30 FRs têm tarefa de teste; o `analyze.md` foi lido e os achados menores ficaram registrados.

## Prompt 5

**Ferramenta:** Claude Code

**Texto do prompt:**

```
/speckit-implement Leia e siga AGENTS.md. Execute todas as fases de tasks.md, em ordem. Tudo está decidido; siga literalmente. Se algo não estiver coberto, não pergunte: escolha a opção mais conservadora, registre em specs/001-seguir-criadora/evidence/suposicoes.md e siga. Não execute git commit.
Você é o orquestrador: não implemente nem escreva testes; delegue cada tarefa ao subagente dono e salve em specs/001-seguir-criadora/evidence/ o relatório que cada um devolver (setup.md, red-api.txt, mutacoes-api.md, review-api.md, red-e2e.txt, mutacoes-e2e.md, review-e2e.md, relatorio-final.md). Em cada fase: o qa-guardian prova o red e gera o hash antes de qualquer implementação; o developer não toca em tests/ nem e2e/; o qa-guardian confere o hash e roda as mutações listadas em tasks.md, restaurando cada arquivo a partir de cópia em /tmp; o reviewer revisa o diff.
Se um agente apontar teste errado ou achado bloqueante, não contorne: registre em evidence/bloqueios.md e siga com o que for independente.
Ao final, rode npm run verify, salve a saída em evidence/verify.txt e entregue o relatório FR → teste com o checklist da Definição de pronto, marcando honestamente o que não foi atendido.
```

**Por que este prompt:** Executar o plano com os agentes: red provado e salvo, implementação sem tocar nos testes, validação por hash e mutação, revisão independente, verify completo e relatório final honesto.

**O que a IA entregou:** O projeto completo, por fases com os três papéis: setup (Nest, Docker, banco, esqueleto), a API (6 endpoints, SQL puro, concorrência garantida pelo banco), a página estática, 156 testes (20 unitários, 110 de integração e 26 E2E em Chromium), README, ADRs revisados e os relatórios em `specs/001-seguir-criadora/evidence/` (red, hash, mutações, revisões, `verify.txt` e `relatorio-final.md`).

**O que estava errado ou faltando, e o que você fez:** (1) Os subagentes do projeto não foram carregados pela sessão do Claude Code; cada papel rodou como agente genérico com o texto literal do arquivo em `.claude/agents/`, então a divisão por papel é convenção, e o hash dos testes é a prova de que o developer não os tocou. (2) O qa-guardian achou um bug de build (`incremental` com `deleteOutDir` apagava `dist/` no segundo build); o developer corrigiu. (3) A revisão da API achou que erros 413 e 415 do body-parser viravam 500; o qa-guardian escreveu o teste que falhava e o developer corrigiu o filtro. (4) A revisão da página achou uma corrida ao trocar de usuário durante uma ação e a perda de foco do teclado depois de cada ação; o qa-guardian escreveu os testes que falhavam, o developer corrigiu a página e as mutações foram rodadas de novo. (5) Menores tratados pelo developer: pool com ouvinte de erro, stack no log do 500, lint sem avisos, dependências sem uso removidas e `USER node` no Dockerfile. Nenhuma edição manual de código. Ficaram abertos achados menores, listados nos relatórios de revisão.

**Como você conferiu:**

- `npm run verify` rodado por mim
- leitura de red-*.txt, mutacoes-*.md, review-*.md, bloqueios.md e suposicoes.md
- `docker compose up -d --build` e página aberta em http://localhost:3000
- `curl` nos endpoints: 201 e depois 200 no POST, 204 no DELETE, count numérico, message em português
- remoção manual da PK e `npm run test:int` falhando no teste de concorrência
- `grep -rn "//\|/\*" src public` sem comentários
- `git log -p | grep -iE "password|secret|token"` e `git ls-files | grep "\.env$"` sem resultado
- README seguido num clone limpo

Resultado: `npm run verify` termina com `exit=0` (lint, build, 20 unitários, 110 de integração e 26 E2E), conforme `evidence/verify.txt`. Os 30 FRs têm teste. As 9 mutações (a) a (i) morreram; (a) a (d) rodaram antes das mudanças finais no filtro, no pool e no DTO e não foram repetidas. O hash dos testes bate com os arquivos finais, mas foi regerado duas vezes por motivos documentados. Não conferi: `git log -p | grep` de segredos só no commit final, e o README seguido num clone limpo.

## Decisões que tomei

Detalhes em docs/adr/.

- POST idempotente: 201 quando passa a seguir, 200 quando já seguia, corpo { creatorId, count }.
- DELETE idempotente: 204 mesmo para quem não seguia; 404 se a criadora ou o usuário não existe.
- Concorrência garantida pelo banco: chave primária composta (creator_id, user_id) e INSERT ... ON CONFLICT DO NOTHING RETURNING, sem ler antes de escrever.
- Contagem com COUNT(*)::int em consulta separada, sem contador denormalizado.
- Seguir e deixar de seguir ao mesmo tempo: vale a última operação aplicada no banco.
- Endpoints extras, só de leitura, porque a página precisa deles: nome da criadora, se o usuário segue e lista de usuários.
- Erros como { error: { code, message } }: chaves e code em inglês, message em português.
- IDs inteiros positivos até o limite de int4; fora disso, 400.
- Criadora e usuário inexistentes ao mesmo tempo: responde que a criadora não foi encontrada.
- Sem autenticação: o userId vem do cliente, como o enunciado define.
- NestJS no formato controller → service → repository, com pg e SQL puro, sem ORM.
- PostgreSQL e API no Docker Compose; testes rodam no host contra um banco de teste separado.
- Página em HTML, CSS e JavaScript puro, sem framework.
- Código sem comentários; identificadores em inglês; textos ao usuário e documentação em português.
- Limite de 5 prompts tratado como teto: foram 5 prompts de tarefa, cada um enviado uma vez. Depois da auditoria do Prompt 4, os textos dos prompts 1, 3 e 4 foram revisados e os arquivos gerados foram ajustados pela IA, sem reenviar os prompts; o PROMPTS.md traz a versão revisada. A IA foi instruída a não fazer perguntas e a registrar suposições; aprovações de permissão do Claude Code e mensagens de configuração do repositório (instalação do Node 24 e do Spec Kit) não foram contadas como prompt.
- specs/, .specify/, .claude/agents/ e AGENTS.md versionados, para mostrar o contexto e as restrições passados à IA.

## O que não verifiquei

- Autenticação e autorização (fora do escopo).
- Desempenho e comportamento sob carga real.
- Navegadores além do Chromium e dispositivos móveis reais.
- Que só o qa-guardian escreveu os testes: é convenção, não bloqueio técnico; a evidência é o hash e os relatórios em specs/001-seguir-criadora/evidence/.
- Os papéis (qa-guardian, developer e reviewer) rodaram como agentes genéricos; a revisão final das correções da página e da Fase 4 não foi repetida pelo reviewer.
- Falha não-404 no carregamento inicial da página e foco do teclado depois de uma ação que falha não têm teste E2E.
- Mutações (a) a (d) depois das últimas mudanças em `src/`.
- README seguido num clone limpo, e a API do compose com reinício automático após queda do Postgres.
