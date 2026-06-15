"use client";
import { use } from "react";
import { useTurmaDesignacoes, useTurma } from "@/hooks/useTurmas";
import Link from "next/link";
import { Printer, ArrowLeft } from "lucide-react";

export default function ImprimirDesignacoesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: turma } = useTurma(id);
  const { data: designacoes, isLoading } = useTurmaDesignacoes(id);

  if (isLoading) return <div style={{ padding: 40, textAlign: "center" }}>A carregar modelo...</div>;

  const atribuidas = designacoes?.filter((d) => (d as any).designacao_id && (d as any).turma_estudante_id) || [];

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh", fontFamily: "serif" }}>
      <div className="no-print" style={{ padding: "20px", display: "flex", gap: 16, background: "#fff", borderBottom: "1px solid #e5e7eb", justifyContent: "center" }}>
        <Link href={`/turmas/${id}/designacoes`} className="btn btn-ghost">
          <ArrowLeft size={16} /> Voltar
        </Link>
        <button className="btn btn-primary" onClick={() => window.print()}>
          <Printer size={16} /> Imprimir / Guardar como PDF
        </button>
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
              <h1 style={{ fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 20, textTransform: "uppercase" }}>
                Escola Para Anciãos de Congregação
              </h1>
              
              <div style={{ textAlign: "center", marginBottom: 50, fontSize: 14 }}>
                <strong>Data:</strong> <span style={{ border: "1px solid #000", padding: "2px 8px", marginLeft: 8 }}>{new Date().toLocaleDateString("pt-AO")}</span>
              </div>

              <p style={{ marginBottom: 16, fontSize: 15, lineHeight: 1.6 }}>Prezado aluno,</p>
              
              <p style={{ marginBottom: 40, fontSize: 15, lineHeight: 1.6, textIndent: 40, textAlign: "justify" }}>
                Será muito bom receber você na Escola para Anciãos de Congregação. Nesse curso,
                com certeza, receberemos excelentes orientações e encorajamento do escravo fiel e
                prudente. Incentivamos você a participar com seus comentários nas aulas. Também
                gostaríamos que aceitasse a designação abaixo:
              </p>

              <table style={{ width: "100%", fontSize: 15, marginBottom: 50, borderCollapse: "separate", borderSpacing: "0 16px" }}>
                <tbody>
                  <tr>
                    <td style={{ width: 140, fontWeight: "bold", verticalAlign: "top" }}>Dia:</td>
                    <td style={{ textTransform: "capitalize" }}>{(d as any).dia_semana}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", verticalAlign: "top" }}>Unidade:</td>
                    <td style={{ textTransform: "uppercase" }}>{(d as any).titulo?.split("-")[0]?.trim() || (d as any).titulo}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", verticalAlign: "top" }}>Designação <span style={{ color: "red" }}>{(d as any).numero}</span>:</td>
                    <td>{(d as any).tipo === "outro" || (d as any).tipo === "comentario" ? (d as any).titulo : (d as any).tipo?.charAt(0).toUpperCase() + (d as any).tipo?.slice(1)}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", verticalAlign: "top" }}>Tempo:</td>
                    <td>{(d as any).duracao_minutos} min</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", verticalAlign: "top" }}>Orientações:</td>
                    <td style={{ textAlign: "justify", fontStyle: "italic", color: "#444" }}>
                      {/* Placeholder until detailed orientations are added to DB */}
                      Por favor, prepare a sua designação conforme as instruções do manual da escola para a unidade correspondente. Respeite rigorosamente o tempo estipulado.
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", verticalAlign: "top" }}>Participante:</td>
                    <td style={{ color: "red" }}>{(d as any).estudante_nome}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ textAlign: "center", marginTop: 60 }}>
                <p style={{ marginBottom: 20, fontSize: 15 }}>Seu irmão,</p>
                <p style={{ fontWeight: "bold", color: "#d97706", background: "#fef08a", display: "inline-block", padding: "4px 12px" }}>
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
