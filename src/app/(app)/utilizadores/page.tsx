"use client";
import { PageHeader } from "@/components/layout/Sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Shield, CheckCircle, X, Plus, Search, UserPlus, Power, Edit2, Trash2, Save } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";

export default function UtilizadoresPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data: currentUser } = useAuth();
  const isAdmin = currentUser?.papel === "admin";

  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [modalEditar, setModalEditar] = useState<any>(null);
  const [editForm, setEditForm] = useState({ nome: "", email: "", papel: "instrutor" });

  // Estados do formulário de criação
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [papel, setPapel] = useState("instrutor");

  // Query para obter os utilizadores
  const { data: utilizadores, isLoading } = useQuery({
    queryKey: ["utilizadores"],
    queryFn: async () => {
      const res = await api.get("/utilizadores");
      return res.data.data;
    }
  });

  // Mutation para criar utilizador
  const criarUtilizador = useMutation({
    mutationFn: async (novoUser: any) => {
      const res = await api.post("/utilizadores", novoUser);
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["utilizadores"] });
      toast.sucesso(`Utilizador ${data.nome} criado com sucesso!`);
      fecharModal();
    },
    onError: (err: any) => {
      toast.erro(err.response?.data?.erro || "Erro ao criar utilizador.");
    }
  });

  // Mutation para atualizar utilizador (papel ou activo)
  const actualizarUtilizador = useMutation({
    mutationFn: async ({ id, dados }: { id: string; dados: any }) => {
      const res = await api.patch(`/utilizadores/${id}`, dados);
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["utilizadores"] });
      toast.sucesso(`Utilizador ${data.nome} atualizado com sucesso!`);
    },
    onError: (err: any) => {
      toast.erro(err.response?.data?.erro || "Erro ao atualizar utilizador.");
    }
  });

  // Mutation para eliminar utilizador
  const eliminarUtilizador = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/utilizadores/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilizadores"] });
      toast.sucesso("Utilizador eliminado.");
    },
    onError: (err: any) => toast.erro(err.response?.data?.erro || "Erro ao eliminar.")
  });

  const handleEliminar = (user: any) => {
    if (user.id === currentUser?.id) { toast.erro("Não pode eliminar a sua própria conta."); return; }
    if (!confirm(`Eliminar permanentemente o utilizador "${user.nome}"?`)) return;
    eliminarUtilizador.mutate(user.id);
  };

  const reporSenha = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/utilizadores/${id}/reset-senha`);
      return res.data;
    },
    onSuccess: () => {
      toast.sucesso("A senha foi reposta para 12345678 com sucesso!");
    },
    onError: (err: any) => toast.erro(err.response?.data?.erro || "Erro ao repor a senha.")
  });

  const handleResetSenha = (user: any) => {
    if (!confirm(`Tem a certeza que deseja repor a senha de "${user.nome}" para a padrão (12345678)?`)) return;
    reporSenha.mutate(user.id);
  };

  const abrirEditar = (user: any) => {
    setEditForm({ nome: user.nome, email: user.email, papel: user.papel });
    setModalEditar(user);
  };

  const guardarEdicao = () => {
    if (!modalEditar) return;
    actualizarUtilizador.mutate({ id: modalEditar.id, dados: editForm }, {
      onSuccess: () => setModalEditar(null)
    });
  };

  const handleSubmeter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email) {
      toast.erro("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    criarUtilizador.mutate({ nome, email, papel });
  };

  const fecharModal = () => {
    setNome("");
    setEmail("");
    setPapel("instrutor");
    setModalAberto(false);
  };

  const toggleStatus = (id: string, activo: number) => {
    if (!isAdmin) {
      toast.erro("Apenas administradores podem alterar o estado de utilizadores.");
      return;
    }
    if (id === currentUser?.id) {
      toast.erro("Não pode desativar a sua própria conta.");
      return;
    }
    const novoStatus = activo === 1 ? 0 : 1;
    actualizarUtilizador.mutate({ id, dados: { activo: novoStatus } });
  };

  const mudarPapel = (id: string, novoPapel: string) => {
    if (!isAdmin) {
      toast.erro("Apenas administradores podem alterar o papel de utilizadores.");
      return;
    }
    if (id === currentUser?.id) {
      toast.erro("Não pode alterar o papel da sua própria conta para evitar lockout.");
      return;
    }
    actualizarUtilizador.mutate({ id, dados: { papel: novoPapel } });
  };

  // Filtragem local
  const filtrados = utilizadores?.filter((u: any) => {
    const termo = busca.toLowerCase();
    return u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo);
  });

  return (
    <>
      <PageHeader
        title="Gestão de Utilizadores e RBAC"
        breadcrumb={[{ label: "Configurações" }, { label: "Utilizadores" }]}
      />

      <div className="page-body">
        {/* Info Banner */}
        <div style={{ marginBottom: "24px", padding: "16px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px", display: "flex", gap: "12px", alignItems: "center" }}>
          <Shield size={24} color="var(--accent)" />
          <div>
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>Controlo de Acesso Baseado em Funções (RBAC)</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              {isAdmin 
                ? "Como Administrador, pode criar utilizadores, aprovar contas pendentes e modificar perfis de acesso." 
                : "A sua conta atual tem privilégios de leitura. Apenas administradores podem realizar alterações nesta secção."}
            </p>
          </div>
        </div>

        {/* Search & Action Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 300px", maxWidth: "400px" }}>
            <Search size={16} color="var(--text-faint)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input 
              className="form-input" 
              style={{ width: "100%", paddingLeft: "36px" }} 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar utilizador por nome ou email..."
            />
          </div>

          {isAdmin && (
            <button 
              onClick={() => setModalAberto(true)} 
              className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <UserPlus size={16} /> Adicionar Utilizador
            </button>
          )}
        </div>

        {/* Table/Card Listing */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {isLoading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              <div className="skeleton" style={{ height: "40px", width: "100%", marginBottom: "12px" }} />
              <div className="skeleton" style={{ height: "40px", width: "100%", marginBottom: "12px" }} />
              A carregar utilizadores...
            </div>
          ) : !filtrados?.length ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-faint)" }}>
              Nenhum utilizador encontrado com os filtros atuais.
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: "none" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                  <tr>
                    <th style={{ padding: "12px 24px", color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "left" }}>Nome</th>
                    <th style={{ padding: "12px 24px", color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "left" }}>Email</th>
                    <th style={{ padding: "12px 24px", color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "left" }}>Papel (RBAC)</th>
                    <th style={{ padding: "12px 24px", color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "left" }}>Estado</th>
                    {isAdmin && <th style={{ padding: "12px 24px", color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "right" }}>Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((user: any) => {
                    const isSelf = user.id === currentUser?.id;
                    return (
                      <tr key={user.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }} onMouseOver={e => e.currentTarget.style.background = "var(--bg-elevated)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ fontWeight: 600, padding: "16px 24px", fontSize: "13px", color: "var(--text)" }}>
                          {user.nome} {isSelf && <span style={{ fontSize: "11px", fontWeight: "normal", color: "var(--accent)", background: "rgba(30, 64, 175, 0.1)", padding: "2px 6px", borderRadius: "99px", marginLeft: "6px" }}>Você</span>}
                        </td>
                        <td style={{ padding: "16px 24px", fontSize: "13px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{user.email}</td>
                        <td style={{ padding: "16px 24px" }}>
                          {isAdmin && !isSelf ? (
                            <select 
                              value={user.papel}
                              onChange={(e) => mudarPapel(user.id, e.target.value)}
                              className="form-select"
                              style={{ padding: "4px 8px", fontSize: "12px", borderRadius: "4px", minWidth: "130px" }}
                            >
                              <option value="admin">Administrador</option>
                              <option value="instrutor">Instrutor</option>
                              <option value="viajante">Viajante</option>
                              <option value="secretaria">Secretária</option>
                            </select>
                          ) : (
                            <span style={{ fontSize: "13px", textTransform: "capitalize", color: "var(--text)" }}>
                              {user.papel === "admin" ? "Administrador" : user.papel === "instrutor" ? "Instrutor" : user.papel === "viajante" ? "Viajante" : "Secretária"}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <span className="badge" style={{ backgroundColor: user.activo === 1 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: user.activo === 1 ? "var(--success)" : "var(--danger)" }}>
                            {user.activo === 1 ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        {isAdmin && (
                          <td style={{ padding: "16px 24px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                              {/* Editar */}
                              <button
                                className="btn btn-ghost btn-icon"
                                title="Editar"
                                style={{ width: 30, height: 30, color: "var(--accent)" }}
                                onClick={() => abrirEditar(user)}
                              >
                                <Edit2 size={14} />
                              </button>
                              {/* Repor Senha */}
                              <button
                                className="btn btn-ghost btn-icon"
                                title="Repor Senha (12345678)"
                                style={{ width: 30, height: 30, color: "var(--warning)" }}
                                onClick={() => handleResetSenha(user)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
                              </button>
                              {/* Ativar/Desativar */}
                              {!isSelf && (
                                <button
                                  onClick={() => toggleStatus(user.id, user.activo)}
                                  className="btn btn-ghost btn-icon"
                                  title={user.activo === 1 ? "Desativar" : "Ativar"}
                                  style={{ width: 30, height: 30, color: user.activo === 1 ? "var(--danger)" : "var(--success)" }}
                                >
                                  <Power size={14} />
                                </button>
                              )}
                              {/* Eliminar */}
                              {!isSelf && (
                                <button
                                  className="btn btn-ghost btn-icon"
                                  title="Eliminar"
                                  style={{ width: 30, height: 30, color: "var(--danger)" }}
                                  onClick={() => handleEliminar(user)}
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Editar Utilizador */}
      {modalEditar && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalEditar(null)}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <span className="modal-title"><Edit2 size={16} style={{ display: "inline", marginRight: 8 }} />Editar Utilizador</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setModalEditar(null)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input className="form-input" value={editForm.nome} onChange={e => setEditForm(f => ({ ...f, nome: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Papel (RBAC)</label>
                <select className="form-select" value={editForm.papel} onChange={e => setEditForm(f => ({ ...f, papel: e.target.value }))}>
                  <option value="admin">Administrador</option>
                  <option value="instrutor">Instrutor</option>
                  <option value="viajante">Viajante</option>
                  <option value="secretaria">Secretária</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModalEditar(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardarEdicao} disabled={actualizarUtilizador.isPending}>
                <Save size={14} /> {actualizarUtilizador.isPending ? "A guardar..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar Utilizador */}
      {modalAberto && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
          padding: "20px"
        }}>
          <div className="card" style={{
            width: "100%",
            maxWidth: "480px",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            animation: "scaleIn 0.2s ease",
            position: "relative"
          }}>
            <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
              <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <UserPlus size={18} color="var(--accent)" />
                <span>Adicionar Utilizador</span>
              </h3>
              <button onClick={fecharModal} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmeter} style={{ padding: "20px 0 0" }}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>Nome Completo *</label>
                <input className="form-input" style={{ width: "100%" }} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="ex: Francisco Bernardo" required />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>Email Corporativo *</label>
                <input type="email" className="form-input" style={{ width: "100%" }} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ex: f.bernardo@jwpub.org" required />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "12px", background: "rgba(30, 64, 175, 0.05)", padding: "10px", borderRadius: "6px", color: "var(--text)", border: "1px solid rgba(30, 64, 175, 0.1)" }}>
                  <span style={{ fontWeight: 600 }}>Nota:</span> A palavra-passe padrão para novos utilizadores é <strong>12345678</strong>. O utilizador será obrigado a alterá-la no primeiro acesso.
                </div>
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>Papel de Acesso (RBAC) *</label>
                <select className="form-select" style={{ width: "100%" }} value={papel} onChange={(e) => setPapel(e.target.value)}>
                  <option value="admin">Administrador (Gestão Total)</option>
                  <option value="instrutor">Instrutor (Gestão de Aulas)</option>
                  <option value="viajante">Viajante (Leitura e Avaliação)</option>
                  <option value="secretaria">Secretária (Apenas Leitura)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--border)", paddingTop: "16px", marginTop: "8px" }}>
                <button type="button" onClick={fecharModal} className="btn btn-ghost">Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={criarUtilizador.isPending}>
                  {criarUtilizador.isPending ? "A criar..." : "Criar Utilizador"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}} />
    </>
  );
}
