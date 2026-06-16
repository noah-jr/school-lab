"use client";
import { PageHeader } from "@/components/layout/Sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { BookOpen, Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const DIAS: Record<string, string> = {
  segunda: "Segunda-feira", terca: "Terça-feira", quarta: "Quarta-feira",
  quinta: "Quinta-feira", sexta: "Sexta-feira",
};

function ModalEditarPrograma({ programa, onClose }: { programa: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ nome: programa.nome || "", descricao: programa.descricao || "" });

  const mutation = useMutation({
    mutationFn: async () => { await api.patch(`/programas/${programa.id}`, form); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["programas"] }); onClose(); },
    onError: () => alert("Erro ao guardar programa."),
  });

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <span className="modal-title"><Edit2 size={16} style={{ display: "inline", marginRight: 8 }} />Editar Programa</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Nome do Programa *</label>
            <input className="form-input" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Descrição</label>
            <input className="form-input" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            <Save size={14} /> {mutation.isPending ? "A guardar..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalNovoPrograma({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ nome: "", descricao: "" });

  const mutation = useMutation({
    mutationFn: async () => { await api.post("/programas", form); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["programas"] }); onClose(); },
    onError: () => alert("Erro ao criar programa."),
  });

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <span className="modal-title"><Plus size={16} style={{ display: "inline", marginRight: 8 }} />Novo Programa</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Nome *</label>
            <input className="form-input" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Programa EAC 2026" />
          </div>
          <div className="form-group">
            <label className="form-label">Descrição</label>
            <input className="form-input" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            <Plus size={14} /> {mutation.isPending ? "A criar..." : "Criar Programa"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProgramasPage() {
  const { data: user } = useAuth();
  const isAdmin = user?.papel === "admin";
  const queryClient = useQueryClient();

  const [expandido, setExpandido] = useState<string | null>(null);
  const [modalEditar, setModalEditar] = useState<any>(null);
  const [modalNovo, setModalNovo] = useState(false);

  const { data: programas, isLoading } = useQuery({
    queryKey: ["programas"],
    queryFn: async () => (await api.get("/programas")).data.data
  });

  const { data: partes, isLoading: carregandoPartes } = useQuery({
    queryKey: ["programas", expandido, "partes"],
    queryFn: async () => {
      if (!expandido) return [];
      return (await api.get(`/programas?programa_id=${expandido}`)).data.data;
    },
    enabled: !!expandido
  });

  const eliminarMutacao = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/programas/${id}`); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programas"] }),
    onError: () => alert("Erro ao eliminar programa."),
  });

  const handleEliminar = (p: any) => {
    if (!confirm(`Eliminar o programa "${p.nome}"?\n\nAtenção: todas as partes associadas serão também eliminadas.`)) return;
    eliminarMutacao.mutate(p.id);
  };

  return (
    <>
      <PageHeader
        title="Programas Escolares"
        breadcrumb={[{ label: "Programas" }]}
        actions={
          isAdmin ? (
            <button className="btn btn-primary" onClick={() => setModalNovo(true)}>
              <Plus size={14} /> Novo Programa
            </button>
          ) : undefined
        }
      />
      <div className="page-body">
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}
          </div>
        ) : !programas?.length ? (
          <div className="empty-state">
            <BookOpen size={32} style={{ opacity: 0.3 }} />
            <p className="empty-title">Nenhum programa registado</p>
            {isAdmin && <button className="btn btn-primary btn-sm" onClick={() => setModalNovo(true)}><Plus size={12} /> Criar Programa</button>}
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {programas.map((p: any) => (
              <div key={p.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                {/* Cabeçalho do Programa */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 24px" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--accent-faint)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flexShrink: 0 }}>
                    <BookOpen size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{p.nome}</h3>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.descricao || "Sem descrição"}</p>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {isAdmin && (
                      <>
                        <button
                          className="btn btn-ghost btn-icon"
                          title="Editar"
                          style={{ width: 32, height: 32, color: "var(--accent)" }}
                          onClick={() => setModalEditar(p)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon"
                          title="Eliminar"
                          style={{ width: 32, height: 32, color: "var(--danger)" }}
                          onClick={() => handleEliminar(p)}
                          disabled={eliminarMutacao.isPending}
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setExpandido(expandido === p.id ? null : p.id)}
                    >
                      {expandido === p.id ? <><ChevronUp size={14} /> Esconder</> : <><ChevronDown size={14} /> Ver Estrutura</>}
                    </button>
                  </div>
                </div>

                {/* Partes do Programa */}
                {expandido === p.id && (
                  <div style={{ borderTop: "1px solid var(--border)" }}>
                    {carregandoPartes ? (
                      <div style={{ padding: 24 }}>A carregar partes...</div>
                    ) : (
                      <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                        <table style={{ fontSize: 13 }}>
                          <thead>
                            <tr>
                              <th style={{ width: 40 }}>#</th>
                              <th>Dia</th>
                              <th>Hora</th>
                              <th>Título</th>
                              <th>Tipo</th>
                              <th>Nível Req.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {partes?.map((pt: any) => (
                              <tr key={pt.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                <td style={{ fontWeight: 700, color: "var(--text-muted)" }}>{pt.numero}</td>
                                <td style={{ textTransform: "capitalize" }}>{DIAS[pt.dia_semana] || pt.dia_semana}</td>
                                <td className="font-mono">{pt.hora_inicio} <span style={{ color: "var(--text-faint)", fontSize: 11 }}>({pt.duracao_minutos}m)</span></td>
                                <td style={{ fontWeight: 500 }}>{pt.titulo}</td>
                                <td><span className="badge" style={{ background: "var(--bg-surface)", fontSize: 11 }}>{pt.tipo}</span></td>
                                <td style={{ fontWeight: 700, color: "var(--accent)" }}>{pt.nivel_requerido}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {modalEditar && <ModalEditarPrograma programa={modalEditar} onClose={() => setModalEditar(null)} />}
      {modalNovo && <ModalNovoPrograma onClose={() => setModalNovo(false)} />}
    </>
  );
}
