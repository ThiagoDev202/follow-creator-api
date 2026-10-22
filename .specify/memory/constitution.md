<!--
Sync Impact Report
- Version change: template (não ratificada) → 1.0.0
- Modified principles: placeholders [PRINCIPLE_1..5] substituídos por nove princípios (I a IX)
- Added sections: Padrões detalhados; Definição de pronto; Governance
- Removed sections: nenhuma
- Templates: nenhum template alterado (escopo restrito à constituição)
- Follow-up TODOs: nenhum
-->

# Seguir criadora Constitution

Os padrões detalhados de código, nomes, agentes e Git estão em [AGENTS.md](../../AGENTS.md).
Esta constituição fixa os princípios; AGENTS.md fixa como aplicá-los.

## Core Principles

### I. A spec é a fonte da verdade

Código e testes DEVEM derivar de `specs/001-seguir-criadora/spec.md`. Comportamento que não está
na spec não existe; divergência entre código e spec é defeito do código.

### II. Test-first inegociável

Nenhuma implementação começa antes de o red estar provado (falha por asserção de comportamento,
não por import, sintaxe ou setup) e salvo em `specs/001-seguir-criadora/evidence/`.

### III. Donos por diretório

Os papéis e os diretórios de cada agente são os de AGENTS.md: qa-guardian é dono de `tests/` e
`e2e/`; developer é dono de `src/`, `public/`, `db/`, `scripts/`, Docker e configuração; reviewer
é somente leitura. A sessão principal só orquestra.

### IV. Teste de comportamento

Testes verificam comportamento observável, nunca detalhes de implementação. Teste que parece
errado é reportado com evidência, nunca ajustado para acomodar a implementação.

### V. Consistência garantida pelo banco

Unicidade e integridade vêm de restrições do banco. É proibido ler para decidir se escreve; cada
escrita é um único comando SQL.

### VI. KISS e escopo fechado

A solução mais simples que cumpre a spec. Nada fora da spec: nenhuma abstração, dependência,
endpoint, tela ou campo que ela não peça.

### VII. Separação controller → service → repository

Controller só traduz HTTP; service concentra a regra de negócio; repository concentra o SQL e é o
único que conhece o driver do banco.

### VIII. Nenhum segredo no repositório

Segredos ficam só em `.env`, fora do git. O repositório leva apenas `.env.example` com
placeholders; nenhuma credencial fixa em código, compose ou histórico.

### IX. Idioma

Código, identificadores, logs e códigos de erro em inglês. Mensagens ao usuário e documentação
(README, ADRs e specs) em português.

## Definição de pronto

- `npm run verify` verde.
- Todo FR com teste.
- Mutações mortas.
- Hash dos testes inalterado após a implementação.
- Evidências salvas.
- README só com comandos que existem.
- Nenhum segredo no histórico.

## Governance

Esta constituição prevalece sobre qualquer outra prática do projeto. Toda revisão do reviewer
verifica a conformidade com ela e com AGENTS.md. Emendas exigem alteração deste arquivo com novo
número de versão (MAJOR para remoção ou redefinição de princípio, MINOR para princípio ou seção
nova, PATCH para redação) e atualização de AGENTS.md quando o padrão detalhado mudar.

**Version**: 1.0.0 | **Ratified**: 2026-10-22 | **Last Amended**: 2026-10-22
