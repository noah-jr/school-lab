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

    atribuidas.forEach((d: any, index: number) => {
      if (index > 0) {
        doc.addPage();
      }

      // --- BRANDING SCHOOL-LAB ---
      // Logotipo SL "entrelaçado"
      doc.setFontSize(32);
      doc.setFont("helvetica", "bolditalic");
      doc.setTextColor(30, 64, 175); // Azul Royal (mistura para dar destaque)
      doc.text("S", 40, 50);
      doc.setTextColor(234, 88, 12); // Laranja 
      doc.text("L", 56, 50); // L ligeiramente sobreposto/junto
      
      // Nome do Sistema
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 64, 175);
      doc.text("School-Lab", 40, 65);
      doc.setTextColor(0, 0, 0); // Reset cor para preto

      // Title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("ESCOLA PARA ANCIÃOS DE CONGREGAÇÃO", doc.internal.pageSize.getWidth() / 2, 90, { align: "center" });

      // Date
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Data:`, doc.internal.pageSize.getWidth() / 2 - 30, 120);
      
      // Date Box
      doc.setDrawColor(0);
      doc.rect(doc.internal.pageSize.getWidth() / 2, 108, 80, 16);
      doc.text(dataImpressao, doc.internal.pageSize.getWidth() / 2 + 5, 120);

      // Salutation
      doc.text("Prezado aluno,", 40, 160);

      // Paragraph
      const text = "Será muito bom receber você na Escola para Anciãos de Congregação. Nesse curso, com certeza, receberemos excelentes orientações e encorajamento do escravo fiel e prudente. Incentivamos você a participar com seus comentários nas aulas. Também gostaríamos que aceitasse a designação abaixo:";
      const lines = doc.splitTextToSize(text, doc.internal.pageSize.getWidth() - 80);
      doc.text(lines, 40, 180);

      // Table layout
      let startY = 250;
      const labelX = 40;
      const valueX = 140;
      const rowHeight = 25;

      doc.setFont("helvetica", "bold");
      doc.text("Dia:", labelX, startY);
      doc.setFont("helvetica", "normal");
      doc.text(String(d.dia_semana || ""), valueX, startY);
      startY += rowHeight;

      doc.setFont("helvetica", "bold");
      doc.text("Unidade:", labelX, startY);
      doc.setFont("helvetica", "normal");
      const unidade = String(d.titulo || "").split("-")[0]?.trim().toUpperCase() || String(d.titulo || "").toUpperCase();
      doc.text(unidade, valueX, startY);
      startY += rowHeight;

      doc.setFont("helvetica", "bold");
      doc.text(`Designação ${d.numero}:`, labelX, startY);
      doc.setFont("helvetica", "normal");
      const designacaoVal = (d.tipo === "outro" || d.tipo === "comentario") ? d.titulo : d.tipo;
      doc.text(String(designacaoVal || ""), valueX, startY);
      startY += rowHeight;

      doc.setFont("helvetica", "bold");
      doc.text("Tempo:", labelX, startY);
      doc.setFont("helvetica", "normal");
      doc.text(`${d.duracao_minutos} min`, valueX, startY);
      startY += rowHeight;

      doc.setFont("helvetica", "bold");
      doc.text("Orientações:", labelX, startY);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(68, 68, 68);
      const obsLines = doc.splitTextToSize("Por favor, prepare a sua designação conforme as instruções do manual da escola para a unidade correspondente. Respeite rigorosamente o tempo estipulado.", doc.internal.pageSize.getWidth() - valueX - 40);
      doc.text(obsLines, valueX, startY);
      doc.setTextColor(0, 0, 0);
      startY += rowHeight * 2;

      doc.setFont("helvetica", "bold");
      doc.text("Participante:", labelX, startY);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(255, 0, 0);
      doc.text(String(d.estudante_nome || ""), valueX, startY);
      doc.setTextColor(0, 0, 0);
      
      // Signature
      startY += 80;
      doc.text("Seu irmão,", doc.internal.pageSize.getWidth() / 2, startY, { align: "center" });
      
      startY += 20;
      const instrutor = `[${(turma as any).instrutor_a_nome || "Instrutor"}]`;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(217, 119, 6); 
      const textWidth = doc.getTextWidth(instrutor);
      doc.setFillColor(254, 240, 138); 
      doc.rect(doc.internal.pageSize.getWidth() / 2 - textWidth / 2 - 12, startY - 14, textWidth + 24, 20, "F");
      doc.text(instrutor, doc.internal.pageSize.getWidth() / 2, startY, { align: "center" });
      doc.setTextColor(0, 0, 0);
    });

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
