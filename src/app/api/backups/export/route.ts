import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.papel !== "admin") {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    // Tenta encontrar o db.sqlite ou data/escola.db
    let dbPath = path.join(process.cwd(), "db.sqlite");
    if (!fs.existsSync(dbPath)) {
      dbPath = path.join(process.cwd(), "data", "escola.db");
    }

    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ erro: "Ficheiro da base de dados não encontrado no servidor" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(dbPath);
    const dateStr = new Date().toISOString().split("T")[0];

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/vnd.sqlite3",
        "Content-Disposition": `attachment; filename="school_lab_backup_${dateStr}.sqlite"`,
      },
    });
  } catch (err) {
    console.error("[Export DB Error]", err);
    return NextResponse.json({ erro: "Erro ao exportar base de dados" }, { status: 500 });
  }
}
