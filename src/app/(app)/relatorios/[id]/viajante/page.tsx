"use client";
import { use } from "react";
import { useTurma, useTurmaEstudantes } from "@/hooks/useTurmas";
import Link from "next/link";

export default function ViajanteReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: turma, isLoading: loadingTurma } = useTurma(id);
  const { data: estudantes, isLoading: loadingEstudantes } = useTurmaEstudantes(id);

  if (loadingTurma || loadingEstudantes) return <div className="page-body">A carregar...</div>;
  if (!turma || !estudantes) return <div className="page-body">Dados não encontrados.</div>;

  return (
    <div style={{ backgroundColor: "#fff", color: "#000", minHeight: "100dvh", padding: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }} className="print:hidden">
        <Link href="/relatorios" className="btn btn-ghost" style={{ color: "#000", borderColor: "#ccc" }}>← Voltar</Link>
        <button onClick={() => window.print()} className="btn btn-primary">🖨️ Imprimir Folha</button>
      </div>

      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <h1 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>AVALIAÇÃO DO SUPERVISOR DE CIRCUITO</h1>
        <h2 style={{ fontSize: 18, fontWeight: "normal" }}>{turma.nome} — {turma.local_nome}</h2>
        <p style={{ marginTop: 10 }}>
          Por favor, avalie a aptidão de oratória de cada estudante (A, B ou C).
          Esta folha deve ser devolvida aos instrutores antes de gerarem as designações.
        </p>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>#</th>
            <th style={thStyle}>Nome do Estudante</th>
            <th style={thStyle}>Congregação</th>
            <th style={thStyle}>Nível (A, B, C)</th>
            <th style={thStyle}>Email / Notas</th>
          </tr>
        </thead>
        <tbody>
          {estudantes.map((est) => (
            <tr key={est.id}>
              <td style={tdStyle}>{est.numero_lista ?? "-"}</td>
              <td style={{...tdStyle, fontWeight: "bold"}}>{(est as any).estudante_nome}</td>
              <td style={tdStyle}>{(est as any).congregacao_nome}</td>
              <td style={tdStyle}></td>
              <td style={tdStyle}></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 40, borderTop: "1px solid #ccc", paddingTop: 20 }}>
        <p><strong>Legenda:</strong> A = Excelente aptidão; B = Boa aptidão; C = Necessita melhorar. (Pode usar + ou - para maior precisão).</p>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  border: "1px solid #000",
  padding: "10px",
  backgroundColor: "#f0f0f0",
  textAlign: "left",
  fontWeight: "bold"
};

const tdStyle: React.CSSProperties = {
  border: "1px solid #000",
  padding: "10px",
  height: "40px"
};
