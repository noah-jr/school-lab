# School-Lab

A plataforma definitiva e de alta fidelidade para gestão descentralizada, avaliação de oratória e administração escolar (versão adaptada para Angola).

---

## 🚀 Funcionalidades Principais

* **Painel de Controlo (Dashboard):** Visualização de telemetria em tempo real (acesso de estudantes, superintendentes e internautas).
* **Gestão de Estudantes & Turmas:** Ficha de dados de estudantes, upload de fotografias e anexos, controlo de estados de turmas (Rascunho, Ativa, Concluída).
* **Escala de Oradores Automática:** Algoritmo inteligente que gera escalas com base em prioridade e restrições logísticas congregacionais.
* **Portais de Avaliação Sem Conta:** Links temporários de acesso único para avaliadores externos (superintendentes de circuito).
* **Gestão de Backups Completa:** Criação e restauro de backups em formato SQLite diretamente na interface web.
* **Mensagens Internas:** Área de feedback (`/mensagens`) com suporte para ocultar, editar e eliminar mensagens.
* **Geração de Relatórios PDF:** Cronogramas de turmas, fichas individuais de estudantes e guias de viagem.

---

## 🛠️ Arquitetura e Tecnologias

* **Framework:** Next.js 15 (App Router) & React 19
* **Base de Dados Híbrida:** 
  * **Modo Local:** SQLite com `better-sqlite3` em modo WAL (Write-Ahead Logging).
  * **Modo Cloud:** SQLite distribuído através do **Turso** (comunicação Hrana v2 sobre HTTP).
* **Estilização:** CSS Customizado Premium de Alto Desempenho.
* **Estado:** React Query (servidor), Zustand (interface), Cookies encriptados (autenticação).

---

## ⚙️ Configuração Inicial

### 1. Requisitos
* Node.js (v18+)
* Yarn ou NPM

### 2. Variáveis de Ambiente
Crie um ficheiro `.env` na raiz do projeto:

```env
# Configurações Gerais
DATABASE_URL="file:./data/escola.db"
JWT_SECRET="insira-uma-chave-secreta-forte-aqui"
NODE_ENV="development"

# Configurações do Turso Cloud (Opcional)
TURSO_DATABASE_URL="libsql://o-seu-db.turso.io"
TURSO_AUTH_TOKEN="o-seu-token-do-turso"
```

*Nota: Se as variáveis do Turso forem especificadas, o sistema comutará automaticamente para a base de dados na cloud. Caso contrário, funcionará localmente com o ficheiro `./data/escola.db`.*

### 3. Instalar Dependências
```bash
yarn install
# ou
npm install
```

### 4. Executar Migrações da Base de Dados
Para criar as tabelas e semear os dados de oratória (funciona automaticamente local ou no Turso):
```bash
yarn db:migrate
```

### 5. Iniciar o Servidor de Desenvolvimento
```bash
yarn dev
```
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 📚 Documentações e Manuais (PDFs)

Criei utilitários para compilar as documentações de markdown em PDFs de alta fidelidade:

* **Gerar PDFs das Documentações:**
  ```bash
  yarn docs:pdf
  ```
  Os PDFs serão gerados na pasta `docs/`:
  * `docs/doc_tecnico_completo.pdf` — Documento técnico de engenharia.
  * `docs/manual_do_utilizador.pdf` — Manual do utilizador passo a passo.

---

## 📂 Estrutura de Diretórios

```
├── data/                  # Ficheiros SQLite locais e backups
├── docs/                  # Documentações técnicas e manuais em MD/PDF
├── migrations/            # Ficheiros SQL de migração da base de dados
├── scripts/               # Scripts auxiliares (migração, compilador PDF)
├── src/
│   ├── app/               # Rotas e páginas (Next.js App Router)
│   ├── components/        # Componentes UI reutilizáveis
│   └── lib/               # Lógica de negócio, repositórios e DB
```
