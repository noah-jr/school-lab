"use client";
import { PageHeader } from "@/components/layout/Sidebar";
import { useTurmas } from "@/hooks/useTurmas";
import Link from "next/link";
import { useState } from "react";
import { Plus, Search, BookOpen, Edit2, Trash2, UserCog, X, Save } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

// ─── Modal de Instrutores ────────────────────────────────────────────────────
function ModalInstrutores({ turma, onClose }: { turma: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [instrutorA, setInstrutorA] = useState(turma.instrutor_a_nome || "");
  const [instrutorB, setInstrutorB] = useState(turma.instrutor_b_nome || "");

  const mutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/turmas/${turma.id}`, {
        instrutor_a_nome: instrutorA,
        instrutor_b_nome: instrutorB,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["turmas"] });
      onClose();
    },
    onError: () => alert("Erro ao guardar instrutores."),
  });

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <span className="modal-title">
            <UserCog size={16} style={{ display: "inline", marginRight: 8 }} />
            Instrutores — {turma.nome}
          </span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Instrutor Principal (A)</label>
            <input
              className="form-input"
              value={instrutorA}
              onChange={e => setInstrutorA(e.target.value)}
              placeholder="Nome completo do instrutor principal"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Instrutor Auxiliar (B)</label>
            <input
              className="form-input"
              value={instrutorB}
              onChange={e => setInstrutorB(e.target.value)}
              placeholder="Nome completo do instrutor auxiliar (opcional)"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button
            className="btn btn-primary"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            <Save size={14} /> {mutation.isPending ? "A guardar..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de Edição ─────────────────────────────────────────────────────────
function ModalEditar({ turma, onClose }: { turma: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    nome: turma.nome || "",
    local_nome: turma.local_nome || "",
    local_cidade: turma.local_cidade || "",
    data_inicio: turma.data_inicio?.slice(0, 10) || "",
    data_fim: turma.data_fim?.slice(0, 10) || "",
    status: turma.status || "rascunho",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/turmas/${turma.id}`, form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["turmas"] });
      onClose();
    },
    onError: () => alert("Erro ao editar turma."),
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <span className="modal-title"><Edit2 size={16} style={{ display: "inline", marginRight: 8 }} />Editar Turma</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Nome da Turma *</label>
            <input className="form-input" value={form.nome} onChange={set("nome")} required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Local</label>
              <input className="form-input" value={form.local_nome} onChange={set("local_nome")} placeholder="Ex: Salão do Reino" />
            </div>
            <div className="form-group">
              <label className="form-label">Cidade</label>
              <input className="form-input" value={form.local_cidade} onChange={set("local_cidade")} placeholder="Ex: Luanda" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Data de Início</label>
              <input type="date" className="form-input" value={form.data_inicio} onChange={set("data_inicio")} />
            </div>
            <div className="form-group">
              <label className="form-label">Data de Fim</label>
              <input type="date" className="form-input" value={form.data_fim} onChange={set("data_fim")} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select className="form-select" value={form.status} onChange={set("status")}>
              <option value="rascunho">Rascunho</option>
              <option value="activa">Activa</option>
              <option value="concluida">Concluída</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            <Save size={14} /> {mutation.isPending ? "A guardar..." : "Guardar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Página Principal ────────────────────────────────────────────────────────
export default function TurmasPage() {
  const { data: user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const temAcessoCompleto = user?.papel === "admin" || user?.papel === "instrutor";

  const [statusFiltro, setStatusFiltro] = useState("");
  const [busca, setBusca] = useState("");
  const [modalInstrutores, setModalInstrutores] = useState<any>(null);
  const [modalEditar, setModalEditar] = useState<any>(null);

  const { data, isLoading } = useTurmas({ status: statusFiltro || undefined });

  const turmasFiltradas = data?.data?.filter((t) =>
    busca ? t.nome.toLowerCase().includes(busca.toLowerCase()) : true
  ) ?? [];

  const eliminarMutacao = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/turmas/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["turmas"] }),
    onError: () => alert("Erro ao eliminar turma."),
  });

  const handleEliminar = (t: any) => {
    if (!confirm(`Tem a certeza que deseja eliminar a turma "${t.nome}"?\n\nEsta ação não pode ser desfeita.`)) return;
    eliminarMutacao.mutate(t.id);
  };

  return (
    <>
      <PageHeader
        title="Turmas"
        breadcrumb={[{ label: "Turmas" }]}
        actions={
          temAcessoCompleto ? (
            <Link href="/turmas/nova" className="btn btn-primary">
              <Plus size={14} /> Nova Turma
            </Link>
          ) : undefined
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
              {temAcessoCompleto && (
                <Link href="/turmas/nova" className="btn btn-primary btn-sm">
                  <Plus size={12} /> Nova Turma
                </Link>
              )}
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
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Instrutores</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Alunos</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Status</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "center" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {turmasFiltradas.map((t) => (
                    <tr key={t.id}
                      style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }}
                      onMouseOver={e => e.currentTarget.style.background = "var(--bg-elevated)"}
                      onMouseOut={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td className="font-mono text-muted" style={{ padding: "12px 24px", fontSize: "13px" }}>{t.numero_turma}ª</td>
                      <td style={{ fontWeight: 600 }}>
                        <Link href={`/turmas/${t.id}`} style={{ color: "var(--text)", fontSize: "13px" }}>{t.nome}</Link>
                      </td>
                      <td className="text-muted" style={{ fontSize: "13px" }}>{t.local_nome}{t.local_cidade ? `, ${t.local_cidade}` : ""}</td>
                      <td className="text-muted font-mono" style={{ fontSize: "12px" }}>
                        {new Date(t.data_inicio).toLocaleDateString("pt-AO")} →{" "}
                        {new Date(t.data_fim).toLocaleDateString("pt-AO")}
                      </td>
                      <td style={{ fontSize: 12 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          {(t as any).instrutor_a_nome ? (
                            <span style={{ color: "var(--text)" }}>{(t as any).instrutor_a_nome}</span>
                          ) : (
                            <span style={{ color: "var(--text-faint)", fontStyle: "italic" }}>Sem instrutor A</span>
                          )}
                          {(t as any).instrutor_b_nome && (
                            <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{(t as any).instrutor_b_nome}</span>
                          )}
                        </div>
                      </td>
                      <td className="font-mono">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <span style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", border: "1px solid var(--border)" }}>
                            {t.total_estudantes ?? 0}
                          </span>
                          {(t.total_estudantes ?? 0) > 0 && (
                            <span style={{ fontSize: 11, color: "var(--text-faint)" }}>
                              {t.total_avaliados ?? 0} av.
                            </span>
                          )}
                        </span>
                      </td>
                      <td><span className={`badge badge-${t.status}`} style={{ fontSize: "11px", fontWeight: 600, borderRadius: "4px" }}>{t.status}</span></td>

                      <td style={{ textAlign: "center", padding: "8px 16px" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center" }}>
                          {temAcessoCompleto && (
                            <>
                              {/* Gerir Instrutores */}
                              <button
                                title="Gerir Instrutores"
                                className="btn btn-ghost btn-icon"
                                style={{ width: 30, height: 30, color: "var(--info)" }}
                                onClick={() => setModalInstrutores(t)}
                              >
                                <UserCog size={14} />
                              </button>
                              {/* Editar */}
                              <button
                                title="Editar Turma"
                                className="btn btn-ghost btn-icon"
                                style={{ width: 30, height: 30, color: "var(--accent)" }}
                                onClick={() => setModalEditar(t)}
                              >
                                <Edit2 size={14} />
                              </button>
                              {/* Eliminar */}
                              <button
                                title="Eliminar Turma"
                                className="btn btn-ghost btn-icon"
                                style={{ width: 30, height: 30, color: "var(--danger)" }}
                                onClick={() => handleEliminar(t)}
                                disabled={eliminarMutacao.isPending}
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                          {/* Abrir */}
                          <Link href={`/turmas/${t.id}`} className="btn btn-ghost btn-sm" style={{ fontSize: "12px", padding: "4px 10px" }}>
                            Abrir →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      {modalInstrutores && (
        <ModalInstrutores turma={modalInstrutores} onClose={() => setModalInstrutores(null)} />
      )}
      {modalEditar && (
        <ModalEditar turma={modalEditar} onClose={() => setModalEditar(null)} />
      )}
    </>
  );
}
