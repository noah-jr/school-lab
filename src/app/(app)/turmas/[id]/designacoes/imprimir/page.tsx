"use client";
import { use } from "react";
import { useTurmaDesignacoes, useTurma } from "@/hooks/useTurmas";
import Link from "next/link";
import { Printer, ArrowLeft, Copy } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function ImprimirDesignacoesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: turma } = useTurma(id);
  const { data: designacoes, isLoading } = useTurmaDesignacoes(id);

  const toast = useToast();
  if (isLoading) return <div style={{ padding: 40, textAlign: "center" }}>A carregar modelo...</div>;

  const atribuidas = designacoes?.filter((d) => (d as any).designacao_id && (d as any).turma_estudante_id) || [];

  const copiarParaGoogleDocs = () => {
    if (atribuidas.length === 0) {
      toast.erro("Nenhuma designação disponível para copiar.");
      return;
    }

    let texto = `ESCOLA PARA ANCIÃOS DE CONGREGAÇÃO\n`;
    texto += `Programa de Designações - Turma: ${turma?.nome || ""}\n\n`;

    atribuidas.forEach((d: any) => {
      texto += `-------------------------------------------\n`;
      texto += `Estudante: ${d.estudante_nome}\n`;
      texto += `Dia: ${d.dia_semana}\n`;
      texto += `Unidade: ${d.titulo?.split("-")[0]?.trim() || d.titulo}\n`;
      texto += `Designação #${d.numero}: ${d.tipo === "outro" || d.tipo === "comentario" ? d.titulo : d.tipo?.charAt(0).toUpperCase() + d.tipo?.slice(1)}\n`;
      texto += `Tempo: ${d.duracao_minutos} min\n`;
      texto += `Orientações: Prepare bem a sua designação e respeite rigorosamente o tempo estipulado. Qualquer dúvida, entre em contacto com os instrutores.\n`;
      texto += `-------------------------------------------\n\n`;
    });

    navigator.clipboard.writeText(texto)
      .then(() => {
        toast.sucesso("Texto das designações copiado! Pode colá-lo no Google Docs para editar.");
      })
      .catch(() => {
        toast.erro("Erro ao copiar o texto.");
      });
  };

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh", fontFamily: "serif" }}>
      <div className="no-print" style={{ padding: "20px", display: "flex", flexWrap: "wrap", gap: 16, background: "#fff", borderBottom: "1px solid #e5e7eb", justifyContent: "center", alignItems: "center" }}>
        <Link href={`/turmas/${id}/designacoes`} className="btn btn-ghost">
          <ArrowLeft size={16} /> Voltar
        </Link>
        <button className="btn btn-ghost" onClick={copiarParaGoogleDocs}>
          <Copy size={16} /> Copiar p/ Google Docs
        </button>
        <button className="btn btn-primary" onClick={() => window.print()}>
          <Printer size={16} /> Imprimir / Guardar como PDF
        </button>
        <div style={{ width: "100%", textAlign: "center", fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
          💡 <strong>Dica:</strong> Pode clicar em qualquer texto (nome, orientações, etc.) na folha abaixo para editá-lo diretamente antes de imprimir!
        </div>
      </div>

      <div className="print-container" style={{ padding: "40px 20px" }}>
        {atribuidas.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, fontFamily: "sans-serif" }}>Nenhuma designação atribuída para imprimir.</div>
        ) : (
          atribuidas.map((d, index) => (
            <div 
               key={(d as any).designacao_id} 
               className="print-page" 
               style={{ 
                 background: "#fff", 
                 maxWidth: 800, 
                 margin: "0 auto 40px", 
                 padding: "80px 60px",
                 boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                 pageBreakAfter: index === atribuidas.length - 1 ? "auto" : "always"
               }}
            >
              <h1 
                contentEditable={true} 
                suppressContentEditableWarning={true}
                style={{ fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 20, textTransform: "uppercase", outline: "none" }}
              >
                Escola Para Anciãos de Congregação
              </h1>
              
              <div style={{ textAlign: "center", marginBottom: 50, fontSize: 14 }}>
                <strong>Data:</strong> <span contentEditable={true} suppressContentEditableWarning={true} style={{ border: "1px solid #000", padding: "2px 8px", marginLeft: 8, outline: "none" }}>{new Date().toLocaleDateString("pt-AO")}</span>
              </div>

              <p contentEditable={true} suppressContentEditableWarning={true} style={{ marginBottom: 16, fontSize: 15, lineHeight: 1.6, outline: "none" }}>Prezado aluno,</p>
              
              <p 
                contentEditable={true} 
                suppressContentEditableWarning={true}
                style={{ marginBottom: 40, fontSize: 15, lineHeight: 1.6, textIndent: 40, textAlign: "justify", outline: "none" }}
              >
                Será muito bom receber você na Escola para Anciãos de Congregação. Nesse curso,
                com certeza, receberemos excelentes orientações e encorajamento do escravo fiel e
                prudente. Incentivamos você a participar com seus comentários nas aulas. Também
                gostaríamos que aceitasse a designação abaixo:
              </p>

              <table style={{ width: "100%", fontSize: 15, marginBottom: 50, borderCollapse: "separate", borderSpacing: "0 16px" }}>
                <tbody>
                  <tr>
                    <td style={{ width: 140, fontWeight: "bold", verticalAlign: "top" }}>Dia:</td>
                    <td contentEditable={true} suppressContentEditableWarning={true} style={{ textTransform: "capitalize", outline: "none" }}>{(d as any).dia_semana}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", verticalAlign: "top" }}>Unidade:</td>
                    <td contentEditable={true} suppressContentEditableWarning={true} style={{ textTransform: "uppercase", outline: "none" }}>{(d as any).titulo?.split("-")[0]?.trim() || (d as any).titulo}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", verticalAlign: "top" }}>Designação <span style={{ color: "red" }}>{(d as any).numero}</span>:</td>
                    <td contentEditable={true} suppressContentEditableWarning={true} style={{ outline: "none" }}>{(d as any).tipo === "outro" || (d as any).tipo === "comentario" ? (d as any).titulo : (d as any).tipo?.charAt(0).toUpperCase() + (d as any).tipo?.slice(1)}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", verticalAlign: "top" }}>Tempo:</td>
                    <td contentEditable={true} suppressContentEditableWarning={true} style={{ outline: "none" }}>{(d as any).duracao_minutos} min</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", verticalAlign: "top" }}>Orientações:</td>
                    <td 
                      contentEditable={true} 
                      suppressContentEditableWarning={true}
                      style={{ textAlign: "justify", fontStyle: "italic", color: "#444", outline: "none" }}
                    >
                      Prepare bem a sua designação e respeite rigorosamente o tempo estipulado. Qualquer dúvida, entre em contacto com os instrutores.
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", verticalAlign: "top" }}>Participante:</td>
                    <td contentEditable={true} suppressContentEditableWarning={true} style={{ color: "red", outline: "none" }}>{(d as any).estudante_nome}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ textAlign: "center", marginTop: 60 }}>
                <p contentEditable={true} suppressContentEditableWarning={true} style={{ marginBottom: 20, fontSize: 15, outline: "none" }}>Seu irmão,</p>
                <p 
                  contentEditable={true} 
                  suppressContentEditableWarning={true}
                  style={{ fontWeight: "bold", color: "#d97706", background: "#fef08a", display: "inline-block", padding: "4px 12px", outline: "none" }}
                >
                  [{turma?.instrutor_a_nome || "Instrutor"}]
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .print-container, .print-container * { visibility: visible; }
          .print-container { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; }
          .print-page { box-shadow: none !important; margin: 0 !important; padding: 40px !important; }
          .no-print { display: none !important; }
          @page { margin: 1cm; }
        }
      `}} />
    </div>
  );
}
