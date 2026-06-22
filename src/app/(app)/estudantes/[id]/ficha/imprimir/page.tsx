"use client";
import { use, useEffect, useState } from "react";
import api from "@/lib/axios";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ImprimirFichaEstudantePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [estudante, setEstudante] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/estudantes/${id}`).then(res => {
      setEstudante(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 32 }}>A carregar ficha do estudante...</div>;
  if (!estudante) return <div style={{ padding: 32 }}>Estudante não encontrado</div>;

  return (
    <div style={{ padding: "0 24px" }}>
      
      {/* Botões do UI - Ocultos na impressão */}
      <div className="no-print" style={{ marginBottom: "24px", display: "flex", flexWrap: "wrap", gap: "12px", background: "var(--bg-surface)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border)", alignItems: "center" }}>
        <Link href={`/estudantes/${id}`} className="btn btn-ghost"><ArrowLeft size={16} /> Voltar</Link>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: "13px", color: "var(--text-muted)", marginRight: "12px" }}>
          Pode imprimir esta página diretamente ou descarregar o documento original em PDF.
        </span>
        <button className="btn btn-outline" onClick={() => window.print()} style={{ display: "flex", gap: "8px" }}>
          <Printer size={16} /> Imprimir Ecrã
        </button>
        <a href={`/api/estudantes/${id}/ficha/pdf`} target="_blank" className="btn btn-primary" style={{ display: "flex", gap: "8px" }}>
          <Printer size={16} /> Exportar / Descarregar PDF
        </a>
      </div>

      {/* Papel do Relatório A4 */}
      <div className="report-a4">
        
        {/* Cabeçalho */}
        <div style={{ background: "#1e40af", padding: "30px 40px", color: "white", borderRadius: "4px", marginBottom: "40px", position: "relative" }}>
          <span style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", opacity: 0.8 }}>EAC</span>
          <h1 
            contentEditable={true} 
            suppressContentEditableWarning={true}
            style={{ fontSize: "24px", fontWeight: "bold", margin: "8px 0 4px 0", textTransform: "uppercase", outline: "none" }}
          >
            Ficha do Estudante
          </h1>
          <p 
            contentEditable={true} 
            suppressContentEditableWarning={true}
            style={{ fontSize: "16px", margin: 0, opacity: 0.9, outline: "none" }}
          >
            {estudante.nome}
          </p>
        </div>

        {/* Informações Principais e Foto */}
        <div style={{ display: "flex", gap: "40px", marginBottom: "40px" }}>
          
          <div style={{ flex: 1 }}>
            <h3 
              contentEditable={true} 
              suppressContentEditableWarning={true}
              style={{ fontSize: "16px", fontWeight: "bold", color: "#1e40af", borderBottom: "2px solid #cbd5e1", paddingBottom: "6px", marginBottom: "16px", outline: "none" }}
            >
              Informações Pessoais
            </h3>
            
            <table className="info-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "8px 0", fontWeight: "bold", width: "160px", color: "#475569" }}>Papel Ministerial:</td>
                  <td contentEditable={true} suppressContentEditableWarning={true} style={{ padding: "8px 0", outline: "none" }}>
                    {estudante.papel_ministerial === "anciao" ? "Ancião" : "Servo Ministerial"}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", fontWeight: "bold", color: "#475569" }}>Congregação:</td>
                  <td contentEditable={true} suppressContentEditableWarning={true} style={{ padding: "8px 0", outline: "none" }}>
                    {estudante.congregacao_nome || "N/D"}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", fontWeight: "bold", color: "#475569" }}>Email JWPub:</td>
                  <td contentEditable={true} suppressContentEditableWarning={true} style={{ padding: "8px 0", outline: "none" }}>
                    {estudante.email_jwpub || "N/D"}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", fontWeight: "bold", color: "#475569" }}>Telefone:</td>
                  <td contentEditable={true} suppressContentEditableWarning={true} style={{ padding: "8px 0", outline: "none" }}>
                    {estudante.telefone_principal || "N/D"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {estudante.fotografia && (
            <div style={{ flexShrink: 0 }}>
              <img 
                src={estudante.fotografia} 
                alt="Fotografia do estudante" 
                style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px", border: "2px solid #e2e8f0" }}
              />
            </div>
          )}
        </div>

        {/* Histórico de Participações */}
        <div>
          <h3 
            contentEditable={true} 
            suppressContentEditableWarning={true}
            style={{ fontSize: "16px", fontWeight: "bold", color: "#1e40af", borderBottom: "2px solid #cbd5e1", paddingBottom: "6px", marginBottom: "16px", outline: "none" }}
          >
            Histórico de Participações
          </h3>

          <table className="report-table">
            <thead>
              <tr style={{ background: "#eff6ff" }}>
                <th style={{ border: "1px solid #94a3b8", color: "#1e40af", fontWeight: "bold" }}>Turma</th>
                <th style={{ border: "1px solid #94a3b8", color: "#1e40af", fontWeight: "bold" }}>Status</th>
                <th style={{ border: "1px solid #94a3b8", color: "#1e40af", fontWeight: "bold" }}>Nível Avaliado</th>
                <th style={{ border: "1px solid #94a3b8", color: "#1e40af", fontWeight: "bold" }}>Aval. Viajante</th>
              </tr>
            </thead>
            <tbody>
              {!estudante.historico || estudante.historico.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", fontStyle: "italic", color: "#64748b" }}>
                    Nenhuma participação registada até ao momento.
                  </td>
                </tr>
              ) : (
                estudante.historico.map((h: any, i: number) => (
                  <tr key={i}>
                    <td contentEditable={true} suppressContentEditableWarning={true} style={{ outline: "none" }}>{h.numero_turma}ª Turma</td>
                    <td contentEditable={true} suppressContentEditableWarning={true} style={{ outline: "none" }}>{h.status || "—"}</td>
                    <td contentEditable={true} suppressContentEditableWarning={true} style={{ fontWeight: 600, outline: "none" }}>{h.nivel_oratoria || "Pendente"}</td>
                    <td contentEditable={true} suppressContentEditableWarning={true} style={{ outline: "none" }}>{h.avaliado_pelo_viajante ? "Sim" : "Não"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .report-a4 {
          background: white;
          padding: 40px;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          max-width: 900px;
          margin: 0 auto 40px;
          font-family: sans-serif;
        }
        .report-a4, .report-a4 td, .report-a4 th, .report-a4 p, .report-a4 h1, .report-a4 h2, .report-a4 h3, .report-a4 span, .report-a4 div {
          color: black;
        }
        .report-table tbody tr:hover {
          background: transparent !important;
        }

        .report-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 32px;
        }

        .report-table th, .report-table td {
          border: 1px solid #cbd5e1;
          padding: 10px 14px;
          font-size: 13px;
          text-align: left;
        }

        .report-table th {
          background: #eff6ff;
          font-weight: bold;
        }

        @media print {
          @page { size: A4 portrait; margin: 1.5cm; }
          body * { visibility: hidden; }
          .report-a4, .report-a4 * { visibility: visible; }
          .report-a4 {
            position: absolute;
            left: 0; top: 0;
            padding: 0; margin: 0;
            box-shadow: none;
            width: 100%;
          }
          .no-print { display: none !important; }
          .sidebar, .page-header { display: none !important; }
        }
      `}} />
    </div>
  );
}
