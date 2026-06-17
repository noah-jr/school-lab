const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "escola.db");
const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

// Garante que o directório data existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

console.log("A ligar à base de dados:", DB_PATH);
const db = new Database(DB_PATH);

// Performance pragmas
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("synchronous = NORMAL");

// Tabela de controlo de migrations
db.exec(`
  CREATE TABLE IF NOT EXISTS _migrations (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    ficheiro  TEXT NOT NULL UNIQUE,
    aplicado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const aplicadas = db.prepare("SELECT ficheiro FROM _migrations").all();
const aplicadasSet = new Set(aplicadas.map((r) => r.ficheiro));

const ficheiros = fs
  .readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith(".sql"))
  .sort();

console.log(`Encontradas ${ficheiros.length} migrações. A verificar o estado...`);

let novasAplicadas = 0;

for (const ficheiro of ficheiros) {
  if (aplicadasSet.has(ficheiro)) {
    console.log(`[-] Já aplicada anteriormente: ${ficheiro}`);
    continue;
  }

  console.log(`[+] A aplicar migração: ${ficheiro}...`);
  const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, ficheiro), "utf-8");

  db.pragma("foreign_keys = OFF");
  
  const aplicar = db.transaction(() => {
    db.exec(sql);
    db.prepare("INSERT INTO _migrations (ficheiro) VALUES (?)").run(ficheiro);
  });

  try {
    aplicar();
    console.log(`[SUCESSO] Migração aplicada: ${ficheiro}`);
    novasAplicadas++;
  } catch (err) {
    // Se a coluna/tabela já existe (corrida entre processos ou restart), marcar como aplicada
    if (err.message.includes('duplicate column name') || err.message.includes('already exists')) {
      console.warn(`[AVISO] ${ficheiro}: objecto já existe, a marcar como aplicada no controlo.`);
      try {
        db.prepare("INSERT OR IGNORE INTO _migrations (ficheiro) VALUES (?)").run(ficheiro);
      } catch (e) {}
    } else {
      console.error(`[ERRO] Migração ${ficheiro} falhou:`, err.message);
      db.pragma("foreign_keys = ON");
      db.close();
      process.exit(1);
    }
  } finally {
    db.pragma("foreign_keys = ON");
  }
}

console.log(`\nConcluído! ${novasAplicadas} novas migrações aplicadas.`);
db.close();
