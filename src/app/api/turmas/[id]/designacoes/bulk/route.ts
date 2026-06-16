import { NextRequest, NextResponse } from "next/server";
import { atribuirDesignacao } from "@/lib/repositories/designacoes";
import getDb from "@/lib/db";

// POST /api/turmas/[id]/designacoes/bulk
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { atribuicoes } = body as { atribuicoes: { turma_estudante_id: string; parte_id: string; dia_semana: string }[] };

    if (!Array.isArray(atribuicoes)) {
      return NextResponse.json({ erro: "Formato inválido" }, { status: 400 });
    }

    const db = getDb();
    
    db.transaction(() => {
      for (const atrib of atribuicoes) {
        // Remover designação existente para esta parte nesta turma (limpa quem tinha antes)
        db.prepare(`DELETE FROM designacoes WHERE turma_id = ? AND parte_id = ?`).run(id, atrib.parte_id);
        
        // Atribuir o novo estudante
        if (atrib.turma_estudante_id) {
            atribuirDesignacao(id, atrib.turma_estudante_id, atrib.parte_id, atrib.dia_semana);
        }
      }
    })();
    
    return NextResponse.json({ mensagem: "Designações atualizadas em lote com sucesso." });
  } catch (err) {
    console.error("[POST /api/turmas/[id]/designacoes/bulk]", err);
    return NextResponse.json({ erro: "Erro ao atualizar designações em lote" }, { status: 500 });
  }
}
