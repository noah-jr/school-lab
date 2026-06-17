# Documentação Técnica Completa: School-Lab

Este documento descreve detalhadamente a arquitetura, a infraestrutura de dados, o modelo de segurança, os fluxos de trabalho principais e o sistema de observabilidade da plataforma **School-Lab** (versão Angola).

---

## 1. Visão Geral do Sistema

O **School-Lab** é uma plataforma de alta fidelidade desenhada especificamente para simplificar a gestão de turmas, oradores, programas de designação e auditoria escolar de forma descentralizada. 

### Princípios Fundamentais:
1. **Privacidade Local Absoluta:** Os dados sensíveis da instituição são guardados exclusivamente no próprio servidor/máquina local através de um banco de dados SQLite encriptado (sem nuvem pública de terceiros).
2. **Avaliação sem Contas:** Avaliadores externos (superintendentes de circuito) conseguem avaliar oradores através de links temporários encriptados de uso único, sem necessidade de registo na plataforma.
3. **Auditoria Estrita:** Todas as ações sensíveis são registadas de forma imutável para conformidade institucional.

---

## 2. Arquitetura Tecnológica

A plataforma utiliza uma stack moderna, unificada e otimizada para execução local eficiente:

* **Frontend:** Next.js 15 (App Router), React 19, Lucide Icons, e CSS Customizado de Alto Desempenho (sem TailwindCSS por padrão, garantindo isolamento estético e controlo de performance).
* **Base de Dados:** SQLite acedido através da biblioteca nativa `better-sqlite3`, configurado com o modo **WAL (Write-Ahead Logging)** para suporte concorrente robusto.
* **Estado e Comunicação:** React Query (TanStack Query v5) para cache de dados do servidor, Axios para requisições assíncronas e Zustand para gestão de estado local da interface (ex: controlo do menu lateral).
* **Geração de Relatórios:** Bibliotecas client-side/server-side `jsPDF` e `jspdf-autotable` para compilação instantânea de folhas de presença e programas mensais.

---

## 3. Modelo de Dados & Migrações

A base de dados é estruturada de forma relacional. O sistema controla a evolução do esquema através de migrações SQL numeradas executadas na inicialização.

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
* `remetente_id` (TEXT, Foreign Key) / `remetente_nome` (TEXT) / `remetente_email` (TEXT).
* `destinatario_id` (TEXT, Foreign Key) - `NULL` para mensagens enviadas ao Admin/Geral.
* `assunto` (TEXT), `conteudo` (TEXT).
* `lida` (INTEGER DEFAULT 0) - `0` para não lida, `1` para lida.
* `ocultada` (INTEGER DEFAULT 0) - Arquivamento/ocultação pelo utilizador sem eliminação da base de dados.

#### C. Tabela `logs`
Auditoria de ações do sistema e tráfego de rede.
* `id` (INTEGER PRIMARY KEY AUTOINCREMENT).
* `utilizador_id` (TEXT) - `NULL` se anónimo (internauta).
* `acao` (TEXT) - Ex: `acesso_portal_estudante`, `acesso_portal_viajante`, `acesso_internauta`, `turma_criada`.
* `detalhes` (TEXT) - JSON com metadados adicionais.
* `criado_em` (TEXT DEFAULT CURRENT_TIMESTAMP).

---

## 4. Segurança & Autenticação

A segurança baseia-se num sistema de sessão estatal baseado em cookies HTTP-Only e encriptação AES.

### Mecanismos de Proteção:
1. **Middleware de Proteção (src/middleware.ts):** 
   Intercepta rotas restritas e garante que utilizadores não autenticados sejam redirecionados para o login. As rotas sob `/api/public/` e páginas informativas (ex: `/sobre`) são explicitamente desmarcadas para acesso anónimo controlado.
2. **Forçar Alteração de Senha:** 
   Se `precisa_mudar_senha` estiver a `1`, qualquer rota interna do utilizador redireciona automaticamente para `/mudar-senha`, bloqueando o painel de controlo até que uma senha forte seja definida.
3. **Limitação de Pedidos (Rate Limiting):**
   Mecanismo em memória que bloqueia temporariamente IPs com excesso de pedidos falhados nas APIs públicas (evitando ataques de força bruta aos tokens de avaliação).

---

## 5. Fluxos de Trabalho Principais (Core Workflows)

### A. Rastreamento e Telemetria (Observabilidade)
O sistema possui 3 fontes principais de monitorização de tráfego, consolidadas no dashboard:
1. **Acessos de Estudantes:** Gravados no momento em que um estudante acede ao seu portal individual via token de acesso.
2. **Acessos de Viajantes:** Registados quando um superintendente de circuito abre a ficha de avaliação temporária da turma.
3. **Acessos de Internautas:** Capturados através do endpoint `/api/public/visitor-log` em páginas sem login (Página Inicial, Login, Sobre o Sistema).

### B. Gestão de Backups & Recuperação
Implementado em `src/app/api/backups/`:
* **Exportação (/export):** Realiza uma cópia limpa do ficheiro `escola.db` em modo seguro e comprime a estrutura.
* **Recuperação (/recover):** Permite o upload de um backup anterior. O sistema interrompe conexões ativas com a DB SQLite (WAL), substitui o ficheiro da base de dados física e executa o script de migrações para alinhar o esquema.

### C. Geração de PDF & Programas
Permite a exportação em PDF de tabelas complexas como a lista de oradores e cronogramas mensais de discursos de forma limpa, respeitando formatação local e margens de impressão standard A4.

---

## 6. Configuração e Variáveis de Ambiente

As configurações são geridas por um ficheiro `.env` na raiz do projeto:

```env
DATABASE_URL="file:./data/escola.db"
JWT_SECRET="chave-secreta-de-producao"
NODE_ENV="production"
```

A base de dados é armazenada fisicamente em `./data/escola.db` dentro do diretório do projeto, garantindo facilidade de migração ou backup manual total em discos externos de segurança.
