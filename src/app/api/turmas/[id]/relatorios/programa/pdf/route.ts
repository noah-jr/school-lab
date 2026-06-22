import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { jsPDF } from "jspdf";

// Helper: draw a simple table using only jsPDF primitives (no jspdf-autotable)
function drawTable(
  doc: jsPDF,
  startY: number,
  headers: string[],
  rows: string[][],
  colWidths: number[],
  startX = 40
) {
  const rowH = 18;
  const pageH = doc.internal.pageSize.getHeight();
  let y = startY;

  // Header row
  doc.setFillColor(235, 241, 255);
  doc.setDrawColor(180, 200, 240);
  doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowH, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 64, 175);
  let cx = startX;
  headers.forEach((h, i) => {
    doc.text(h, cx + 3, y + 12);
    cx += colWidths[i];
  });
  y += rowH;

  // Data rows
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  rows.forEach((row, ri) => {
    if (y + rowH > pageH - 40) {
      doc.addPage();
      y = 40;
    }
    const fill = ri % 2 === 0 ? [248, 250, 255] : [255, 255, 255];
    doc.setFillColor(fill[0], fill[1], fill[2]);
    doc.setDrawColor(220, 220, 230);
    const totalW = colWidths.reduce((a, b) => a + b, 0);
    doc.rect(startX, y, totalW, rowH, "FD");
    cx = startX;
    row.forEach((cell, i) => {
      const text = doc.splitTextToSize(String(cell ?? "—"), colWidths[i] - 5);
      doc.text(text[0], cx + 3, y + 12);
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

    const designacoes = db.prepare(`
      SELECT 
        d.id, d.dia_semana, d.status,
        p.numero AS parte_numero, p.titulo AS parte_titulo,
        p.tipo AS parte_tipo, p.hora_inicio, p.duracao_minutos,
        e.nome AS estudante_nome
      FROM designacoes d
      JOIN programa_partes p ON d.parte_id = p.id
      LEFT JOIN turma_estudantes te ON d.turma_estudante_id = te.id
      LEFT JOIN estudantes e ON te.estudante_id = e.id
      WHERE d.turma_id = ?
      ORDER BY p.dia_semana, p.numero ASC
    `).all(id) as any[];

    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();

    // ── Cabeçalho ─────────────────────────────────────────────
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageW, 70, "F");

    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(147, 197, 253);
    doc.text("EAC", 40, 22);

    doc.setFontSize(17); doc.setTextColor(255, 255, 255);
    doc.text("Programa da Escola", pageW / 2, 40, { align: "center" });

    doc.setFontSize(11); doc.setFont("helvetica", "normal");
    doc.text(`${turma.numero_turma}ª Turma — ${turma.nome || ""}`, pageW / 2, 58, { align: "center" });

    doc.setTextColor(60, 60, 60); doc.setFontSize(9);
    const di = turma.data_inicio ? new Date(turma.data_inicio).toLocaleDateString("pt-PT") : "—";
    const df = turma.data_fim    ? new Date(turma.data_fim).toLocaleDateString("pt-PT")    : "—";
    doc.text(`${di} a ${df}  |  Local: ${turma.local_nome || "—"}`, pageW / 2, 82, { align: "center" });

    // ── Corpo ──────────────────────────────────────────────────
    const diasDaSemana = ["segunda", "terca", "quarta", "quinta", "sexta"];
    const nomesDias: Record<string, string> = {
      segunda: "Segunda-feira", terca: "Terça-feira", quarta: "Quarta-feira",
      quinta: "Quinta-feira", sexta: "Sexta-feira",
    };

    let startY = 98;

    if (designacoes.length === 0) {
      doc.setFontSize(12); doc.setTextColor(100, 100, 100);
      doc.text("Nenhuma designação atribuída para esta turma.", pageW / 2, 200, { align: "center" });
    } else {
      diasDaSemana.forEach((dia) => {
        const partes = designacoes.filter(d => d.dia_semana === dia).sort((a, b) => a.parte_numero - b.parte_numero);
        if (partes.length === 0) return;

        if (startY > doc.internal.pageSize.getHeight() - 120) { doc.addPage(); startY = 40; }

        doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 64, 175);
        doc.text(nomesDias[dia].toUpperCase(), 40, startY);
        doc.setTextColor(0, 0, 0);
        startY += 6;

        const rows = partes.map(p => [
          p.hora_inicio || "—",
          String(p.parte_numero),
          p.parte_titulo || "—",
          (p.parte_tipo || "").charAt(0).toUpperCase() + (p.parte_tipo || "").slice(1),
          p.estudante_nome || "Por atribuir",
        ]);

        startY = drawTable(doc, startY, ["Hora", "Nº", "Tema da Parte", "Tipo", "Estudante Designado"], rows, [48, 28, 180, 70, 145]);
        startY += 10;
      });
    }

    // ── Instrutores ────────────────────────────────────────────
    if (startY > doc.internal.pageSize.getHeight() - 60) { doc.addPage(); startY = 40; }

    doc.setFillColor(248, 250, 252); doc.setDrawColor(200, 210, 230);
    doc.rect(40, startY, pageW - 80, 44, "FD");
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(60, 60, 60);
    doc.text("Instrutor Principal:", 52, startY + 15);
    doc.setFont("helvetica", "normal"); doc.text(turma.instrutor_a_nome || "—", 165, startY + 15);
    doc.setFont("helvetica", "bold"); doc.text("Instrutor Auxiliar:", 52, startY + 31);
    doc.setFont("helvetica", "normal"); doc.text(turma.instrutor_b_nome || "—", 165, startY + 31);

    doc.setFontSize(7); doc.setTextColor(160, 160, 160);
    doc.text(`Gerado em ${new Date().toLocaleString("pt-PT")} via EAC`, pageW / 2, startY + 56, { align: "center" });

    const arrayBuffer = doc.output("arraybuffer");
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="programa_turma_${turma.numero_turma}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("[PDF Programa Error]", err?.message || err);
    return NextResponse.json({ erro: "Erro ao gerar PDF do programa", detalhe: err?.message }, { status: 500 });
  }
}
