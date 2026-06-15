# 🏫 Análise Profunda — Sistema de Gestão da Escola para Anciãos de Congregação (EAC)

> **Contexto**: Análise pré-modelagem. Sem código ainda — apenas compreensão do domínio, entidades, fluxos, e decisões de arquitetura.

---

## 1. O Que é Este Sistema?

A **Escola para Anciãos de Congregação (EAC)** é um programa de treinamento religioso organizado por **turmas** (ex: 446ª, 451ª turma). Cada turma é realizada num **local/período** específico e envolve:

- **Estudantes**: Anciãos e Servos Ministeriais de várias congregações
- **Instrutores A e B**: Responsáveis por conduzir sessões temáticas
- **Viajante (Supervisor de Circuito)**: Avaliador externo que classifica os estudantes como oradores
- **Programa (Designações)**: Sequência de partes/exercícios atribuídas a estudantes ao longo de 5 dias (Seg-Sex)

O sistema existe para **orquestrar** todo esse processo: da inscrição dos estudantes, à geração das designações de partes, passando pela avaliação do viajante e o controlo histórico completo.

---

## 2. Documentos Analisados — O Que Revelam

### 📄 `SCE446SE&P.docx` — Lista de Estudantes da 446ª Turma
Revela os campos de uma turma completa:
- **Cabeçalho da turma**: número da turma, local, país, datas, número de estudantes, média de idade, média de anos de batismo
- **Por estudante**: `#`, Nome completo, Idade, Anos de Batismo, Congregação + Circuito, Coordenador do Corpo de Anciãos (CCA), Email (@jwpub.org), Telefones (Home + Cell)

### 📄 `Avaliação do Viajante.docx` — Folha de Avaliação do Supervisor
Revela o workflow de avaliação:
- O viajante (supervisor de circuito) recebe uma lista em branco
- Preenche: **Classificação como orador** (A, B, C, com +/- opcionais) — campo amarelo
- Preenche: **Email @jwpub.org** — campo azul
- Preenche: **Número de telefone** — campo verde
- Esta folha é devolvida ao coordenador para gerar as designações

**Conclusão crítica**: A avaliação do viajante **alimenta** o sistema de designações. O nível de oratória (`A`, `B`, `C`) determina quais partes um estudante pode receber.

### 📄 `DESIGNAÇÕES - QUADRO.docx` — Programa Completo da Escola (5 Dias)
Revela a estrutura do programa:
- **46 designações numeradas** distribuídas ao longo de 5 dias
- Cada designação tem: `Nº`, Hora, Tempo, Descrição da parte, **Nível de Oratória requerido** (A, B, C, A/B, B/C, etc.)
- Workshops com múltiplas demonstrações cada um
- Partes especiais: Relatório, Comentário, Demonstração, Entrevista, Série de Discursos
- Designações com nível `NULO` = não atribuídas a estudantes

### 📄 `Designação de Matérias - 451.docx` — Designações Concretas de uma Turma
Revela o resultado final do processo:
- Por estudante: `#`, Nome, Idade, Avaliação, Congregação, e quais designações recebeu (indicado com `l`) nas colunas 2ª, 3ª, 4ª, 5ª (dias da semana)
- Mostra que cada estudante pode receber **múltiplas designações** em dias diferentes

### 📄 `DESIGNAÇÕES - 451.pdf` — Versão impressa das designações
Formato final para distribuição/impressão — provavelmente lista por estudante ou por dia.

---

## 3. Entidades do Domínio (Conceitual)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DOMÍNIO CONCEPTUAL                             │
├──────────────┬──────────────────────────────────────────────────────────┤
│  TURMA       │  A unidade principal. Ex: "451ª Turma EAC"              │
│              │  • Número da turma                                       │
│              │  • Local (Congregação/Cidade)                            │
│              │  • País                                                  │
│              │  • Datas (início/fim — 5 dias)                          │
│              │  • Instrutor A, Instrutor B                              │
│              │  • Status: Rascunho / Activo / Concluído                │
├──────────────┼──────────────────────────────────────────────────────────┤
│  ESTUDANTE   │  Membro que participa da turma                          │
│              │  • Nome completo                                         │
│              │  • Idade, Anos de batismo                               │
│              │  • Congregação + Circuito                               │
│              │  • Papel: Ancião / Servo Ministerial                    │
│              │  • CCA (Coordenador do Corpo de Anciãos)               │
│              │  • Email (@jwpub.org), Telefones                        │
│              │  • Nível de oratória (A/B/C, avaliado pelo Viajante)   │
├──────────────┼──────────────────────────────────────────────────────────┤
│  PROGRAMA    │  Template de partes para uma escola (reutilizável)      │
│  (Template)  │  • 46 designações com: Nº, hora, tempo, tema,          │
│              │    tipo de parte, nível de oratória requerido            │
│              │  • Associado a um "tipo de escola" (ex: EAC)            │
├──────────────┼──────────────────────────────────────────────────────────┤
│  DESIGNAÇÃO  │  Atribuição de uma parte a um estudante numa turma      │
│              │  • Turma → Estudante → Número da parte → Dia           │
│              │  • Status: Pendente / Confirmada / Realizada            │
├──────────────┼──────────────────────────────────────────────────────────┤
│  VIAJANTE    │  Supervisor de Circuito avaliador                       │
│  (Avaliação) │  • Vinculado a uma turma                                │
│              │  • Preenche classificação, email, telefone              │
│              │  • Pode actualizar dados de múltiplos estudantes        │
├──────────────┼──────────────────────────────────────────────────────────┤
│  CIRCUITO    │  Agrupamento geográfico de congregações                 │
│  & CONGR.    │  • Circuito (ex: "/ 260", "/ 206", "/ 410")           │
│              │  • Congregação (ex: "Aviários 07, Cazenga")            │
└──────────────┴──────────────────────────────────────────────────────────┘
```

---

## 4. Fluxos Operacionais Identificados

### Fluxo 1: Criação de uma Turma
```
Admin cria turma → define local + datas + instrutores
→ importa lista de estudantes (manual/upload)
→ turma fica em status "Rascunho"
```

### Fluxo 2: Avaliação do Viajante
```
Admin gera "Folha de Avaliação do Viajante" (PDF exportado)
→ entrega ao Supervisor de Circuito
→ Supervisor preenche: nível oratória + email + telefone
→ Admin recebe de volta → regista no sistema
→ estudantes agora têm nível de oratória definido
```

### Fluxo 3: Geração de Designações
```
Sistema verifica: todos os estudantes têm nível de oratória?
→ distribui designações com base no nível requerido vs nível do estudante
→ cada estudante recebe designações compatíveis com seu nível
→ considera: dias disponíveis, partes já atribuídas, equilíbrio
→ gera "Mapa de Designações" por estudante
```

### Fluxo 4: Exportação/Impressão
```
Admin gera PDFs:
  • Lista de Estudantes (com estatísticas)
  • Designações por Estudante
  • Designações por Dia
  • Folha de Avaliação do Viajante (em branco)
```

### Fluxo 5: Histórico e Auditoria
```
Nenhum dado é eliminado (requisito explícito)
→ turmas concluídas ficam arquivadas
→ estudantes mantêm histórico de participações
→ audit log de todas as acções do sistema
```

---

## 5. Regras de Negócio Críticas

| # | Regra |
|---|-------|
| R1 | Um estudante só pode receber uma designação cujo nível exigido seja ≤ ao seu nível (A≥B≥C) |
| R2 | Nível `NULO` nunca é atribuído a estudantes |
| R3 | Cada estudante deve ter pelo menos uma designação (idealmente distribuição equilibrada) |
| R4 | Antes de gerar designações, todos os estudantes devem ter nível de oratória definido |
| R5 | Dados nunca são apagados — apenas marcados como inactivos/arquivados |
| R6 | O upload de documentos (listas) é local — os ficheiros ficam no servidor |
| R7 | O histórico de turmas deve ser consultável por circuito, congregação, estudante |
| R8 | Estudantes podem aparecer em múltiplas turmas ao longo do tempo |
| R9 | A folha de avaliação do viajante é o documento de entrada para classificação |
| R10 | O programa da escola (46 partes) é um template reutilizável entre turmas |

---

## 6. Decisões de Arquitectura

### Stack Tecnológica (conforme requisitos do projecto)
```
Frontend:
  • Framework: Next.js (App Router) — /app directory
  • State: Zustand (estado global leve)
  • Fetching: TanStack Query + Axios
  • UI: Minimalismo — sem componentes pesados, CSS próprio

Backend:
  • Next.js API Routes (ou Route Handlers no App Router)
  • SQLite (melhor.db) — sem Prisma, usando better-sqlite3
  • Upload: local (disco do servidor, ex: /uploads)
  • Audit logs: tabela dedicada, sem soft-delete (INSERT only)
```

### Decisão: SQLite sem Prisma
Usar `better-sqlite3` directamente:
- Queries síncronas — mais simples de raciocinar
- Controlo total do SQL
- Sem overhead de ORM
- Migrations via ficheiros `.sql` versionados

### Decisão: Upload Local
- Ficheiros em `/public/uploads` ou `/data/uploads`
- Guardar path relativo na BD
- Nunca deletar ficheiros — renomear para `archived_*` se necessário

### Decisão: Audit Logs
- Tabela `audit_logs` com INSERT-only
- Campos: `id`, `tabela`, `registo_id`, `accao`, `dados_antes`, `dados_depois`, `utilizador`, `criado_em`

---

## 7. Módulos do Sistema

```
schoool-lab/
├── docs-use-cases/          ← documentos de referência (já existem)
│
├── src/
│   ├── app/                 ← Next.js App Router
│   │   ├── (auth)/          ← login/autenticação
│   │   ├── turmas/          ← CRUD turmas
│   │   ├── estudantes/      ← gestão estudantes
│   │   ├── designacoes/     ← geração e visualização
│   │   ├── avaliacoes/      ← avaliação do viajante
│   │   ├── relatorios/      ← exportação PDF/Excel
│   │   └── api/             ← Route Handlers (backend)
│   │
│   ├── lib/
│   │   ├── db/              ← conexão SQLite, migrations
│   │   ├── repositories/    ← acesso a dados (sem ORM)
│   │   └── services/        ← lógica de negócio
│   │
│   ├── store/               ← Zustand stores
│   ├── hooks/               ← TanStack Query hooks
│   └── components/          ← UI reutilizável
│
├── data/
│   ├── escola.db            ← base de dados SQLite
│   └── uploads/             ← ficheiros carregados
│
└── migrations/              ← scripts SQL versionados
```

---

## 8. Modelo Conceptual de Dados (Entidades e Relações)

```
circuitos ──< congregacoes ──< estudantes >──< turma_estudantes >── turmas
                                                        │
                                                        ▼
                                                  designacoes
                                                        │
                                                        ▼
                                              programa_partes (template)

turmas ──< avaliacoes_viajante
estudantes ──< avaliacoes_viajante

[todas as tabelas] ──> audit_logs
uploads ──< turmas (lista importada)
```

### Tabelas Previstas
| Tabela | Propósito |
|--------|-----------|
| `turmas` | Registo de cada escola realizada |
| `estudantes` | Catálogo permanente de membros |
| `congregacoes` | Lista de congregações |
| `circuitos` | Agrupamentos de congregações |
| `turma_estudantes` | M:N entre turmas e estudantes (com nível oratória) |
| `programa_partes` | Template de 46 partes do programa |
| `designacoes` | Atribuição de partes a estudantes por turma |
| `avaliacoes_viajante` | Registo das avaliações por turma |
| `uploads` | Metadados dos ficheiros carregados |
| `audit_logs` | Log imutável de todas as mutações |
| `utilizadores` | Gestores do sistema |

---

## 9. Páginas/Ecrãs Principais (UX Minimalista)

```
/                       → Dashboard (estatísticas gerais, turmas recentes)
/turmas                 → Lista de turmas (busca, filtros, status)
/turmas/nova            → Criar nova turma + upload de lista
/turmas/[id]            → Detalhe da turma (estudantes, designações, exportações)
/turmas/[id]/avaliacoes → Registar avaliação do viajante
/turmas/[id]/designacoes → Gerar/visualizar/ajustar designações
/estudantes             → Catálogo de estudantes (histórico de turmas)
/estudantes/[id]        → Perfil completo do estudante
/relatorios             → Geração de relatórios e PDFs
/configuracoes          → Programas/templates de escola
```

---

## 10. Perguntas em Aberto / O Que Falta Confirmar

> Antes de modelar a BD e começar o código, preciso da tua confirmação em:

| # | Questão | Impacto |
|---|---------|---------|
| Q1 | Haverá **autenticação**? Quem são os utilizadores? (Admin único, múltiplos gestores, papel de viajante?) | Tabela `utilizadores`, sessões |
| Q2 | O **programa das 46 partes** é sempre o mesmo ou varia por turma? Posso fixá-lo como seed? | Tabela `programa_partes` |
| Q3 | A **geração de designações** é automática (algoritmo) ou manual (admin escolhe)? | Lógica de negócio core |
| Q4 | Há **importação via upload** de ficheiro Word/PDF ou tudo é entrada manual? | Módulo de parsing |
| Q5 | Os PDFs exportados precisam de ser iguais aos documentos existentes ou podem ter novo design? | UI do PDF |
| Q6 | Será necessário suporte **multi-turma simultânea** (várias turmas activas ao mesmo tempo)? | Concorrência, filtros |
| Q7 | O campo `Francisco Domingos` na turma 451 não tem email nem designações — é caso especial? | Validação de dados |

---

## 11. Síntese para o Desenvolvedor

Este sistema é um **gestor de eventos de formação religiosa** com workflow bem definido:

```
Criar Turma → Importar Estudantes → Avaliação Viajante → Gerar Designações → Exportar PDFs → Arquivar
```

A complexidade central está na **regra de distribuição de designações** (nível de oratória vs partes disponíveis). O resto é CRUD relativamente directo.

A stack escolhida (Next.js + SQLite + better-sqlite3 + TanStack Query + Zustand) é adequada e suficiente para a escala do projecto. O minimalismo de UI foca a atenção no workflow, não na decoração.

**Próximo passo após a tua validação**: modelar o esquema SQL completo e criar a estrutura inicial do projecto Next.js.
