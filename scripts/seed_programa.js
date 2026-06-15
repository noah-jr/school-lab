const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dbPath = path.join(process.cwd(), "data", "escola.db");
const db = new Database(dbPath);

const sqlPath = path.join(process.cwd(), "migrations", "002_seed_programa.sql");

console.log("A preparar para executar o seed_programa.sql...");

try {
  const sql = fs.readFileSync(sqlPath, "utf-8");
  
  db.transaction(() => {
    // Executamos o SQL diretamente
    db.exec(sql);
    
    // Inserimos ou ignoramos o registo na tabela de migrações para o sistema saber que já foi corrido
    db.prepare(`
      INSERT OR IGNORE INTO _migrations (ficheiro) VALUES ('002_seed_programa.sql')
    `).run();
  })();
  
  console.log("✅ seed_programa.sql executado com sucesso!");
} catch (error) {
  if (error.message.includes("UNIQUE constraint failed")) {
    console.log("⚠️ Os dados do programa já existem na base de dados (Ignorado).");
  } else {
    console.error("❌ Erro ao executar o seed:", error.message);
  }
}
