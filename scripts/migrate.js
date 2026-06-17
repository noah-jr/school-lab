const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "escola.db");
const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

// Carregar variáveis do .env manualmente
if (fs.existsSync(".env")) {
  const envContent = fs.readFileSync(".env", "utf-8");
  envContent.split("\n").forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const parts = trimmed.split("=");
      const key = parts[0].trim();
      let value = parts.slice(1).join("=").trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

function executeRemote(sql, args) {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  
  if (!url) throw new Error("TURSO_DATABASE_URL não está configurado.");
  
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
    const cols = result.cols ? result.cols.map(c => c.name) : [];
    const rows = result.rows ? result.rows.map(row => {
      const obj = {};
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
    }) : [];

    return {
      rows,
      affected_row_count: result.affected_row_count || 0,
      last_insert_rowid: Number(result.last_insert_rowid || 0)
    };
  } catch (e) {
    console.error("[TURSO] Erro na execução da query:", e.message);
    if (stdout) console.error("[TURSO] Resposta do servidor:", stdout);
    throw e;
  }
}

let db;
if (process.env.TURSO_DATABASE_URL) {
  console.log("A ligar à base de dados do Turso:", process.env.TURSO_DATABASE_URL);
  db = {
    prepare(sql) {
      return {
        all(...args) {
          return executeRemote(sql, args).rows;
        },
        run(...args) {
          const res = executeRemote(sql, args);
          return { changes: res.affected_row_count, lastInsertRowid: res.last_insert_rowid };
        }
      };
    },
    exec(sql) {
      // Remover comentários SQL simples (-- ...) antes de fazer split
      const lines = sql.split("\n").map(line => {
        const idx = line.indexOf("--");
        if (idx !== -1) return line.substring(0, idx);
        return line;
      });
      const cleanSql = lines.join("\n");

      const statements = cleanSql
        .split(";")
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.toUpperCase().startsWith("PRAGMA"));
        
      for (const statement of statements) {
        executeRemote(statement, []);
      }
    },
    pragma(sql) {
      return [];
    },
    transaction(fn) {
      return (...args) => fn(...args);
    },
    close() {}
  };
} else {
  // Garante que o directório data existe para o SQLite local
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const Database = require("better-sqlite3");
  console.log("A ligar à base de dados local:", DB_PATH);
  db = new Database(DB_PATH);
  
  // Performance pragmas
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("synchronous = NORMAL");
}

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
    if (err.message.includes('duplicate column name') || err.message.includes('already exists') || err.message.includes('duplicate')) {
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
