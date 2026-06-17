const fs = require("fs");
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

  try {
    const stdout = execSync(cmd, { encoding: "utf-8" });
    const resp = JSON.parse(stdout);
    const result = resp.results[0].response.result;
    return result.rows.map(row => row[0].value);
  } catch (e) {
    console.error("Erro:", e.message);
  }
}

console.log("Tokens de Acesso Estudantes:", executeRemote("SELECT token_acesso FROM turma_estudantes WHERE token_acesso IS NOT NULL LIMIT 5", []));
console.log("Tokens de Avaliacao Viajante:", executeRemote("SELECT token FROM tokens_avaliacao WHERE token IS NOT NULL LIMIT 5", []));
