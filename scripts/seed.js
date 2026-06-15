const Database = require("better-sqlite3");
const path = require("path");
const crypto = require("crypto");

const dbPath = path.join(process.cwd(), "data", "escola.db");
const db = new Database(dbPath);

console.log("A iniciar seed de estudantes falsos...");

const nomes = ["João Silva", "Maria Santos", "Pedro Costa", "Ana Pereira", "Carlos Almeida", "Sofia Rodrigues", "Miguel Ferreira", "Beatriz Gomes", "Rui Martins", "Catarina Lopes", "Hugo Fernandes", "Inês Carvalho", "Tiago Pinto", "Rita Ribeiro", "Nuno Mendes", "Marta Oliveira", "André Sousa", "Diana Machado", "Bruno Teixeira", "Sara Marques"];

const agora = new Date().toISOString();

db.transaction(() => {
  for (const nome of nomes) {
    const id = crypto.randomUUID();
    const email = nome.toLowerCase().replace(" ", ".") + "@jwpub.org";
    const papel = Math.random() > 0.5 ? "anciao" : "servo";
    
    try {
      db.prepare(`
        INSERT INTO estudantes (id, nome, email_jwpub, telefone_principal, papel_ministerial, activo, criado_em, actualizado_em)
        VALUES (?, ?, ?, ?, ?, 1, ?, ?)
      `).run(id, nome, email, "912345678", papel, agora, agora);
      console.log(`✅ Estudante criado: ${nome} (${papel})`);
    } catch (e) {
      // Ignorar duplicados se correr mais que uma vez
    }
  }
})();

console.log("Seed concluída!");
