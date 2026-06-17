import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { fecharDb } from "@/lib/db";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    // 1. Autorização
    const session = await getSession();
    if (!session || session.papel !== "admin") {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    // 2. Obter o ficheiro a partir da request
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ erro: "Nenhum ficheiro fornecido" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Caminhos
    const dataDir = path.join(process.cwd(), "data");
    const dbPath = path.join(dataDir, "escola.db");
    const tempDbPath = path.join(dataDir, "escola.db.temp");

    // Garante que o directório data existe
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 3. Escrever ficheiro temporário
    fs.writeFileSync(tempDbPath, buffer);

    // 4. Validar se é uma base de dados SQLite válida
    let isValid = false;
    let dbTest: Database.Database | null = null;
    try {
      dbTest = new Database(tempDbPath);
      // Corre uma query simples de teste para verificar integridade básica
      dbTest.prepare("SELECT name FROM sqlite_master LIMIT 1").get();
      isValid = true;
    } catch (e: any) {
      console.error("[Restauro] Ficheiro inválido ou corrompido:", e.message);
    } finally {
      if (dbTest) {
        dbTest.close();
      }
    }

    if (!isValid) {
      if (fs.existsSync(tempDbPath)) {
        fs.unlinkSync(tempDbPath);
      }
      return NextResponse.json({ erro: "O ficheiro fornecido não é uma base de dados SQLite válida." }, { status: 400 });
    }

    // 5. Fechar ligação ativa do singleton para evitar locks
    fecharDb();

    // 6. Substituir ficheiro da BD e apagar ficheiros auxiliares do WAL/SHM
    try {
      // Remover escola.db-wal se existir
      const walPath = `${dbPath}-wal`;
      if (fs.existsSync(walPath)) {
        fs.unlinkSync(walPath);
      }

      // Remover escola.db-shm se existir
      const shmPath = `${dbPath}-shm`;
      if (fs.existsSync(shmPath)) {
        fs.unlinkSync(shmPath);
      }

      // Substituir o ficheiro principal
      fs.renameSync(tempDbPath, dbPath);

      console.log("[Restauro] Base de dados restaurada com sucesso!");

      return NextResponse.json({ 
        mensagem: "Base de dados restaurada com sucesso! O sistema foi atualizado." 
      });
    } catch (err: any) {
      console.error("[Restauro] Erro ao substituir ficheiro:", err);
      return NextResponse.json({ 
        erro: "Falha ao aplicar o restauro no servidor." 
      }, { status: 500 });
    }
  } catch (err: any) {
    console.error("[POST /api/backups/recover]", err);
    return NextResponse.json({ erro: "Erro interno no servidor ao restaurar backup" }, { status: 500 });
  }
}
