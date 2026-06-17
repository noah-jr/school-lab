"use client";
import { use, useEffect, useState } from "react";
import api from "@/lib/axios";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTurma } from "@/hooks/useTurmas";

export default function RelatorioProgramaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: turmaReq, isLoading: isTurmaLoading } = useTurma(id);
  const [designacoes, setDesignacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/turmas/${id}/designacoes`).then(res => {
      // Agrupar designações por dia da semana
      setDesignacoes(res.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (isTurmaLoading || loading) return <div style={{ padding: 32 }}>A compilar relatório de programa...</div>;
  if (!turmaReq) return <div>Turma não encontrada</div>;

  const turma = turmaReq;

  const diasDaSemana = ["segunda", "terca", "quarta", "quinta", "sexta"];
  const nomesDias: Record<string, string> = {
    "segunda": "Segunda-feira",
    "terca": "Terça-feira",
    "quarta": "Quarta-feira",
    "quinta": "Quinta-feira",
    "sexta": "Sexta-feira"
  };

  return (
    <div style={{ padding: "0 24px" }}>
      
      {/* Botões do UI - Ocultos na impressão */}
      <div className="no-print" style={{ marginBottom: "24px", display: "flex", gap: "12px", background: "var(--bg-surface)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border)", alignItems: "center" }}>
        <Link href="/relatorios" className="btn btn-ghost"><ArrowLeft size={16} /> Voltar</Link>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: "13px", color: "var(--text-muted)", marginRight: "12px" }}>
          Pode imprimir esta página diretamente ou descarregar o documento original em PDF.
        </span>
        <button className="btn btn-outline" onClick={() => window.print()} style={{ display: "flex", gap: "8px" }}>
          <Printer size={16} /> Imprimir Ecrã
        </button>
        <a href={`/api/turmas/${id}/relatorios/programa/pdf`} target="_blank" className="btn btn-primary" style={{ display: "flex", gap: "8px" }}>
          <Printer size={16} /> Exportar / Descarregar PDF
        </a>
      </div>

      {/* Papel do Relatório A4 */}
      <div className="report-a4">
        
        {/* Cabeçalho */}
        <div style={{ textAlign: "center", marginBottom: "32px", borderBottom: "2px solid #222", paddingBottom: "16px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "bold", textTransform: "uppercase", margin: "0 0 8px 0" }}>
            Programa da Escola
          </h1>
          <h2 style={{ fontSize: "16px", fontWeight: "normal", margin: "0 0 4px 0" }}>
            Turma {turma.numero_turma}ª - {turma.nome}
          </h2>
          <p style={{ fontSize: "14px", margin: 0 }}>
            {new Date(turma.data_inicio).toLocaleDateString("pt-PT")} a {new Date(turma.data_fim).toLocaleDateString("pt-PT")} | Local: {turma.local_nome}
          </p>
        </div>

        {/* Cronograma Agrupado por Dias */}
        {diasDaSemana.map((dia) => {
          const partesDoDia = designacoes.filter(d => d.dia_semana === dia).sort((a, b) => a.parte_numero - b.parte_numero);
          
          if (partesDoDia.length === 0) return null;

          return (
            <div key={dia} style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "bold", textTransform: "uppercase", borderBottom: "1px solid #ccc", paddingBottom: "4px", marginBottom: "12px" }}>
                {nomesDias[dia]}
              </h3>
              
              <table className="report-table" style={{ marginBottom: 0 }}>
                <thead>
                  <tr>
                    <th style={{ width: "60px", textAlign: "center" }}>Hora</th>
                    <th style={{ width: "50px", textAlign: "center" }}>Nº</th>
                    <th>Tema da Parte</th>
                    <th>Tipo</th>
                    <th>Estudante Designado</th>
                  </tr>
                </thead>
                <tbody>
                  {partesDoDia.map(parte => (
                    <tr key={parte.id}>
                      <td style={{ textAlign: "center" }}>{parte.hora_inicio || "—"}</td>
                      <td style={{ textAlign: "center", fontWeight: "bold" }}>{parte.parte_numero}</td>
                      <td>{parte.parte_titulo}</td>
                      <td style={{ textTransform: "capitalize" }}>{parte.parte_tipo}</td>
                      <td style={{ fontWeight: 600 }}>{parte.estudante_nome || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}

        {/* Instrutores */}
        <div style={{ marginTop: "40px", padding: "16px", border: "1px solid #ccc", background: "#fafafa" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "14px" }}><strong>Instrutor Principal:</strong> {turma.instrutor_a_nome || "—"}</p>
          <p style={{ margin: "0", fontSize: "14px" }}><strong>Instrutor Auxiliar:</strong> {turma.instrutor_b_nome || "—"}</p>
        </div>

      </div>

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
