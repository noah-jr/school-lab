import { NextRequest, NextResponse } from "next/server";
import { listarDesignacoesDaTurma } from "@/lib/repositories/designacoes";
import getDb from "@/lib/db";
import { jsPDF } from "jspdf";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const db = getDb();
    const turma = db.prepare("SELECT * FROM turmas WHERE id = ?").get(id);
    if (!turma) return NextResponse.json({ erro: "Turma não encontrada" }, { status: 404 });

    const designacoes = listarDesignacoesDaTurma(id);
    const atribuidas = designacoes.filter((d: any) => d.designacao_id && d.turma_estudante_id);

    if (atribuidas.length === 0) {
      return NextResponse.json({ erro: "Nenhuma designação atribuída para exportar." }, { status: 400 });
    }

    const dataImpressao = new Date().toLocaleDateString("pt-AO");

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });

    // Agrupar designações por estudante (um estudante pode ter múltiplas partes)
    const porEstudante = new Map<string, any[]>();
    for (const d of atribuidas) {
      const key = d.turma_estudante_id;
      if (!porEstudante.has(key)) porEstudante.set(key, []);
      porEstudante.get(key)!.push(d);
    }

    let pageIndex = 0;
    for (const [, partes] of porEstudante) {
      if (pageIndex > 0) doc.addPage();
      pageIndex++;

      const d = partes[0]; // dados base (nome, turma, etc.) vêm da primeira parte
      const pageW = doc.internal.pageSize.getWidth();

      // Sem logotipo — apenas título centrado
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("ESCOLA PARA ANCIÃOS DE CONGREGAÇÃO", pageW / 2, 60, { align: "center" });

      // Data
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Data:`, pageW / 2 - 30, 90);
      doc.setDrawColor(0);
      doc.rect(pageW / 2, 78, 80, 16);
      doc.text(dataImpressao, pageW / 2 + 5, 90);

      // Saudação
      doc.text("Prezado aluno,", 40, 130);

      // Parágrafo introdutório (sem menção ao manual)
      const text = "Será muito bom receber você na Escola para Anciãos de Congregação. Nesse curso, com certeza, receberemos excelentes orientações e encorajamento do escravo fiel e prudente. Incentivamos você a participar com seus comentários nas aulas. Também gostaríamos que aceitasse a(s) designação(ões) abaixo:";
      const lines = doc.splitTextToSize(text, pageW - 80);
      doc.text(lines, 40, 150);

      let startY = 220;
      const labelX = 40;
      const valueX = 160;
      const rowHeight = 26;

      // Participante em destaque
      doc.setFont("helvetica", "bold");
      doc.text("Participante:", labelX, startY);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(220, 38, 38);
      doc.text(String(d.estudante_nome || ""), valueX, startY);
      doc.setTextColor(0, 0, 0);
      startY += rowHeight;

      // Linha separadora
      doc.setDrawColor(200, 200, 200);
      doc.line(labelX, startY - 8, pageW - 40, startY - 8);

      // Uma linha por parte atribuída
      for (const p of partes) {
        doc.setFont("helvetica", "bold");
        doc.text(`Designação ${p.numero}:`, labelX, startY);
        doc.setFont("helvetica", "normal");
        const designacaoVal = p.titulo || p.tipo || "";
        doc.text(String(designacaoVal), valueX, startY);
        startY += rowHeight;

        doc.setFont("helvetica", "bold");
        doc.text("Dia:", labelX, startY);
        doc.setFont("helvetica", "normal");
        const diaCapit = String(p.dia_semana || "");
        doc.text(diaCapit.charAt(0).toUpperCase() + diaCapit.slice(1), valueX, startY);
        startY += rowHeight;

        doc.setFont("helvetica", "bold");
        doc.text("Tempo:", labelX, startY);
        doc.setFont("helvetica", "normal");
        doc.text(`${p.duracao_minutos || "—"} min`, valueX, startY);
        startY += rowHeight;

        // Separador entre partes
        doc.setDrawColor(230, 230, 230);
        doc.line(labelX, startY - 8, pageW - 40, startY - 8);
        startY += 4;
      }

      // Orientações gerais
      startY += 8;
      doc.setFont("helvetica", "bold");
      doc.text("Orientações:", labelX, startY);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(68, 68, 68);
      const obsText = "Prepare bem a sua designação e respeite rigorosamente o tempo estipulado. Qualquer dúvida, entre em contacto com os instrutores.";
      const obsLines = doc.splitTextToSize(obsText, pageW - valueX - 40);
      doc.text(obsLines, valueX, startY);
      doc.setTextColor(0, 0, 0);
      startY += rowHeight * 2;

      // Assinatura
      doc.setFont("helvetica", "normal");
      doc.text("Seu irmão,", pageW / 2, startY, { align: "center" });
      startY += 20;
      const instrutor = `[${(turma as any).instrutor_a_nome || "Instrutor"}]`;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(217, 119, 6);
      const textWidth = doc.getTextWidth(instrutor);
      doc.setFillColor(254, 240, 138);
      doc.rect(pageW / 2 - textWidth / 2 - 12, startY - 14, textWidth + 24, 20, "F");
      doc.text(instrutor, pageW / 2, startY, { align: "center" });
      doc.setTextColor(0, 0, 0);
    }

    const arrayBuffer = doc.output('arraybuffer');

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="designacoes_turma_${(turma as any).numero_turma}.pdf"`,
      },
    });
  } catch (err) {
    console.error("[PDF Export Error]", err);
    return NextResponse.json({ erro: "Erro ao gerar PDF no backend" }, { status: 500 });
  }
}
