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
