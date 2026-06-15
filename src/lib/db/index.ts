import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "escola.db");
const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

// Garante que o directório data existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Instância singleton da DB
let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  _db = new Database(DB_PATH, {
    verbose: process.env.NODE_ENV === "development" ? console.log : undefined,
  });

  // Performance pragmas
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  _db.pragma("synchronous = NORMAL");
  _db.pragma("cache_size = -64000"); // 64MB cache

  return _db;
}

export function runMigrations(): void {
  const db = getDb();

  // Tabela de controlo de migrations
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      ficheiro  TEXT NOT NULL UNIQUE,
      aplicado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const aplicadas = db
    .prepare("SELECT ficheiro FROM _migrations")
    .all() as { ficheiro: string }[];
  const aplicadasSet = new Set(aplicadas.map((r) => r.ficheiro));

  const ficheiros = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const ficheiro of ficheiros) {
    if (aplicadasSet.has(ficheiro)) continue;

    const sql = fs.readFileSync(
      path.join(MIGRATIONS_DIR, ficheiro),
      "utf-8"
    );

    db.pragma("foreign_keys = OFF");
    
    const aplicar = db.transaction(() => {
      db.exec(sql);
      db.prepare("INSERT INTO _migrations (ficheiro) VALUES (?)").run(ficheiro);
    });

    try {
      aplicar();
      console.log(`✅ Migração aplicada: ${ficheiro}`);
    } finally {
      db.pragma("foreign_keys = ON");
    }
  }
}

export default getDb;
