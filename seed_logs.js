const db = require('better-sqlite3')('db.sqlite');

try {
  // Ver se a tabela existe
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='logs'").get();
  
  if (!tableCheck) {
    console.log("Tabela 'logs' não existe. A criar...");
    db.prepare(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        utilizador_id TEXT,
        acao TEXT NOT NULL,
        detalhe TEXT NOT NULL,
        severidade TEXT NOT NULL CHECK(severidade IN ('info', 'warning', 'error', 'success')),
        criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id) ON DELETE SET NULL
      )
    `).run();
  }

  // Verifica quantos logs existem
  const count = db.prepare("SELECT COUNT(*) as c FROM logs").get();
  console.log(`Logs atuais: ${count.c}`);

  if (count.c === 0) {
    console.log("A inserir log de teste...");
    db.prepare(`
      INSERT INTO logs (acao, detalhe, severidade) 
      VALUES ('Sistema Iniciado', 'Verificação de integridade da base de dados concluída com sucesso.', 'info'),
             ('Autenticação', 'Administrador principal efetuou login no sistema.', 'success'),
             ('Backup Exportado', 'Exportação da base de dados SQLite realizada com sucesso.', 'info')
    `).run();
    console.log("Logs inseridos.");
  }
} catch (e) {
  console.error(e);
}
