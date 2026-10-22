# Auditoria spec ↔ plan ↔ tasks

**Data**: 2026-10-22

**Nota**: o subagente `reviewer` não foi carregado pela sessão. A auditoria foi feita por um agente genérico que recebeu literalmente as instruções de `.claude/agents/reviewer.md` e só usou ferramentas de leitura. Nenhum arquivo do projeto foi alterado pela auditoria. Ainda não existem `src/`, `tests/`, `e2e/` nem `evidence/tests.sha256`; os itens que dependem de código foram avaliados pelo que o plan e as tasks prescrevem.

**Escopo**: AGENTS.md, constituição, spec, plan, tasks, research, data-model, quickstart, contratos, checklist, suposições, ADRs 0001 a 0005, PROMPTS.md e `.claude/agents/*.md`; contrato conferido contra o DESAFIO.pdf.

## Bloqueante

Nenhum.

## Importante: corrigidos antes da implementação

A auditoria apontou 9 itens importantes. Todos foram corrigidos nos textos dos prompts e nos artefatos antes da implementação; a correção não foi reauditada.

1. Proteção do banco de teste dentro do `rebuild` do `scripts/db.mjs` e na ordem do `env.ts`.
2. `ValidationPipe` global sem transformação, para o `PositiveIntPipe` receber o texto bruto; testes de `1e3`, `0x10` e `01`.
3. Hash dos testes cobrindo os configs do Jest e do Playwright e comparando a lista de arquivos.
4. Ordem lint, red e hash nas duas fases.
5. Revisão [REV] por arquivos da fase, sem rodar o E2E.
6. Scaffold do Nest gerado em diretório temporário, preservando o `.gitignore`.
7. Exceção do teste do pool registrada no Complexity Tracking.
8. Página só muda botão e contagem depois da releitura da contagem; teste de 500 no GET da contagem.
9. Teste do ramo `missingReference` com criadora e usuário existentes.

## Menor

1. **Esqueleto neutro só nas tasks.** O plan manda registrar o `APP_PIPE` no AppModule, mas só as tasks dizem que o pipe entra na Fase 2. O developer lê spec e plan; se implementar o filtro do plan na Fase 1, os testes de FR-013 e FR-014 passam no red.
2. **Lint no esqueleto.** O ESLint da CLI mantém `no-unused-vars` como erro; métodos que só lançam `NotImplementedException` com parâmetros não usados quebram o lint de T020.
3. **Ordem da Fase 1.** T015 (AppModule) depende de T016 a T018, mas vem antes e eles estão marcados [P].
4. **FR-030 passa no red.** Com o `index.html` mínimo não há rolagem horizontal; falta afirmar a visibilidade dos elementos.
5. **FR-025 frágil.** Contar requisições sem reter a resposta pode contar um DELETE; nada afirma o botão desabilitado durante a ação. Reter o POST com `page.route` e afirmar `toBeDisabled`.
6. **Mutação (c) pode sobreviver.** Se a contagem for convertida com `Number()` no repository ou no DTO, remover o `::int` não quebra teste algum.
7. **5xx previsível fora da spec.** Erros 413 e 415 do body-parser caem em 500 pela tabela de erros.
8. **Rota inexistente.** O teste de 404 `NOT_FOUND` não cita FR, e o 404 genérico não está na spec.
9. **Comportamentos sem spec e sem teste.** Falha no carregamento inicial, esconder seletor e contagem quando a criadora não existe, limpar a área de erro ao clicar, `?creatorId=` vazio e `?creatorId=0`.
10. **`creatorId` da URL sem validação no cliente.** `?creatorId=..%2Fusers` vira `GET /users`; sem XSS (só `textContent`), mas a tela fica indefinida.
11. **Acessibilidade do botão.** Rótulo que muda com `aria-pressed` é desaconselhado pelo WAI-ARIA APG; imposto por FR-019 e FR-029.
12. **Donos por diretório.** As mutações do qa-guardian tocam `src/`, `db/` e `public/`, exceção prevista só no agente; a constituição não lista README e `docs/adr/` entre os diretórios do developer.
13. **Fase 4 sem revisão.** Não há [REV] nem tarefa de verify; "README só com comandos que existem" não tem verificador.
14. **Tabela de cobertura.** Liga FR-012 só a T027, mas o teste da remoção durante a operação é o de T022.
15. **Sufixos de arquivo.** `.request.ts`, `.response.ts` e `.error.ts` não são sufixos de schematic do Nest.
16. **KISS.** `created_at` e o índice `follows_user_id_idx` não servem a nenhum FR nem consulta; ditados pelo autor.
17. **Branch.** spec e plan citam a branch `001-seguir-criadora`, mas o trabalho é em `main`.
18. **Status da spec.** `spec.md` ainda diz `Draft`.

## Itens sem achado

- **FR, tarefa e teste:** FR-001 a FR-030 aparecem em ao menos uma tarefa [QA] de teste; ordem [QA] → [DEV] → hash e mutação → [REV] nas Fases 2 e 3.
- **Contrato:** os três endpoints obrigatórios estão idênticos ao DESAFIO.pdf na spec, no plan, nos contratos e no quickstart; a rota `count` vem antes de `:userId`.
- **Concorrência:** `INSERT ... ON CONFLICT DO NOTHING RETURNING 1` sem leitura prévia, `COUNT(*)::int` em consulta separada, sem contador denormalizado e sem CTE; mutações (a) a (d) previstas.
- **Erros:** `23503` → 404, id acima de 2147483647 → 400, JSON malformado → 400.
- **Camadas, idioma e segredos:** SQL só nos repositories; mensagens em português e códigos em inglês; `.env.example` só com placeholders e compose com `${VAR:?}`.
- **Página:** só `textContent`, contagem sempre vinda do servidor, `label`, `aria-live` e `role="alert"` previstos.

## Veredito

Nenhum achado bloqueante. Os itens importantes foram corrigidos e os menores acima ficam registrados para a revisão das fases.
