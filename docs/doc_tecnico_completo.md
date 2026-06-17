# Documentação Técnica Completa: School-Lab

Este documento descreve detalhadamente a arquitetura, a infraestrutura de dados, o modelo de segurança, os fluxos de trabalho principais e o sistema de observabilidade da plataforma **School-Lab** (versão Angola).

---

## 1. Visão Geral do Sistema

O **School-Lab** é uma plataforma de alta fidelidade desenhada especificamente para simplificar a gestão de turmas, oradores, programas de designação e auditoria escolar de forma descentralizada. 

### Princípios Fundamentais:
1. **Privacidade e Descentralização:** Os dados sensíveis da instituição residem por padrão localmente num banco de dados SQLite encriptado.
2. **Suporte Híbrido Serverless:** Suporta execução local de alto desempenho ou deploy sem servidor (Serverless) em plataformas como a Vercel através da integração com o banco de dados cloud distribuído **Turso**.
3. **Avaliação sem Contas:** Avaliadores externos (superintendentes de circuito) avaliam oradores através de links temporários de uso único, sem necessidade de registo na plataforma.
4. **Auditoria Estrita:** Registo imutável de todas as ações de operadores para fins de conformidade institucional.

---

## 2. Arquitetura Tecnológica

A plataforma utiliza uma stack moderna, unificada e otimizada para execução local ou cloud:

* **Frontend:** Next.js 15 (App Router), React 19, Lucide Icons, e CSS Customizado de Alto Desempenho (sem TailwindCSS por padrão, garantindo isolamento estético e controlo de performance).
* **Base de Dados Híbrida:** 
  * **Modo Local:** SQLite acedido através da biblioteca nativa `better-sqlite3`, com suporte a **WAL (Write-Ahead Logging)**.
  * **Modo Cloud (Turso):** Conexão remota síncrona através do protocolo Hrana v2 sobre HTTP (via wrapper `curl` nativo para garantir compatibilidade com código síncrono legado).
* **Estado e Comunicação:** React Query (TanStack Query v5) para cache de dados do servidor, Axios para requisições assíncronas e Zustand para gestão de estado local da interface (ex: controlo do menu lateral).
* **Geração de Relatórios e PDFs:** 
  * Geração dinâmica in-app usando `jsPDF` e `jspdf-autotable`.
  * Conversor e compilador CLI de documentações Markdown para PDF em disco (`yarn docs:pdf`).

---

## 3. Modelo de Dados & Migrações

A base de dados é estruturada de forma relacional. O sistema controla a evolução do esquema através de migrações SQL numeradas executadas na inicialização.

### Arquitetura de Migrações:
* O script `scripts/migrate.js` e a função `runMigrations` executam as migrações em lote por ordem alfabética.
* Suporta migração automática tanto no SQLite local quanto no Turso remoto (com remoção em tempo de execução de instruções incompatíveis como `PRAGMA`).

### Principais Tabelas:

#### A. Tabela `utilizadores`
Controla os operadores administrativos da plataforma.
* `id` (TEXT PRIMARY KEY) - UUID do utilizador.
* `nome` (TEXT), `email` (TEXT UNIQUE), `senha_hash` (TEXT).
* `papel` (TEXT) - `admin`, `secretaria` ou `instrutor` (Controlo de Acesso Baseado em Perfis - RBAC).
* `precisa_mudar_senha` (INTEGER DEFAULT 0) - Flag ativada na criação do utilizador ou em resets administrativos.

#### B. Tabela `mensagens`
Mensagens internas trocadas entre operadores e feedbacks externos.
* `id` (INTEGER PRIMARY KEY AUTOINCREMENT).
* `remetente_id` (TEXT, FK) / `remetente_nome` (TEXT) / `remetente_email` (TEXT).
* `destinatario_id` (TEXT, FK) - `NULL` para mensagens enviadas ao Admin/Geral.
* `assunto` (TEXT), `conteudo` (TEXT).
* `lida` (INTEGER DEFAULT 0), `ocultada` (INTEGER DEFAULT 0).

#### C. Tabela `logs`
Auditoria de ações do sistema e tráfego de rede.
* `id` (INTEGER PRIMARY KEY AUTOINCREMENT).
* `utilizador_id` (TEXT) - `NULL` se anónimo (internauta).
* `acao` (TEXT) - Ex: `acesso_portal_estudante`, `acesso_portal_viajante`, `acesso_internauta`.
* `detalhes` (TEXT) - JSON com metadados adicionais.
* `criado_em` (TEXT DEFAULT CURRENT_TIMESTAMP).

---

## 4. Segurança & Autenticação

A segurança baseia-se num sistema de sessão estatal baseado em cookies HTTP-Only e encriptação AES.

### Mecanismos de Proteção:
1. **Middleware de Proteção (src/middleware.ts):** Intercepta rotas restritas. Rotas sob `/api/public/` e páginas informativas (ex: `/sobre`) são explicitamente desmarcadas para acesso público controlado.
2. **Forçar Alteração de Senha:** Se `precisa_mudar_senha` estiver a `1`, redireciona automaticamente para `/mudar-senha`, bloqueando o painel de controlo.
3. **Limitação de Pedidos (Rate Limiting):** Mecanismo em memória que bloqueia temporariamente IPs com excesso de pedidos falhados nas APIs públicas.

---

## 5. Fluxos de Trabalho Principais (Core Workflows)

### A. Rastreamento e Telemetria (Observabilidade)
O sistema possui 3 fontes de monitorização de tráfego, consolidadas no painel de controlo:
1. **Acessos de Estudantes:** Gravados quando um estudante acede ao seu portal via token.
2. **Acessos de Viajantes:** Registados quando um superintendente abre a ficha de avaliação.
3. **Acessos de Internautas:** Capturados em páginas sem login através de chamadas à API `/api/public/visitor-log`.

### B. Gestão de Backups & Recuperação
* **Exportação (/export):** Realiza uma cópia da base de dados física ativa.
* **Recuperação (/recover):** Permite o upload de um backup. O sistema interrompe conexões com a DB, substitui o ficheiro físico na localização atual (seja `./data/` ou `/tmp/`) e executa as migrações.

### C. Suporte a Serverless Vercel (Workaround SQLite)
Quando a aplicação corre na Vercel e o Turso não está ativo, a base de dados do SQLite é copiada automaticamente em tempo de execução para `/tmp/escola.db` para garantir acesso de escrita num sistema de ficheiros protegido.

---

## 6. Configuração e Variáveis de Ambiente

As configurações são geridas pelo ficheiro `.env` na raiz do projeto:

```env
# Configurações Padrão (SQLite Local)
DATABASE_URL="file:./data/escola.db"
JWT_SECRET="chave-secreta-de-producao"
NODE_ENV="production"

# Configurações do Turso Cloud (Opcional - Ativa o SQLite Remoto)
TURSO_DATABASE_URL="libsql://o-seu-db.turso.io"
TURSO_AUTH_TOKEN="seu-token-de-autenticacao"
```

A base de dados é armazenada fisicamente em `./data/escola.db` no SQLite local, ou na nuvem distribuída do Turso caso as chaves estejam configuradas.
