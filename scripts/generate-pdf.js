const fs = require("fs");
const path = require("path");
const { jsPDF } = require("jspdf");

function parseMarkdownToPdf(mdPath, pdfPath, title) {
  if (!fs.existsSync(mdPath)) {
    console.error(`Erro: Arquivo não encontrado em ${mdPath}`);
    return;
  }
  const content = fs.readFileSync(mdPath, "utf-8");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const lines = content.split("\n");
  
  // Configuração de margens e página
  const pageHeight = 297;
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  
  let y = 25;
  
  // Cabeçalho da Capa
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text(title, margin, y);
  y += 10;
  
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text("Gerado automaticamente pelo sistema School-Lab", margin, y);
  y += 15;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line === "---" || line === "") continue;

    // Verificar quebra de página
    if (y > pageHeight - margin - 15) {
      doc.addPage();
      y = 20;
    }

    if (line.startsWith("# ")) {
      // Ignora título H1 principal por já ter cabeçalho
      continue;
    } else if (line.startsWith("## ")) {
      const heading = line.replace("## ", "").trim();
      y += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(30, 41, 59);
      doc.text(heading, margin, y);
      y += 8;
    } else if (line.startsWith("### ")) {
      const heading = line.replace("### ", "").trim();
      y += 3;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text(heading, margin, y);
      y += 6;
    } else if (line.startsWith("* ") || line.startsWith("- ")) {
      const bulletText = line.replace(/^[\*\-]\s+/, "").trim();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      
      const splitText = doc.splitTextToSize("• " + bulletText, contentWidth - 5);
      for (const t of splitText) {
        if (y > pageHeight - margin - 10) {
          doc.addPage();
          y = 20;
        }
        doc.text(t, margin + 4, y);
        y += 5.5;
      }
    } else {
      // Parágrafo Normal
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      
      const splitText = doc.splitTextToSize(line, contentWidth);
      for (const t of splitText) {
        if (y > pageHeight - margin - 10) {
          doc.addPage();
          y = 20;
        }
        doc.text(t, margin, y);
        y += 5.5;
      }
      y += 2; // Espaço após parágrafo
    }
  }

  // Adicionar número de páginas no rodapé
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(`Página ${p} de ${pageCount}`, pageWidth - margin - 25, pageHeight - 10);
  }

  doc.save(pdfPath);
  console.log(`PDF gerado com sucesso em: ${pdfPath}`);
}

const docsDir = path.join(__dirname, "..", "docs");
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

parseMarkdownToPdf(
  path.join(docsDir, "doc_tecnico_completo.md"),
  path.join(docsDir, "doc_tecnico_completo.pdf"),
  "Documentação Técnica Completa: School-Lab"
);

parseMarkdownToPdf(
  path.join(docsDir, "manual_do_utilizador.md"),
  path.join(docsDir, "manual_do_utilizador.pdf"),
  "Manual do Utilizador: School-Lab"
);
