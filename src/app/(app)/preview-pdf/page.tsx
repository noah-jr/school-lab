"use client";
import { PageHeader } from "@/components/layout/Sidebar";
import { useSearchParams } from "next/navigation";
import { Download, Printer, FileText, AlertCircle, Loader, Edit2 } from "lucide-react";
import { Suspense, useState } from "react";

const getEditUrl = (url: string) => {
  // 1. Relatório Viajante
  let match = url.match(/\/api\/turmas\/([^\/]+)\/relatorios\/viajante\/pdf/);
  if (match) return `/relatorios/${match[1]}/viajante`;

  // 2. Relatório Programa
  match = url.match(/\/api\/turmas\/([^\/]+)\/relatorios\/programa\/pdf/);
  if (match) return `/relatorios/${match[1]}/programa`;

  // 3. Designações
  match = url.match(/\/api\/turmas\/([^\/]+)\/relatorios\/designacoes\/pdf/);
  if (match) return `/turmas/${match[1]}/designacoes/imprimir`;

  // 4. Ficha do Estudante
  match = url.match(/\/api\/estudantes\/([^\/]+)\/ficha\/pdf/);
  if (match) return `/estudantes/${match[1]}/ficha/imprimir`;

  return null;
};

function PdfViewerContent() {
  const searchParams = useSearchParams();
  const pdfUrl = searchParams.get("url");
  const titulo = searchParams.get("title") || "Visualização de Documento";
  const voltarPara = searchParams.get("back") || "/";

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  if (!pdfUrl) {
    return <div style={{ padding: 32 }}>Nenhum documento especificado.</div>;
  }

  const editUrl = getEditUrl(pdfUrl);
  const nomeArquivo = titulo.replace(/\s+/g, "_") + ".pdf";

  const handleImprimir = () => {
    const iframe = document.getElementById("pdf-frame") as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } else {
      // Fallback: abre num novo separador para impressão
      window.open(pdfUrl, "_blank");
    }
  };

  const handleBaixar = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = nomeArquivo;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <PageHeader
        title={titulo}
        breadcrumb={[{ label: "Voltar", href: voltarPara }, { label: "Pré-visualização" }]}
        actions={
          <div style={{ display: "flex", gap: 12 }}>
            {editUrl && (
              <a href={editUrl} className="btn btn-outline" style={{ display: "flex", gap: 8 }}>
                <Edit2 size={16} /> Editar / Personalizar
              </a>
            )}
            <button
              className="btn btn-outline"
              onClick={handleBaixar}
              title={`Baixar "${nomeArquivo}"`}
            >
              <Download size={16} /> Baixar PDF
            </button>
            <button
              className="btn btn-primary"
              onClick={handleImprimir}
              title="Imprimir documento"
            >
              <Printer size={16} /> Imprimir
            </button>
          </div>
        }
      />

      <div className="page-body" style={{ padding: "0 24px 24px", height: "calc(100dvh - 120px)" }}>
        <div style={{
          width: "100%",
          height: "100%",
          background: "var(--bg-elevated)",
          borderRadius: 8,
          border: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative"
        }}>

          {/* Barra de estado do documento */}
          <div style={{
            padding: "10px 16px",
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: "var(--text-muted)",
            flexShrink: 0
          }}>
            <FileText size={14} />
            <span style={{ flex: 1 }}>{titulo}</span>
            {carregando && !erro && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--info)" }}>
                <Loader size={12} style={{ animation: "spin 1s linear infinite" }} /> A gerar PDF...
              </span>
            )}
            {erro && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--danger)" }}>
                <AlertCircle size={12} /> Erro ao carregar
              </span>
            )}
          </div>

          {/* Ecrã de carregamento */}
          {carregando && !erro && (
            <div style={{
              position: "absolute", top: 48, left: 0, right: 0, bottom: 0,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              background: "var(--bg-elevated)", zIndex: 10, gap: 16
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                border: "3px solid var(--border)", borderTopColor: "var(--accent)",
                animation: "spin 0.8s linear infinite"
              }} />
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>A gerar documento PDF...</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>O motor de exportação está a processar os dados da base de dados.</p>
              </div>
            </div>
          )}

          {/* Ecrã de erro */}
          {erro && (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 32
            }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--danger-faint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertCircle size={28} color="var(--danger)" />
              </div>
              <div style={{ textAlign: "center", maxWidth: 400 }}>
                <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Não foi possível visualizar o documento</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                  O servidor encontrou um erro ao gerar o PDF. Verifique se a turma ou o estudante têm dados suficientes para exportar.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <button className="btn btn-outline" onClick={() => { setErro(false); setCarregando(true); }}>
                    Tentar Novamente
                  </button>
                  <a href={voltarPara} className="btn btn-ghost">← Voltar</a>
                </div>
              </div>
            </div>
          )}

          {/* iframe do PDF */}
          {!erro && (
            <iframe
              id="pdf-frame"
              key={pdfUrl}
              src={pdfUrl}
              style={{
                width: "100%",
                flex: 1,
                border: "none",
                opacity: carregando ? 0 : 1,
                transition: "opacity 0.3s ease"
              }}
              title={titulo}
              onLoad={() => setCarregando(false)}
              onError={() => { setCarregando(false); setErro(true); }}
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

export default function PreviewPdfPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "var(--text-muted)" }}>A carregar visualizador...</p>
      </div>
    }>
      <PdfViewerContent />
    </Suspense>
  );
}
