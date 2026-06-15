"use client";
import { PageHeader } from "@/components/layout/Sidebar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Estudante } from "@/lib/types";
import { useState } from "react";
import { Search, Users, Plus } from "lucide-react";
import Link from "next/link";

export default function EstudantesPage() {
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["estudantes", busca],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (busca) params.set("nome", busca);
      const { data } = await api.get(`/estudantes?${params}`);
      return data as { data: Estudante[]; total: number; stats: Record<string, number> };
    },
    staleTime: 30_000,
  });

  const [novoEstudante, setNovoEstudante] = useState({
    nome: "", email_jwpub: "", telefone_principal: "", papel_ministerial: "anciao",
  });
  const [salvando, setSalvando] = useState(false);

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.post("/estudantes", novoEstudante);
      queryClient.invalidateQueries({ queryKey: ["estudantes"] });
      setModalAberto(false);
      setNovoEstudante({ nome: "", email_jwpub: "", telefone_principal: "", papel_ministerial: "anciao" });
    } catch (err) {
      console.error(err);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Estudantes"
        breadcrumb={[{ label: "Estudantes" }]}
        actions={
          <div style={{ display: "flex", gap: "12px" }}>
            <Link href="/estudantes/importar" className="btn btn-ghost" style={{ border: "1px dashed var(--border)" }}>
              Importar de Betel
            </Link>
            <button className="btn btn-primary" onClick={() => setModalAberto(true)}>
              <Plus size={14} /> Novo Estudante
            </button>
          </div>
        }
      />

      <div className="page-body">
        {/* Stats */}
        {data?.stats && (
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <span className="stat-label">Total Estudantes</span>
              <span className="stat-value">{data.stats.total}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Turmas Participadas</span>
              <span className="stat-value">{data.stats.totalTurmas}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Média de Idade</span>
              <span className="stat-value">{data.stats.mediaIdade || "—"}</span>
              <span className="stat-sub">anos</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Média de Batismo</span>
              <span className="stat-value">{data.stats.mediaBatismo || "—"}</span>
              <span className="stat-sub">anos</span>
            </div>
          </div>
        )}

        {/* Busca */}
        <div className="flex items-center gap-2 mb-6" style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius)", padding: "0 12px", maxWidth: 360,
        }}>
          <Search size={14} className="text-muted" />
          <input
            style={{ flex: 1, background: "none", border: "none", outline: "none", padding: "9px 0", fontSize: 13, color: "var(--text)" }}
            placeholder="Pesquisar por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {/* Tabela */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {isLoading ? (
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 8 }}>
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 44 }} />)}
            </div>
          ) : !data?.data?.length ? (
            <div className="empty-state">
              <div className="empty-icon"><Users /></div>
              <p className="empty-title">Nenhum estudante encontrado</p>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: "none" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                  <tr>
                    <th style={{ padding: "12px 24px", color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Nome</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Congregação</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Circuito</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Email JW</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Telefone</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Papel</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((est) => (
                    <tr key={est.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }} onMouseOver={e => e.currentTarget.style.background = "var(--bg-elevated)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ fontWeight: 600, padding: "12px 24px" }}>
                        <Link href={`/estudantes/${est.id}`} style={{ color: "var(--text)", fontSize: "13px" }}>
                          {est.nome}
                        </Link>
                      </td>
                      <td className="text-muted text-sm" style={{ fontSize: "13px" }}>{(est as Record<string, unknown>).congregacao_nome as string ?? "—"}</td>
                      <td className="font-mono text-muted" style={{ fontSize: "13px" }}>{(est as Record<string, unknown>).circuito_codigo as string ?? "—"}</td>
                      <td className="text-muted font-mono" style={{ fontSize: "12px" }}>{est.email_jwpub ?? "—"}</td>
                      <td className="font-mono" style={{ fontSize: "13px" }}>{est.telefone_principal ?? "—"}</td>
                      <td>
                        <span className={`badge ${est.papel_ministerial === "anciao" ? "badge-activa" : "badge-concluida"}`} style={{ fontSize: "11px", fontWeight: 600, borderRadius: "4px" }}>
                          {est.papel_ministerial === "anciao" ? "Ancião" : "Servo Min."}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalAberto && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalAberto(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Novo Estudante</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setModalAberto(false)}>✕</button>
            </div>
            <form onSubmit={handleCriar}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nome Completo *</label>
                  <input className="form-input" required value={novoEstudante.nome} onChange={(e) => setNovoEstudante({ ...novoEstudante, nome: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email JW</label>
                  <input type="email" className="form-input" placeholder="exemplo@jwpub.org" value={novoEstudante.email_jwpub} onChange={(e) => setNovoEstudante({ ...novoEstudante, email_jwpub: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefone</label>
                  <input className="form-input" value={novoEstudante.telefone_principal} onChange={(e) => setNovoEstudante({ ...novoEstudante, telefone_principal: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Papel</label>
                  <select className="form-select" value={novoEstudante.papel_ministerial} onChange={(e) => setNovoEstudante({ ...novoEstudante, papel_ministerial: e.target.value })}>
                    <option value="anciao">Ancião</option>
                    <option value="servo_ministerial">Servo Ministerial</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalAberto(false)}>Cancelar</button>
                <button type="submit" className={`btn btn-primary ${salvando ? "btn-loading" : ""}`} disabled={salvando}>
                  {salvando ? "A salvar..." : "Guardar Estudante"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
