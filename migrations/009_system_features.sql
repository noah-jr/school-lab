-- Tabela de Logs do Sistema
CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  utilizador_id TEXT,
  acao TEXT NOT NULL,
  detalhe TEXT NOT NULL,
  severidade TEXT NOT NULL CHECK(severidade IN ('info', 'warning', 'error', 'success')),
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id) ON DELETE SET NULL
);

-- Tabela de Mensagens Internas e Feedbacks
CREATE TABLE IF NOT EXISTS mensagens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  remetente_id TEXT, -- NULL se for feedback externo
  remetente_nome TEXT NOT NULL,
  remetente_email TEXT,
  destinatario_id TEXT, -- NULL se for para 'Admin/Geral'
  assunto TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  lida INTEGER DEFAULT 0,
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (remetente_id) REFERENCES utilizadores(id) ON DELETE SET NULL,
  FOREIGN KEY (destinatario_id) REFERENCES utilizadores(id) ON DELETE CASCADE
);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notificacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  utilizador_id TEXT NOT NULL, -- Para quem é a notificação
  tipo TEXT NOT NULL CHECK(tipo IN ('info', 'warning', 'error', 'success')),
  titulo TEXT NOT NULL,
  texto TEXT NOT NULL,
  lida INTEGER DEFAULT 0,
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id) ON DELETE CASCADE
);
