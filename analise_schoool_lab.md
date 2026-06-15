# Análise do Projecto `schoool-lab`

## Visão Geral

**Sistema:** EAC — Escola para Anciãos e Servos Ministeriais  
**Stack:** Next.js 15 · React 19 · TypeScript · better-sqlite3 (SQLite) · Zustand · TanStack Query  
**Arquitectura:** Fullstack monolítico com App Router, sem ORM (SQL directo).

---

## Mapa da Arquitectura

```
src/
├── app/
│   ├── (auth)/              → Login (rota pública)
│   ├── (app)/               → App autenticada (layout com guard)
│   │   ├── dashboard/
│   │   ├── turmas/
│   │   ├── estudantes/
│   │   ├── designacoes/
│   │   ├── relatorios/
│   │   └── configuracoes/
│   ├── api/
│   │   ├── auth/            → Login / logout
│   │   ├── turmas/          → CRUD de turmas
│   │   ├── estudantes/      → CRUD de estudantes
│   │   └── upload/          → Upload de ficheiros
│   └── page.tsx             → Redirect → /dashboard
├── lib/
│   ├── auth.ts              → hashPassword · verifyPassword · getSession
│   ├── db/
│   │   ├── index.ts         → Singleton SQLite + runMigrations
│   │   └── audit.ts         → criarAuditLog · gerarId (uuid)
│   ├── repositories/
│   │   ├── estudantes.ts
│   │   ├── turmas.ts
│   │   └── designacoes.ts
│   └── types.ts             → Tipos centrais do domínio
└── migrations/
    ├── 001_schema_inicial.sql
    └── 002_seed_programa.sql
```

---

## Análise por Módulo

### 🔐 `lib/auth.ts` — Autenticação

| Aspecto | Estado | Nota |
|---|---|---|
| Hash de senha | ✅ Robusto | `scrypt` com salt aleatório de 16 bytes, chave de 64 bytes |
| Verificação | ✅ Segura | Implementação correcta com split `salt:hash` |
| Sessão | ⚠️ Frágil | `getSession` usa o **ID do utilizador** directamente como `sessionId` no cookie — não usa token/sessão real |
| Guard de rota | ✅ OK | `layout.tsx` redirige para `/login` se não houver sessão |

> **Risco crítico:** O cookie `eac_session` armazena o `id` do utilizador directamente. Se alguém conseguir qualquer UUID de utilizador, pode impersonate-lo. Devia ser um token de sessão aleatório mapeado para o user, não o próprio `id`.

---

### 🗄️ `lib/db/index.ts` — Base de Dados

| Aspecto | Estado | Nota |
|---|---|---|
| Singleton | ✅ Correcto | `_db` global, reutilizado entre requisições |
| WAL mode | ✅ Performance | Journal WAL + foreign keys ON + cache 64MB |
| Migrações | ✅ Automáticas | Lê ficheiros `.sql` por ordem, controla via tabela `_migrations` |
| Thread-safety | ✅ SQLite WAL | WAL permite leituras concorrentes com writer único |

---

### 🏫 `repositories/turmas.ts`

| Função | Estado | Nota |
|---|---|---|
| `listarTurmas` | ✅ | Paginação + filtro por status, subqueries para contagens |
| `criarTurma` | ✅ | Transacção + audit log |
| `actualizarTurma` | ⚠️ | Construção dinâmica de `SET` com `Object.keys` — risco de **SQL injection** se algum campo vier directamente da UI sem validação |
| `estatisticasTurmas` | ✅ | Agregações eficientes com `CASE WHEN` |
| Soft delete | ❌ Ausente | Não há função para arquivar/cancelar turma via repositório |

---

### 👤 `repositories/estudantes.ts`

| Função | Estado | Nota |
|---|---|---|
| `listarEstudantes` | ✅ | Paginação + joins com congregação e circuito |
| `criarEstudante` | ✅ | Transacção + audit |
| `actualizarEstudante` | ⚠️ | Mesmo risco de `Object.keys` dinâmico sem whitelist de campos |
| `adicionarEstudanteATurma` | ✅ | Gestão de `turma_estudantes` com dados complementares |
| `registarAvaliacaoViajante` | ✅ | Atualiza nivel_oratoria + flag + data |
| `estatisticasEstudantes` | ✅ | Médias calculadas na BD |
| `historicoEstudante` | ✅ | Histórico completo de turmas |

---

### 📋 `repositories/designacoes.ts` — Motor de Designações

O módulo mais complexo. Implementa um **algoritmo de atribuição automática** que:

1. Filtra partes do programa por nível compatível com o estudante
2. Respeita a regra de **máx. 1 designação por dia por estudante**
3. Usa estratégia **greedy (least-loaded)**: escolhe o estudante com menos designações no dia

**Mapa de compatibilidade:**
```
A+/A/A- → pode receber qualquer nível
B+/B    → A/B, B/C, A/B/C, B, C
B-      → B/C, A/B/C, B, C
C+/C    → B/C, A/B/C, C
C-      → apenas C
```

| Aspecto | Estado | Nota |
|---|---|---|
| Algoritmo | ✅ Funcional | Greedy, distribui carga de forma equilibrada |
| Transaccionalidade | ✅ | Toda a geração numa única transacção |
| Reset | ✅ | Limpa designações `pendente` antes de regerar |
| Restrição por dia | ✅ | `desigPorEstudanteDia` previne duplicados |
| Limite por dia | ⚠️ | Apenas 1 designação/dia — válido para EAC, mas não configurável |
| Unicidade | ❌ | Não verifica se um estudante já tem a **mesma parte** noutra turma |

---

### 🛣️ API Routes

| Rota | Métodos | Problema |
|---|---|---|
| `GET/POST /api/turmas` | GET+POST | `garantirMigracoes()` — padrão `migrado` booleano é per-process; funciona em dev, pode falhar em serverless |
| `GET/POST /api/estudantes` | GET+POST | Não chama `garantirMigracoes()` — potencial crash se DB não estiver inicializada |
| Autenticação nas APIs | ❌ | **Nenhuma rota API verifica a sessão!** Qualquer utilizador não autenticado pode fazer GET/POST |

---

### 🗃️ Schema SQL (`001_schema_inicial.sql`)

| Aspecto | Estado |
|---|---|
| Tipos TEXT para IDs | ✅ (UUIDs) |
| Constraints CHECK | ✅ Em todos os enums |
| Foreign keys | ✅ Declaradas e activadas via PRAGMA |
| Índices | ✅ Bem cobertos (FK, pesquisa por nome, etc.) |
| Soft delete | ✅ `activo INTEGER` em utilizadores e estudantes |
| Audit logs | ✅ Insert-only com JSON diff |
| UNIQUE em turma_estudantes | ✅ `(turma_id, estudante_id)` |

---

## Problemas Identificados (por prioridade)

### 🔴 Crítico

1. **Sessão insegura** (`auth.ts:23`) — O cookie armazena o UUID do utilizador, não um token de sessão. Deve ser criada uma tabela `sessoes` com token aleatório.

2. **APIs sem autenticação** — `GET/POST /api/turmas` e `/api/estudantes` são públicas. Qualquer pessoa que conheça a URL pode ler ou inserir dados.

### 🟠 Alto

3. **SQL injection via `Object.keys`** — Em `actualizarTurma` e `actualizarEstudante`, os nomes dos campos vêm do input da API sem whitelist. Um atacante pode injectar nomes de colunas maliciosas.
   ```ts
   // Risco: input = { "id = 'x'; DROP TABLE turmas; --": "value" }
   const set = campos.map((c) => `${c} = ?`).join(", ");
   ```

4. **`/api/estudantes` não chama `garantirMigracoes()`** — Se a BD não estiver inicializada, todas as chamadas falham silenciosamente com 500.

### 🟡 Médio

5. **`getSession` busca na BD a cada request** — Sem cache. Em carga alta, pode ser um bottleneck. Considerar cache em memória de curta duração.

6. **Algoritmo de designações não é configurável** — A regra "1 por dia" está hard-coded. Deveria ser parâmetro da turma.

7. **`garantirMigracoes` com variável de módulo** — Em ambiente serverless (Vercel edge), a variável `migrado` reinicia a cada cold start, correndo as migrações mais do que uma vez (inofensivo mas ineficiente).

### 🟢 Baixo

8. **`parse_docx.py` na pasta `lib/`** — Script Python em plena pasta TypeScript. Deveria estar em `/scripts/` ou `/tools/`.

9. **Falta de validação de input nas APIs** — Sem Zod ou schema validation nos `POST`. Campos obrigatórios não são verificados antes de chegar ao repositório.

10. **Sem DELETE nas APIs** — Não há endpoints para soft-delete de turmas ou estudantes.

---

## Resumo Executivo

O projecto tem uma **base sólida**: schema SQL bem modelado, audit log implementado, algoritmo de designações funcional, e hashing de passwords robusto. A arquitectura de repositórios é limpa e bem separada.

Os problemas principais estão na **camada de segurança**: as APIs não estão protegidas por autenticação, e o mecanismo de sessão é conceptualmente inseguro. Resolver estes dois pontos deve ser a prioridade imediata antes de qualquer deployment.
