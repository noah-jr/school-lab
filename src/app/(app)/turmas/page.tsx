"use client";
import { PageHeader } from "@/components/layout/Sidebar";
import { useTurmas } from "@/hooks/useTurmas";
import Link from "next/link";
import { useState } from "react";
import { Plus, Search, BookOpen } from "lucide-react";

export default function TurmasPage() {
  const [statusFiltro, setStatusFiltro] = useState("");
  const [busca, setBusca] = useState("");

  const { data, isLoading } = useTurmas({ status: statusFiltro || undefined });

  const turmasFiltradas = data?.data?.filter((t) =>
    busca ? t.nome.toLowerCase().includes(busca.toLowerCase()) : true
  ) ?? [];

  return (
    <>
      <PageHeader
        title="Turmas"
        breadcrumb={[{ label: "Turmas" }]}
        actions={
          <Link href="/turmas/nova" className="btn btn-primary">
            <Plus size={14} /> Nova Turma
          </Link>
        }
      />

      <div className="page-body">
        {/* Filtros */}
        <div className="flex gap-3 mb-6">
          <div className="flex items-center gap-2" style={{
            flex: 1, background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius)", padding: "0 12px", maxWidth: 300,
          }}>
            <Search size={14} className="text-muted" />
            <input
              style={{ flex: 1, background: "none", border: "none", outline: "none", padding: "9px 0", fontSize: 13, color: "var(--text)" }}
              placeholder="Buscar turmas..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <select className="form-select" style={{ width: "auto" }}
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="rascunho">Rascunho</option>
            <option value="activa">Activa</option>
            <option value="concluida">Concluída</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>

        {/* Tabela */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {isLoading ? (
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 8 }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 44 }} />)}
            </div>
          ) : !turmasFiltradas.length ? (
            <div className="empty-state">
              <div className="empty-icon"><BookOpen /></div>
              <p className="empty-title">Nenhuma turma encontrada</p>
              <p className="empty-desc">Crie a primeira turma ou ajuste os filtros de pesquisa.</p>
              <Link href="/turmas/nova" className="btn btn-primary btn-sm">
                <Plus size={12} /> Nova Turma
              </Link>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: "none" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                  <tr>
                    <th style={{ padding: "12px 24px", color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Nº</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Nome</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Local / Cidade</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Período</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Estudantes</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Avaliados</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {turmasFiltradas.map((t) => (
                    <tr key={t.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }} onMouseOver={e => e.currentTarget.style.background = "var(--bg-elevated)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                      <td className="font-mono text-muted" style={{ padding: "12px 24px", fontSize: "13px" }}>{t.numero_turma}ª</td>
                      <td style={{ fontWeight: 600 }}>
                        <Link href={`/turmas/${t.id}`} style={{ color: "var(--text)", fontSize: "13px" }}>{t.nome}</Link>
                      </td>
                      <td className="text-muted" style={{ fontSize: "13px" }}>{t.local_nome}{t.local_cidade ? `, ${t.local_cidade}` : ""}</td>
                      <td className="text-muted font-mono" style={{ fontSize: "12px" }}>
                        {new Date(t.data_inicio).toLocaleDateString("pt-AO")} →{" "}
                        {new Date(t.data_fim).toLocaleDateString("pt-AO")}
                      </td>
                      <td className="font-mono">
                        <span style={{ display: "inline-block", background: "var(--bg-elevated)", color: "var(--text-muted)", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", border: "1px solid var(--border)" }}>
                          {t.total_estudantes ?? 0}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className="font-mono" style={{ fontSize: "12px", color: "var(--text-muted)" }}>{t.total_avaliados ?? 0}/{t.total_estudantes ?? 0}</span>
                          {(t.total_estudantes ?? 0) > 0 && (
                            <div className="progress" style={{ width: 60, height: 4, background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                              <div className="progress-bar" style={{
                                background: "var(--accent)", height: "100%",
                                width: `${Math.round(((t.total_avaliados ?? 0) / (t.total_estudantes ?? 1)) * 100)}%`,
                              }} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td><span className={`badge badge-${t.status}`} style={{ fontSize: "11px", fontWeight: 600, borderRadius: "4px" }}>{t.status}</span></td>
                      <td style={{ textAlign: "right", paddingRight: "24px" }}>
                        <Link href={`/turmas/${t.id}`} className="btn btn-ghost btn-sm" style={{ fontSize: "12px" }}>
                          Abrir →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </>
  );
}
