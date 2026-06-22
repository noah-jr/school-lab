"use client";
import { use, useEffect, useState } from "react";
import api from "@/lib/axios";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTurma } from "@/hooks/useTurmas";

export default function RelatorioViajantePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: turmaReq, isLoading: isTurmaLoading } = useTurma(id);
  const [estudantes, setEstudantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/turmas/${id}/estudantes`).then(res => {
      setEstudantes(res.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (isTurmaLoading || loading) return <div style={{ padding: 32 }}>A compilar relatório...</div>;
  if (!turmaReq) return <div>Turma não encontrada</div>;

  const turma = turmaReq;

  return (
    <div style={{ padding: "0 24px" }}>
      
      {/* Botões do UI - Serão ocultos na impressão */}
      <div className="no-print" style={{ marginBottom: "24px", display: "flex", flexWrap: "wrap", gap: "12px", background: "var(--bg-surface)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border)", alignItems: "center" }}>
        <Link href="/relatorios" className="btn btn-ghost"><ArrowLeft size={16} /> Voltar</Link>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: "13px", color: "var(--text-muted)", marginRight: "12px" }}>
          Pode imprimir esta página diretamente ou descarregar o documento original em PDF.
        </span>
        <button className="btn btn-outline" onClick={() => window.print()} style={{ display: "flex", gap: "8px" }}>
          <Printer size={16} /> Imprimir Ecrã
        </button>
        <a href={`/api/turmas/${id}/relatorios/viajante/pdf`} target="_blank" className="btn btn-primary" style={{ display: "flex", gap: "8px" }}>
          <Printer size={16} /> Exportar / Descarregar PDF
        </a>
        <div style={{ width: "100%", textAlign: "center", fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
          💡 <strong>Dica:</strong> Pode clicar em qualquer texto (nome, nível, etc.) na folha abaixo para editá-lo diretamente antes de imprimir!
        </div>
      </div>

      {/* Papel do Relatório A4 */}
      <div className="report-a4">
        
        {/* Cabeçalho Oficial */}
        <div style={{ textAlign: "center", marginBottom: "32px", borderBottom: "2px solid #222", paddingBottom: "16px" }}>
          <h1 
            contentEditable={true} 
            suppressContentEditableWarning={true}
            style={{ fontSize: "22px", fontWeight: "bold", textTransform: "uppercase", margin: "0 0 8px 0", outline: "none" }}
          >
            Escola para Anciãos de Congregação
          </h1>
          <h2 
            contentEditable={true} 
            suppressContentEditableWarning={true}
            style={{ fontSize: "16px", fontWeight: "normal", margin: "0 0 4px 0", outline: "none" }}
          >
            Relatório de Avaliação para o Superintendente de Circuito
          </h2>
        </div>

        {/* Informações da Turma */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px", fontSize: "13px" }}>
          <div>
            <p contentEditable={true} suppressContentEditableWarning={true} style={{ outline: "none" }}><strong>Turma:</strong> {turma.numero_turma}ª - {turma.nome}</p>
            <p contentEditable={true} suppressContentEditableWarning={true} style={{ outline: "none" }}><strong>Local:</strong> {turma.local_nome} {turma.local_cidade && `(${turma.local_cidade})`}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p contentEditable={true} suppressContentEditableWarning={true} style={{ outline: "none" }}><strong>Início:</strong> {new Date(turma.data_inicio).toLocaleDateString("pt-PT")}</p>
            <p contentEditable={true} suppressContentEditableWarning={true} style={{ outline: "none" }}><strong>Término:</strong> {new Date(turma.data_fim).toLocaleDateString("pt-PT")}</p>
          </div>
        </div>

        {/* Tabela de Estudantes */}
        <table className="report-table">
          <thead>
            <tr>
              <th style={{ width: "50px", textAlign: "center" }}>Nº</th>
              <th>Nome do Estudante</th>
              <th>Papel</th>
              <th>Congregação</th>
              <th style={{ width: "100px", textAlign: "center" }}>Nível Alcançado</th>
            </tr>
          </thead>
          <tbody>
            {estudantes.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center" }}>Nenhum estudante na turma.</td></tr>
            ) : (
              estudantes.map((e) => (
                <tr key={e.id}>
                  <td contentEditable={true} suppressContentEditableWarning={true} style={{ textAlign: "center", outline: "none" }}>{e.numero_lista || "—"}</td>
                  <td contentEditable={true} suppressContentEditableWarning={true} style={{ fontWeight: 600, outline: "none" }}>{e.estudante_nome}</td>
                  <td contentEditable={true} suppressContentEditableWarning={true} style={{ outline: "none" }}>{e.papel_ministerial === "anciao" ? "Ancião" : "Servo M."}</td>
                  <td contentEditable={true} suppressContentEditableWarning={true} style={{ outline: "none" }}>{e.congregacao_nome || "—"}</td>
                  <td contentEditable={true} suppressContentEditableWarning={true} style={{ textAlign: "center", fontWeight: "bold", outline: "none" }}>{e.nivel_oratoria || "S/A"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Rodapé de Assinatura */}
        <div style={{ marginTop: "64px", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#555" }}>
          <div style={{ textAlign: "center", width: "250px" }}>
            <div style={{ borderBottom: "1px solid #000", marginBottom: "8px", height: "30px" }}></div>
            <p>Assinatura do Instrutor Principal</p>
            <p contentEditable={true} suppressContentEditableWarning={true} style={{ fontWeight: "bold", marginTop: "4px", outline: "none" }}>{turma.instrutor_a_nome || "_________________"}</p>
          </div>
          <div style={{ textAlign: "center", width: "250px" }}>
            <div style={{ borderBottom: "1px solid #000", marginBottom: "8px", height: "30px" }}></div>
            <p>Assinatura do Instrutor Auxiliar</p>
            <p contentEditable={true} suppressContentEditableWarning={true} style={{ fontWeight: "bold", marginTop: "4px", outline: "none" }}>{turma.instrutor_b_nome || "_________________"}</p>
          </div>
        </div>

      </div>

      {/* Estilos específicos para Impressão */}
      <style dangerouslySetInnerHTML={{ __html: `
        .report-a4 {
          background: white;
          color: black;
          padding: 40px;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          max-width: 900px;
          margin: 0 auto 40px;
          font-family: serif;
        }

        .report-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 32px;
        }

        .report-table th, .report-table td {
          border: 1px solid #000;
          padding: 8px 12px;
          font-size: 13px;
        }

        .report-table th {
          background: #f0f0f0;
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
