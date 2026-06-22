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

// Cliente remoto síncrono para o Turso (Hrana v2 HTTP)
import { execSync } from "child_process";

function executeRemote(sql: string, args: any[]) {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  
  if (!url) throw new Error("TURSO_DATABASE_URL não está configurado.");
  
  // Mapear argumentos para o formato Hrana JSON
  const formattedArgs = args.map(arg => {
    if (arg === null || arg === undefined) return { type: "null" };
    if (typeof arg === "string") return { type: "text", value: arg };
    if (typeof arg === "number") {
      if (Number.isInteger(arg)) return { type: "integer", value: String(arg) };
      return { type: "float", value: arg };
    }
    if (typeof arg === "boolean") return { type: "integer", value: arg ? "1" : "0" };
    if (Buffer.isBuffer(arg)) return { type: "blob", base64: arg.toString("base64") };
    return { type: "text", value: String(arg) };
  });

  const payload = {
    baton: null,
    requests: [
      {
        type: "execute",
        stmt: {
          sql,
          args: formattedArgs
        }
      },
      {
        type: "close"
      }
    ]
  };

  const payloadStr = JSON.stringify(payload).replace(/'/g, "'\\''");
  
  let apiUrl = url;
  if (apiUrl.startsWith("libsql://")) {
    apiUrl = "https://" + apiUrl.substring(9);
  }
  apiUrl = apiUrl.endsWith("/v2/pipeline") ? apiUrl : `${apiUrl.replace(/\/$/, "")}/v2/pipeline`;

  const headers = `-H "Authorization: Bearer ${token}" -H "Content-Type: application/json"`;
  const cmd = `curl -s -X POST ${headers} -d '${payloadStr}' "${apiUrl}"`;

  let stdout = "";
  try {
    stdout = execSync(cmd, { encoding: "utf-8" });
    const resp = JSON.parse(stdout);

    if (resp.errors && resp.errors.length > 0) {
      throw new Error(resp.errors[0].message || "Erro desconhecido no Turso");
    }

    const resultOk = resp.results[0];
    if (resultOk.type === "error") {
      throw new Error(resultOk.error.message);
    }

    const result = resultOk.response.result;
    const cols = result.cols.map((c: any) => c.name);
    const rows = result.rows.map((row: any[]) => {
      const obj: any = {};
      for (let i = 0; i < cols.length; i++) {
        const colName = cols[i];
        const cell = row[i];
        if (cell.type === "null") {
          obj[colName] = null;
        } else if (cell.type === "text") {
          obj[colName] = cell.value;
        } else if (cell.type === "integer") {
          obj[colName] = Number(cell.value);
        } else if (cell.type === "float") {
          obj[colName] = cell.value;
        } else if (cell.type === "blob") {
          obj[colName] = Buffer.from(cell.base64, "base64");
        }
      }
      return obj;
    });

    return {
      rows,
      affected_row_count: result.affected_row_count || 0,
      last_insert_rowid: Number(result.last_insert_rowid || 0)
    };
  } catch (e: any) {
    console.error("[TURSO] Erro na execução da query:", e.message);
    if (stdout) console.error("[TURSO] Resposta do servidor:", stdout);
    throw e;
  }
}

class RemoteStatement {
  constructor(private sql: string) {}

  private getArgs(args: any[]) {
    if (args.length === 1 && Array.isArray(args[0])) {
      return args[0];
    }
    return args;
  }

  run(...args: any[]) {
    const res = executeRemote(this.sql, this.getArgs(args));
    return {
      changes: res.affected_row_count,
      lastInsertRowid: res.last_insert_rowid
    };
  }

  all(...args: any[]) {
    const res = executeRemote(this.sql, this.getArgs(args));
    return res.rows;
  }

  get(...args: any[]) {
    const res = executeRemote(this.sql, this.getArgs(args));
    return res.rows[0];
  }
}

const remoteDb = {
  prepare(sql: string) {
    return new RemoteStatement(sql);
  },
  exec(sql: string) {
    executeRemote(sql, []);
  },
  transaction(fn: any) {
    return (...args: any[]) => fn(...args);
  },
  pragma(sql: string) {
    return [];
  },
  close() {
    // no-op
  }
};

// Instância singleton da base de dados (EAC - EAC-Standard)
let _db: any = null;
let _migrationsRun = false;

export function getDb(): any {
  if (process.env.TURSO_DATABASE_URL) {
    return remoteDb;
  }

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
  if (process.env.TURSO_DATABASE_URL) {
    return;
  }
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
