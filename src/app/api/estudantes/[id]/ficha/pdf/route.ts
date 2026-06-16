import { NextResponse } from "next/server";
import { obterEstudante, historicoEstudante } from "@/lib/repositories/estudantes";
import { jsPDF } from "jspdf";
import { getSession } from "@/lib/auth";
import { registarLog } from "@/lib/logger";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    const estudante = obterEstudante(id);
    if (!estudante) return new NextResponse("Estudante não encontrado", { status: 404 });

    const historico = historicoEstudante(id);
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    // ── Cabeçalho ──────────────────────────────────────────────
    doc.setFillColor(30, 64, 175); doc.rect(0, 0, pageW, 65, "F");
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(147, 197, 253);
    doc.text("SCHOOL-LAB ANGOLA", 20, 20);
    doc.setFontSize(18); doc.setTextColor(255, 255, 255);
    doc.text("Ficha do Estudante", pageW / 2, 40, { align: "center" });
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(estudante.nome, pageW / 2, 56, { align: "center" });

    // ── Foto ────────────────────────────────────────────────────
    let yPos = 80;
    if (estudante.fotografia && estudante.fotografia.startsWith("data:image")) {
      try {
        const imgType = estudante.fotografia.includes("image/png") ? "PNG" : "JPEG";
        doc.addImage(estudante.fotografia, imgType, pageW - 60, 70, 40, 40);
      } catch (_) { /* ignora erros de imagem */ }
    }

    // ── Dados ───────────────────────────────────────────────────
    const labelX = 20, valueX = 72, lineH = 9;

    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 64, 175);
    doc.text("Informações Pessoais", labelX, yPos);
    yPos += 4;
    doc.setDrawColor(200, 210, 240); doc.line(labelX, yPos, pageW - 65, yPos);
    yPos += lineH;

    const info = [
      ["Papel Ministerial:", estudante.papel_ministerial === "anciao" ? "Ancião" : "Servo Ministerial"],
      ["Congregação:", (estudante as any).congregacao_nome || "N/D"],
      ["Email JWPub:", estudante.email_jwpub || "N/D"],
      ["Telefone:", estudante.telefone_principal || "N/D"],
    ];

    doc.setFontSize(10);
    info.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold"); doc.setTextColor(60, 60, 60);
      doc.text(label, labelX, yPos);
      doc.setFont("helvetica", "normal"); doc.setTextColor(20, 20, 20);
      doc.text(value, valueX, yPos);
      yPos += lineH;
    });

    yPos += 10;

    // ── Histórico ───────────────────────────────────────────────
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 64, 175);
    doc.text("Histórico de Participações", labelX, yPos);
    yPos += 4;
    doc.setDrawColor(200, 210, 240); doc.line(labelX, yPos, pageW - 20, yPos);
    yPos += 8;

    if (!historico || historico.length === 0) {
      doc.setFontSize(10); doc.setFont("helvetica", "italic"); doc.setTextColor(120, 120, 120);
      doc.text("Nenhuma participação registada até ao momento.", labelX, yPos + 4);
    } else {
      // Header
      const cols = [35, 60, 55, 30];
      const rowH = 16;
      doc.setFillColor(235, 241, 255); doc.setDrawColor(180, 200, 240);
      doc.rect(labelX, yPos, cols.reduce((a, b) => a + b, 0), rowH, "FD");
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(30, 64, 175);
      let cx = labelX;
      ["Turma", "Status", "Nível Avaliado", "Val."].forEach((h, i) => {
        doc.text(h, cx + 2, yPos + 11);
        cx += cols[i];
      });
      yPos += rowH;

      historico.forEach((h: any, ri: number) => {
        const fill = ri % 2 === 0 ? [248, 250, 255] : [255, 255, 255];
        doc.setFillColor(fill[0], fill[1], fill[2]);
        doc.setDrawColor(220, 220, 230);
        doc.rect(labelX, yPos, cols.reduce((a, b) => a + b, 0), rowH, "FD");
        doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(30, 30, 30);
        cx = labelX;
        [
          `${h.numero_turma}ª Turma`,
          h.status || "—",
          h.nivel_oratoria || "Pendente",
          h.avaliado_pelo_viajante ? "Sim" : "Não",
        ].forEach((cell, i) => {
          doc.text(cell, cx + 2, yPos + 11);
          cx += cols[i];
        });
        yPos += rowH;
      });
    }

    doc.setFontSize(7); doc.setTextColor(160, 160, 160);
    doc.text(`Gerado em ${new Date().toLocaleString("pt-PT")} via School-Lab`, pageW / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });

    const pdfBuffer = doc.output("arraybuffer");

    registarLog({
      acao: "Exportação de Ficha PDF",
      detalhe: `Gerou e descarregou o PDF da ficha de estudante de "${estudante.nome}".`,
      severidade: "info",
      utilizadorId: session?.id
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="ficha_${estudante.nome.replace(/\s+/g, "_")}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Erro a gerar Ficha PDF:", error);
    return new NextResponse("Erro ao gerar PDF", { status: 500 });
  }
}
