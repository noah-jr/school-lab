"use client";
import { PageHeader } from "@/components/layout/Sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Estudante } from "@/lib/types";
import { useState } from "react";
import { Search, Users, Plus, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function EstudantesPage() {
  const { data: user } = useAuth();
  const temAcessoCompleto = user?.papel === "admin" || user?.papel === "instrutor";
  const queryClient = useQueryClient();
  
  const [busca, setBusca] = useState("");
  const [filtroCongregacao, setFiltroCongregacao] = useState("todas");
  const [filtroPapel, setFiltroPapel] = useState("todos");
  const [filtroTurma, setFiltroTurma] = useState("todas");
  const [pagina, setPagina] = useState(1);
  
  const [modalAberto, setModalAberto] = useState(false);

  const { data: congsReq } = useQuery({
    queryKey: ["congregacoes"],
    queryFn: async () => {
      const res = await api.get("/congregacoes");
      return res.data.data;
    }
  });

  const { data: turmasReq } = useQuery({
    queryKey: ["turmas_filter"],
    queryFn: async () => {
      const res = await api.get("/turmas?por_pagina=1000");
      return res.data.data;
    }
  });

  const { data, isLoading } = useQuery({
    queryKey: ["estudantes", busca, filtroCongregacao, filtroPapel, filtroTurma, pagina],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (busca) params.set("nome", busca);
      if (filtroCongregacao !== "todas") params.set("congregacao_id", filtroCongregacao);
      if (filtroPapel !== "todos") params.set("papel_ministerial", filtroPapel);
      if (filtroTurma !== "todas") params.set("turma_id", filtroTurma);
      params.set("pagina", pagina.toString());
      params.set("por_pagina", "15"); // Paginação definida para 15 estudantes por ecrã
      const { data } = await api.get(`/estudantes?${params}`);
      return data as { data: Estudante[]; total: number; totalPaginas: number; stats: Record<string, number> };
    },
    staleTime: 30_000,
  });

  const [novoEstudante, setNovoEstudante] = useState({
    nome: "", email_jwpub: "", telefone_principal: "", papel_ministerial: "anciao", fotografia: "",
  });
  const [salvando, setSalvando] = useState(false);

  const eliminarMutacao = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/estudantes/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["estudantes"] }),
    onError: (err: any) => alert(err.response?.data?.erro || "Erro ao eliminar estudante.")
  });

  const handleEliminar = (est: any) => {
    if (!confirm(`Eliminar permanentemente "${est.nome}"?\n\nEsta ação não pode ser desfeita.`)) return;
    eliminarMutacao.mutate(est.id);
  };

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.post("/estudantes", novoEstudante);
      queryClient.invalidateQueries({ queryKey: ["estudantes"] });
      setModalAberto(false);
      setNovoEstudante({ nome: "", email_jwpub: "", telefone_principal: "", papel_ministerial: "anciao", fotografia: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setSalvando(false);
    }
  };

  // Inteligência para corrigir o formato da filial automaticamente: "Apelido, Nome" -> "Nome Apelido"
  const handleCorrecaoNome = () => {
    const nomeSujo = novoEstudante.nome;
    if (nomeSujo.includes(",")) {
      const partes = nomeSujo.split(",");
      if (partes.length >= 2) {
        const apelido = partes[0].trim();
        const nomeProprio = partes.slice(1).join(" ").trim();
        setNovoEstudante({ ...novoEstudante, nome: `${nomeProprio} ${apelido}` });
      }
    }
  };

  // Eliminado: exportarCSV (política PDF-only)

  return (
    <>
      <PageHeader
        title="Estudantes"
        breadcrumb={[{ label: "Estudantes" }]}
        actions={
          <div style={{ display: "flex", gap: "12px" }}>
            {temAcessoCompleto && (
              <>
                <Link href="/estudantes/importar" className="btn btn-ghost" style={{ border: "1px dashed var(--border)" }}>
                  Importar de Betel
                </Link>
                <button className="btn btn-primary" onClick={() => setModalAberto(true)}>
                  <Plus size={14} /> Novo Estudante
                </button>
              </>
            )}
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

        {/* Barra de Filtros */}
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius)", padding: "16px 20px", marginBottom: "24px",
          display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "center"
        }}>
          <div style={{ flex: "1 1 250px", display: "flex", alignItems: "center", gap: "12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "4px", padding: "0 12px" }}>
            <Search size={16} className="text-muted" />
            <input
              style={{ flex: 1, background: "none", border: "none", outline: "none", padding: "10px 0", fontSize: 13, color: "var(--text)" }}
              placeholder="Pesquisar por nome..."
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <label style={{ fontSize: "12px", color: "var(--text-faint)", fontWeight: 600, textTransform: "uppercase" }}>Papel</label>
              <select 
                value={filtroPapel}
                onChange={e => { setFiltroPapel(e.target.value); setPagina(1); }}
                style={{ padding: "8px 12px", fontSize: "13px", borderRadius: "4px", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text)", outline: "none", cursor: "pointer" }}
              >
                <option value="todos">Todos os Papéis</option>
                <option value="anciao">Ancião</option>
                <option value="servo_ministerial">Servo Ministerial</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <label style={{ fontSize: "12px", color: "var(--text-faint)", fontWeight: 600, textTransform: "uppercase" }}>Congregação</label>
              <select 
                value={filtroCongregacao}
                onChange={e => { setFiltroCongregacao(e.target.value); setPagina(1); }}
                style={{ padding: "8px 12px", fontSize: "13px", borderRadius: "4px", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text)", outline: "none", cursor: "pointer", maxWidth: "200px" }}
              >
                <option value="todas">Todas as Congregações</option>
                {congsReq?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.nome} / {c.circuito_codigo}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <label style={{ fontSize: "12px", color: "var(--text-faint)", fontWeight: 600, textTransform: "uppercase" }}>Turma</label>
              <select 
                value={filtroTurma}
                onChange={e => { setFiltroTurma(e.target.value); setPagina(1); }}
                style={{ padding: "8px 12px", fontSize: "13px", borderRadius: "4px", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text)", outline: "none", cursor: "pointer", maxWidth: "200px" }}
              >
                <option value="todas">Todas as Turmas</option>
                {turmasReq?.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.numero_turma}ª - {t.nome}</option>
                ))}
              </select>
            </div>
          </div>
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
                    {temAcessoCompleto && <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "center" }}>Ações</th>}
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
                      {temAcessoCompleto && (
                        <td style={{ textAlign: "center", padding: "8px 16px" }}>
                          <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                            <Link href={`/estudantes/${est.id}`} className="btn btn-ghost btn-icon" title="Ver Perfil" style={{ width: 28, height: 28, color: "var(--accent)" }}>
                              <Edit2 size={13} />
                            </Link>
                            <button
                              className="btn btn-ghost btn-icon"
                              title="Eliminar"
                              style={{ width: 28, height: 28, color: "var(--danger)" }}
                              onClick={() => handleEliminar(est)}
                              disabled={eliminarMutacao.isPending}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Paginação */}
              {data && data.totalPaginas > 1 && (
                <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-elevated)" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>
                    A mostrar página <span style={{ fontWeight: 600, color: "var(--text)" }}>{pagina}</span> de {data.totalPaginas} 
                    <span style={{ margin: "0 8px", color: "var(--border)" }}>|</span> 
                    Total: <span style={{ fontWeight: 600, color: "var(--text)" }}>{data.total}</span> estudantes
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      className="btn btn-ghost" 
                      style={{ padding: "6px 12px", border: "1px solid var(--border)", opacity: pagina === 1 ? 0.5 : 1, cursor: pagina === 1 ? "not-allowed" : "pointer" }}
                      disabled={pagina === 1} 
                      onClick={() => setPagina(p => Math.max(1, p - 1))}
                    >
                      Anterior
                    </button>
                    <button 
                      className="btn btn-ghost" 
                      style={{ padding: "6px 12px", border: "1px solid var(--border)", opacity: pagina === data.totalPaginas ? 0.5 : 1, cursor: pagina === data.totalPaginas ? "not-allowed" : "pointer" }}
                      disabled={pagina === data.totalPaginas} 
                      onClick={() => setPagina(p => Math.min(data.totalPaginas, p + 1))}
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              )}
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
                  <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Nome Completo *</span>
                    <span style={{ fontSize: "10px", color: "var(--info)", fontWeight: "normal" }}>Inversão automática de vírgula ativada</span>
                  </label>
                  <input 
                    className="form-input" 
                    required 
                    placeholder="Pode colar: Apelido, Nome Próprio"
                    value={novoEstudante.nome} 
                    onChange={(e) => setNovoEstudante({ ...novoEstudante, nome: e.target.value })}
                    onBlur={handleCorrecaoNome}
                  />
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
                <div className="form-group">
                  <label className="form-label">Fotografia (Opcional)</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="form-input" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNovoEstudante({ ...novoEstudante, fotografia: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                  {novoEstudante.fotografia && <img src={novoEstudante.fotografia} alt="Preview" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: '50%', marginTop: 8 }} />}
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
