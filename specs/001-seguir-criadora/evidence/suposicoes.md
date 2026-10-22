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
