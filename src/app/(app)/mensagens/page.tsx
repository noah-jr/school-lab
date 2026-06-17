"use client";
import { PageHeader } from "@/components/layout/Sidebar";
import { MessageSquare, Search, User, Trash2, Archive, Edit3, X, Save, Eye } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export default function MensagensPage() {
  const queryClient = useQueryClient();
  const [mensagemAtiva, setMensagemAtiva] = useState<number | null>(null);
  
  // Estados para edição
  const [isEditing, setIsEditing] = useState(false);
  const [editAssunto, setEditAssunto] = useState("");
  const [editConteudo, setEditConteudo] = useState("");

  // Filtros
  const [mostrarOcultas, setMostrarOcultas] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: mensagensReq, isLoading } = useQuery({
    queryKey: ["mensagens"],
    queryFn: async () => {
      const res = await api.get("/mensagens");
      return res.data.data;
    }
  });

  const lerMutacao = useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/mensagens/${id}`, {});
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mensagens"] })
  });

  const ocultarMutacao = useMutation({
    mutationFn: async ({ id, ocultar }: { id: number; ocultar: boolean }) => {
      await api.patch(`/mensagens/${id}`, { acao: ocultar ? "ocultar" : "mostrar" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mensagens"] });
      setIsEditing(false);
    }
  });

  const editarMutacao = useMutation({
    mutationFn: async ({ id, assunto, conteudo }: { id: number; assunto: string; conteudo: string }) => {
      await api.patch(`/mensagens/${id}`, { acao: "editar", assunto, conteudo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mensagens"] });
      setIsEditing(false);
    }
  });

  const eliminarMutacao = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/mensagens/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mensagens"] });
      setMensagemAtiva(null);
      setIsEditing(false);
    }
  });

  const mensagens = mensagensReq || [];

  // Filtro de mensagens
  const mensagensFiltradas = useMemo(() => {
    return mensagens.filter((msg: any) => {
      const matchesOculta = mostrarOcultas ? msg.ocultada === 1 : !msg.ocultada;
      
      const matchesSearch = searchQuery
        ? msg.remetente_nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msg.assunto?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msg.conteudo?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      return matchesOculta && matchesSearch;
    });
  }, [mensagens, mostrarOcultas, searchQuery]);

  const handleSelecionarMensagem = (msg: any) => {
    setMensagemAtiva(msg.id);
    setIsEditing(false);
    if (!msg.lida) lerMutacao.mutate(msg.id);
  };

  const msgDetalhe = mensagens.find((m: any) => m.id === mensagemAtiva);

  const startEditing = (msg: any) => {
    setEditAssunto(msg.assunto);
    setEditConteudo(msg.conteudo);
    setIsEditing(true);
  };

  const handleSalvarEdicao = () => {
    if (!mensagemAtiva || !editAssunto.trim() || !editConteudo.trim()) return;
    editarMutacao.mutate({
      id: mensagemAtiva,
      assunto: editAssunto,
      conteudo: editConteudo
    });
  };

  return (
    <>
      <PageHeader title="Mensagens Internas" breadcrumb={[{ label: "Comunicações" }, { label: "Mensagens" }]} />
      <div className="page-body">
        <div className={`card messaging-container ${mensagemAtiva !== null ? "has-active" : ""}`} style={{ padding: 0, overflow: "hidden", minHeight: "600px" }}>
          
          {/* Lista de Mensagens (Esquerda) */}
          <div className="messaging-sidebar" style={{ borderRight: "1px solid var(--border)", background: "var(--bg-surface)", display: "flex", flexDirection: "column" }}>
            
            {/* Barra de Pesquisa e Filtros */}
            <div style={{ padding: 16, borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center", background: "var(--bg-elevated)", borderRadius: 6, padding: "8px 12px", border: "1px solid var(--border)" }}>
                <Search size={14} color="var(--text-faint)" />
                <input 
                  type="text" 
                  placeholder="Procurar mensagens..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, marginLeft: 8, width: "100%", color: "var(--text)" }} 
                />
              </div>

              {/* Tabs / Toggles de Ocultadas */}
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setMostrarOcultas(false)}
                  style={{
                    flex: 1,
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    borderRadius: "4px",
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                    background: !mostrarOcultas ? "var(--bg-elevated)" : "transparent",
                    color: !mostrarOcultas ? "var(--text)" : "var(--text-muted)",
                    transition: "all 0.2s"
                  }}
                >
                  Recebidas
                </button>
                <button
                  onClick={() => setMostrarOcultas(true)}
                  style={{
                    flex: 1,
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    borderRadius: "4px",
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                    background: mostrarOcultas ? "var(--bg-elevated)" : "transparent",
                    color: mostrarOcultas ? "var(--text)" : "var(--text-muted)",
                    transition: "all 0.2s"
                  }}
                >
                  Ocultadas
                </button>
              </div>
            </div>

            {/* Listagem de Mensagens */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {isLoading && <div style={{ padding: 16, color: "var(--text-muted)", fontSize: "13px" }}>A carregar...</div>}
              {!isLoading && mensagensFiltradas.length === 0 && (
                <div style={{ padding: 32, textAlign: "center", color: "var(--text-faint)", fontSize: "13px" }}>
                  Nenhuma mensagem encontrada.
                </div>
              )}
              {mensagensFiltradas.map((msg: any) => (
                <div 
                  key={msg.id} 
                  onClick={() => handleSelecionarMensagem(msg)}
                  style={{ 
                    padding: "16px", borderBottom: "1px solid var(--border)", cursor: "pointer",
                    background: mensagemAtiva === msg.id ? "var(--bg-elevated)" : "transparent",
                    borderLeft: !msg.lida ? "3px solid var(--accent)" : "3px solid transparent",
                    transition: "background 0.2s"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: !msg.lida ? 700 : 600, fontSize: 14, color: "var(--text)" }}>{msg.remetente_nome}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(msg.criado_em).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: 13, color: !msg.lida ? "var(--text)" : "var(--text-muted)", fontWeight: !msg.lida ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {msg.assunto}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Área de Detalhe (Direita) */}
          {msgDetalhe ? (
            <div className="messaging-detail" style={{ display: "flex", flexDirection: "column", background: "var(--bg-surface)" }}>
              {isEditing ? (
                /* MODO DE EDIÇÃO */
                <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Editar Mensagem</h3>
                    <button onClick={() => setIsEditing(false)} className="btn btn-ghost btn-sm" style={{ padding: 4, cursor: "pointer" }}>
                      <X size={18} />
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>Assunto</label>
                    <input
                      type="text"
                      value={editAssunto}
                      onChange={e => setEditAssunto(e.target.value)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "6px",
                        border: "1px solid var(--border)",
                        background: "var(--bg-elevated)",
                        color: "var(--text)",
                        fontSize: "14px",
                        outline: "none"
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>Conteúdo</label>
                    <textarea
                      value={editConteudo}
                      onChange={e => setEditConteudo(e.target.value)}
                      rows={12}
                      style={{
                        padding: "12px",
                        borderRadius: "6px",
                        border: "1px solid var(--border)",
                        background: "var(--bg-elevated)",
                        color: "var(--text)",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        outline: "none",
                        resize: "none",
                        flex: 1
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                    <button onClick={() => setIsEditing(false)} className="btn btn-outline btn-sm" style={{ cursor: "pointer" }}>
                      Cancelar
                    </button>
                    <button 
                      onClick={handleSalvarEdicao} 
                      disabled={editarMutacao.isPending}
                      className="btn btn-primary btn-sm"
                      style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                    >
                      <Save size={14} /> {editarMutacao.isPending ? "A salvar..." : "Salvar Alterações"}
                    </button>
                  </div>
                </div>
              ) : (
                /* MODO DE VISUALIZAÇÃO */
                <>
                  {/* Header da Mensagem */}
                  <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
                      <div>
                        <button 
                          className="btn btn-ghost btn-sm mobile-only" 
                          onClick={() => setMensagemAtiva(null)} 
                          style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 6, padding: 0 }}
                        >
                          ← Voltar para a lista
                        </button>
                        <h2 style={{ fontSize: 20, fontWeight: 700 }}>{msgDetalhe.assunto}</h2>
                      </div>
                      
                      {/* Grupo de Ações de Mensagem */}
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button 
                          onClick={() => startEditing(msgDetalhe)}
                          className="btn btn-outline btn-sm" 
                          style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                          title="Editar"
                        >
                          <Edit3 size={13} /> Editar
                        </button>
                        <button 
                          onClick={() => ocultarMutacao.mutate({ id: msgDetalhe.id, ocultar: !msgDetalhe.ocultada })}
                          className="btn btn-outline btn-sm"
                          style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                          title={msgDetalhe.ocultada ? "Mostrar na Entrada" : "Ocultar / Arquivar"}
                        >
                          {msgDetalhe.ocultada ? <Eye size={13} /> : <Archive size={13} />}
                          {msgDetalhe.ocultada ? "Mostrar" : "Ocultar"}
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm("Tem a certeza que deseja eliminar permanentemente esta mensagem?")) {
                              eliminarMutacao.mutate(msgDetalhe.id);
                            }
                          }}
                          className="btn btn-sm" 
                          style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)", cursor: "pointer" }}
                          title="Eliminar"
                        >
                          <Trash2 size={13} /> Eliminar
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--primary-faint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <User size={20} color="var(--primary)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{msgDetalhe.remetente_nome}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{msgDetalhe.remetente_email || "Sem email"} • {new Date(msgDetalhe.criado_em).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Corpo da Mensagem */}
                  <div style={{ padding: 32, fontSize: 14, lineHeight: 1.6, color: "var(--text)", flex: 1, whiteSpace: "pre-wrap" }}>
                    {msgDetalhe.conteudo}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="messaging-detail" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg)", color: "var(--text-faint)" }}>
              <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
              <p>Selecione uma mensagem para ler.</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
