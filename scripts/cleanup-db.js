const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

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

function executeRemote(sql, args = []) {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  
  if (!url) throw new Error("TURSO_DATABASE_URL não está configurado.");
  
  const formattedArgs = args.map(arg => {
    if (arg === null || arg === undefined) return { type: "null" };
    if (typeof arg === "string") return { type: "text", value: arg };
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

  const stdout = execSync(cmd, { encoding: "utf-8" });
  const resp = JSON.parse(stdout);
  if (resp.results && resp.results[0].response) {
    return resp.results[0].response.result;
  }
  return resp;
}

async function run() {
  console.log("A verificar tabelas no banco de dados...");
  
  try {
    // 1. Restaurar turma_estudantes
    const resTE = executeRemote("SELECT name FROM sqlite_master WHERE type='table' AND name='old_turma_estudantes'");
    const hasOldTE = resTE && resTE.rows && resTE.rows.length > 0;
    
    if (hasOldTE) {
      console.log("A tabela 'old_turma_estudantes' foi encontrada! A restaurar o estado original...");
      executeRemote("DROP TABLE IF EXISTS turma_estudantes");
      console.log("[-] Tabela temporária 'turma_estudantes' incompleta removida.");
      executeRemote("ALTER TABLE old_turma_estudantes RENAME TO turma_estudantes");
      console.log("[+] Tabela 'turma_estudantes' original restaurada com sucesso!");
    } else {
      console.log("[-] Nenhuma tabela 'old_turma_estudantes' encontrada.");
    }
    
    // 2. Restaurar designacoes
    const resDesig = executeRemote("SELECT name FROM sqlite_master WHERE type='table' AND name='old_designacoes'");
    const hasOldDesig = resDesig && resDesig.rows && resDesig.rows.length > 0;
    
    if (hasOldDesig) {
      console.log("A tabela 'old_designacoes' foi encontrada! A restaurar o estado original...");
      executeRemote("DROP TABLE IF EXISTS designacoes");
      console.log("[-] Tabela temporária 'designacoes' incompleta removida.");
      executeRemote("ALTER TABLE old_designacoes RENAME TO designacoes");
      console.log("[+] Tabela 'designacoes' original restaurada com sucesso!");
    } else {
      console.log("[-] Nenhuma tabela 'old_designacoes' encontrada.");
    }
    
    console.log("\nPronto! Pode executar 'yarn db:migrate' novamente para aplicar a migração 021 corrigida.");
  } catch (e) {
    console.error("Erro durante a limpeza:", e.message);
  }
}

run();
