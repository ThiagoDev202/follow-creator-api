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
