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
