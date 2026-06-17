import Database from "better-sqlite3";
import fs from "fs"; 
import path from "path";

const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? "/tmp" : path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "escola.db");
const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

// Garante que o directório data existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Se estiver na Vercel, copia a BD do bundle para a pasta /tmp de escrita
if (IS_VERCEL) {
  const bundleDbPath = path.join(process.cwd(), "data", "escola.db");
  if (!fs.existsSync(DB_PATH) && fs.existsSync(bundleDbPath)) {
    try {
      fs.copyFileSync(bundleDbPath, DB_PATH);
      console.log("[VERCEL] Base de dados copiada com sucesso para /tmp/escola.db");
    } catch (e) {
      console.error("[VERCEL] Erro ao copiar base de dados:", e);
    }
  }
}

// Instância singleton da DB
let _db: Database.Database | null = null;
let _migrationsRun = false;

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

  if (!_migrationsRun) {
    _migrationsRun = true;
    runMigrations();
  }

  return _db;
}

export function fecharDb(): void {
  if (_db) {
    try {
      _db.close();
    } catch (e) {
      console.error("Erro ao fechar DB:", e);
    }
    _db = null;
    _migrationsRun = false;
  }
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
      console.log(`[SUCESSO] Migração aplicada: ${ficheiro}`);
    } catch (err: any) {
      // Se a coluna já existe (corrida entre processos ou restart), marcar como aplicada
      if (err?.message?.includes('duplicate column name') || err?.message?.includes('already exists')) {
        console.warn(`[AVISO] ${ficheiro}: objecto já existe, a marcar como aplicada.`);
        try { db.prepare("INSERT OR IGNORE INTO _migrations (ficheiro) VALUES (?)").run(ficheiro); } catch {}
      } else {
        console.error(`[ERRO] Migração ${ficheiro} falhou:`, err);
        // Não relançar — não bloquear o servidor por uma migração falhada
      }
    } finally {
      db.pragma("foreign_keys = ON");
    }
  }
}

export const db = getDb();
export { DB_PATH, DATA_DIR };
export default getDb;
