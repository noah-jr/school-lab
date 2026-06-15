"use client";
import { PageHeader } from "@/components/layout/Sidebar";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { BookOpen } from "lucide-react";
import { useState } from "react";

export default function ProgramasPage() {
  const [programaExpandido, setProgramaExpandido] = useState<string | null>(null);

  const { data: programas, isLoading: carregandoProgramas } = useQuery({
    queryKey: ["programas"],
    queryFn: async () => {
      const { data } = await api.get("/programas");
      return data.data;
    }
  });

  const { data: partes, isLoading: carregandoPartes } = useQuery({
    queryKey: ["programas", programaExpandido, "partes"],
    queryFn: async () => {
      if (!programaExpandido) return [];
      const { data } = await api.get(`/programas?programa_id=${programaExpandido}`);
      return data.data;
    },
    enabled: !!programaExpandido
  });

  return (
    <>
      <PageHeader title="Programas Escolares" breadcrumb={[{ label: "Programas" }]} />
      <div className="page-body" style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 16px" }}>
        {carregandoProgramas ? (
          <div>A carregar programas...</div>
        ) : (
          <div style={{ display: "grid", gap: "24px" }}>
            {programas?.map((p: any) => (
              <div key={p.id} className="card" style={{ padding: "24px", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--accent-bg, rgba(138, 43, 226, 0.1))", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700 }}>{p.nome}</h3>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{p.descricao}</p>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => setProgramaExpandido(programaExpandido === p.id ? null : p.id)}
                  >
                    {programaExpandido === p.id ? "Esconder Estrutura" : "Ver Estrutura"}
                  </button>
                </div>
                
                {programaExpandido === p.id && (
                  <div style={{ marginTop: "24px", borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px" }}>Partes do Programa ({partes?.length || 0})</h4>
                    {carregandoPartes ? <div>A carregar partes...</div> : (
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                        <thead>
                          <tr style={{ background: "var(--bg-elevated)", textAlign: "left" }}>
                            <th style={{ padding: "8px 12px" }}>#</th>
                            <th style={{ padding: "8px 12px" }}>Dia</th>
                            <th style={{ padding: "8px 12px" }}>Hora</th>
                            <th style={{ padding: "8px 12px" }}>Título</th>
                            <th style={{ padding: "8px 12px" }}>Tipo</th>
                            <th style={{ padding: "8px 12px" }}>Nível Req.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {partes?.map((pt: any) => (
                            <tr key={pt.id} style={{ borderBottom: "1px solid var(--border)" }}>
                              <td style={{ padding: "8px 12px" }}>{pt.numero}</td>
                              <td style={{ padding: "8px 12px", textTransform: "capitalize" }}>{pt.dia_semana}</td>
                              <td style={{ padding: "8px 12px" }}>{pt.hora_inicio} ({pt.duracao_minutos}m)</td>
                              <td style={{ padding: "8px 12px", fontWeight: 500 }}>{pt.titulo}</td>
                              <td style={{ padding: "8px 12px" }}>
                                <span className="badge" style={{ background: "var(--bg-surface)" }}>{pt.tipo}</span>
                              </td>
                              <td style={{ padding: "8px 12px", fontWeight: "bold" }}>{pt.nivel_requerido}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
