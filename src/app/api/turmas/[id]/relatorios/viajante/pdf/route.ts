import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { jsPDF } from "jspdf";

function drawTable(
  doc: jsPDF, startY: number,
  headers: string[], rows: string[][], colWidths: number[], startX = 40
) {
  const rowH = 18;
  const pageH = doc.internal.pageSize.getHeight();
  let y = startY;

  doc.setFillColor(235, 241, 255); doc.setDrawColor(180, 200, 240);
  doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowH, "FD");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(30, 64, 175);
  let cx = startX;
  headers.forEach((h, i) => { doc.text(h, cx + 3, y + 12); cx += colWidths[i]; });
  y += rowH;

  doc.setFont("helvetica", "normal"); doc.setTextColor(30, 30, 30);
  rows.forEach((row, ri) => {
    if (y + rowH > pageH - 40) { doc.addPage(); y = 40; }
    const fill = ri % 2 === 0 ? [248, 250, 255] : [255, 255, 255];
    doc.setFillColor(fill[0], fill[1], fill[2]); doc.setDrawColor(220, 220, 230);
    doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowH, "FD");
    cx = startX;
    row.forEach((cell, i) => {
      doc.text(String(cell ?? "—").substring(0, 40), cx + 3, y + 12);
      cx += colWidths[i];
    });
    y += rowH;
  });
  return y + 6;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();
    const turma = db.prepare("SELECT * FROM turmas WHERE id = ?").get(id) as any;
    if (!turma) return NextResponse.json({ erro: "Turma não encontrada" }, { status: 404 });

    const estudantes = db.prepare(`
      SELECT te.*, e.nome AS estudante_nome, e.papel_ministerial, c.nome AS congregacao_nome
      FROM turma_estudantes te
      JOIN estudantes e ON te.estudante_id = e.id
      LEFT JOIN congregacoes c ON e.congregacao_id = c.id
      WHERE te.turma_id = ?
      ORDER BY te.numero_lista ASC, e.nome ASC
    `).all(id) as any[];

    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();

    // ── Cabeçalho ─────────────────────────────────────────────
    doc.setFillColor(30, 64, 175); doc.rect(0, 0, pageW, 70, "F");
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(147, 197, 253);
    doc.text("SCHOOL-LAB ANGOLA", 40, 22);
    doc.setFontSize(14); doc.setTextColor(255, 255, 255);
    doc.text("Escola para Anciãos e Servos Ministeriais", pageW / 2, 38, { align: "center" });
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text("Relatório de Avaliação para o Superintendente de Circuito", pageW / 2, 56, { align: "center" });

    // ── Dados da Turma ─────────────────────────────────────────
    doc.setFontSize(9); doc.setTextColor(50, 50, 50);
    const di = turma.data_inicio ? new Date(turma.data_inicio).toLocaleDateString("pt-PT") : "—";
    const df = turma.data_fim    ? new Date(turma.data_fim).toLocaleDateString("pt-PT")    : "—";
    doc.text(`Turma: ${turma.numero_turma}ª — ${turma.nome}`, 40, 88);
    doc.text(`Local: ${turma.local_nome || "—"}${turma.local_cidade ? ` (${turma.local_cidade})` : ""}`, 40, 100);
    doc.text(`Início: ${di}`, pageW - 40, 88, { align: "right" });
    doc.text(`Término: ${df}`, pageW - 40, 100, { align: "right" });

    // ── Tabela de Estudantes ───────────────────────────────────
    const rows = estudantes.map(e => [
      String(e.numero_lista || "—"),
      e.estudante_nome,
      e.papel_ministerial === "anciao" ? "Ancião" : "Servo M.",
      e.congregacao_nome || "—",
      e.nivel_oratoria || "S/A",
    ]);

    let endY = drawTable(doc, 114, ["Nº", "Nome do Estudante", "Privilégio", "Congregação", "Nível Alcançado"], rows, [35, 175, 65, 120, 76]);

    // ── Assinaturas ────────────────────────────────────────────
    if (endY + 80 > doc.internal.pageSize.getHeight()) { doc.addPage(); endY = 40; }
    endY += 30;

    doc.setDrawColor(0);
    doc.line(80, endY, 230, endY);
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80);
    doc.text("Assinatura do Instrutor Principal", 155, endY + 13, { align: "center" });
    doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
    doc.text(turma.instrutor_a_nome || "_________________", 155, endY + 26, { align: "center" });

    doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80);
    doc.line(360, endY, 510, endY);
    doc.text("Assinatura do Instrutor Auxiliar", 435, endY + 13, { align: "center" });
    doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
    doc.text(turma.instrutor_b_nome || "_________________", 435, endY + 26, { align: "center" });

    doc.setFontSize(7); doc.setTextColor(160, 160, 160);
    doc.text(`Gerado em ${new Date().toLocaleString("pt-PT")} via School-Lab`, pageW / 2, endY + 48, { align: "center" });

    const arrayBuffer = doc.output("arraybuffer");
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="relatorio_viajante_turma_${turma.numero_turma}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("[PDF Viajante Error]", err?.message || err);
    return NextResponse.json({ erro: "Erro ao gerar PDF do relatório", detalhe: err?.message }, { status: 500 });
  }
}
