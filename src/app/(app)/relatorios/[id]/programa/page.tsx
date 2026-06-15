"use client";
import { use } from "react";
import { useTurma, useTurmaDesignacoes } from "@/hooks/useTurmas";
import Link from "next/link";

const DIAS_DA_SEMANA = ["segunda", "terca", "quarta", "quinta", "sexta"];

export default function ProgramaReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: turma, isLoading: loadingTurma } = useTurma(id);
  const { data: designacoes, isLoading: loadingDesig } = useTurmaDesignacoes(id);

  if (loadingTurma || loadingDesig) return <div className="page-body">A carregar...</div>;
  if (!turma || !designacoes) return <div className="page-body">Dados não encontrados.</div>;

  return (
    <div style={{ backgroundColor: "#fff", color: "#000", minHeight: "100dvh", padding: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }} className="print:hidden">
        <Link href="/relatorios" className="btn btn-ghost" style={{ color: "#000", borderColor: "#ccc" }}>← Voltar</Link>
        <button onClick={() => window.print()} className="btn btn-primary">🖨️ Imprimir Programa</button>
      </div>

      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <h1 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 5 }}>PROGRAMA DE DESIGNAÇÕES</h1>
        <h2 style={{ fontSize: 18, fontWeight: "normal" }}>{turma.nome} — {turma.local_nome}</h2>
        <p style={{ marginTop: 5, fontSize: 14 }}>
          Data: {new Date(turma.data_inicio).toLocaleDateString("pt-AO")} a {new Date(turma.data_fim).toLocaleDateString("pt-AO")}
        </p>
      </div>

      {DIAS_DA_SEMANA.map(dia => {
        const partesDoDia = designacoes.filter(d => d.dia_semana === dia);
        if (partesDoDia.length === 0) return null;
        return (
          <div key={dia} style={{ marginBottom: 40 }}>
            <h3 style={{ textTransform: "uppercase", borderBottom: "2px solid #000", paddingBottom: 5, marginBottom: 15, fontSize: 16 }}>{dia}</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{...thStyle, width: 60}}>Hora</th>
                  <th style={thStyle}>Parte / Tema</th>
                  <th style={{...thStyle, width: 100}}>Tipo</th>
                  <th style={thStyle}>Estudante Designado</th>
                </tr>
              </thead>
              <tbody>
                {partesDoDia.map(parte => (
                  <tr key={parte.parte_id}>
                    <td style={tdStyle}>{parte.hora_inicio ?? "-"}</td>
                    <td style={{...tdStyle, fontWeight: "bold"}}>{parte.titulo}</td>
                    <td style={{...tdStyle, textTransform: "capitalize"}}>{parte.tipo}</td>
                    <td style={tdStyle}>{(parte as any).estudante_nome || "(Por atribuir)"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

    </div>
  );
}

const thStyle: React.CSSProperties = {
  border: "1px solid #000",
  padding: "8px",
  backgroundColor: "#f0f0f0",
  textAlign: "left",
  fontWeight: "bold"
};

const tdStyle: React.CSSProperties = {
  border: "1px solid #000",
  padding: "8px"
};
