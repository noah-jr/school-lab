"use client";
import { use, useState, useRef } from "react";
import { PageHeader } from "@/components/layout/Sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Estudante } from "@/lib/types";
import { UserCircle, BookOpen, Clock, Edit2, PowerOff, Trash2, Mail, FileUp, FileText, Download, X, Send, Printer } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";

export default function EstudanteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data: user } = useAuth();
  const temAcessoCompleto = user?.papel === "admin" || user?.papel === "instrutor";

  const [editando, setEditando] = useState(false);
  const [notificando, setNotificando] = useState(false);
  const [loadingAcao, setLoadingAcao] = useState(false);
  const [formData, setFormData] = useState<any>({});
  
  // Estados para o formulário de notificação
  const [notifAssunto, setNotifAssunto] = useState("Designações / Informação da Escola");
  const [notifMensagem, setNotifMensagem] = useState("Olá. Por favor, aceda ao seu link pessoal para consultar as suas designações e detalhes sobre as aulas.");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detalhes do Estudante
  const { data: response, isLoading } = useQuery({
    queryKey: ["estudantes", "detail", id],
    queryFn: async () => {
      const { data } = await api.get(`/estudantes/${id}`);
      return data.data as Estudante & { historico: any[] };
    },
    enabled: !!id,
  });

  const estudante = response;

  // Lista de congregações
  const { data: congs } = useQuery({
    queryKey: ["congregacoes"],
    queryFn: async () => (await api.get("/congregacoes")).data.data
  });

  // Lista de Documentos
  const { data: documentos, isLoading: carregandoDocs } = useQuery({
    queryKey: ["documentos", id],
    queryFn: async () => {
      const { data } = await api.get(`/estudantes/${id}/documentos`);
      return data.data as any[];
    },
    enabled: !!id,
  });

  // Mutation de Upload de Arquivo
  const uploadDocMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post(`/estudantes/${id}/documentos`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos", id] });
      toast.sucesso("Ficheiro carregado com sucesso!");
    },
    onError: (err: any) => {
      toast.erro(err.response?.data?.erro || "Erro ao carregar ficheiro.");
    }
  });

  // Mutation para Apagar Arquivo
  const deleteDocMutation = useMutation({
    mutationFn: async (docId: string) => {
      await api.delete(`/estudantes/${id}/documentos/${docId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos", id] });
      toast.sucesso("Documento removido.");
    },
    onError: (err: any) => {
      toast.erro(err.response?.data?.erro || "Erro ao remover documento.");
    }
  });

  // Enviar Notificação
  const enviarNotifMutation = useMutation({
    mutationFn: async (dados: { assunto: string; conteudo: string }) => {
      // Simula / chama endpoint para enviar notificação/email ou criar log de notificação
      await api.post(`/estudantes/${id}/notificar`, dados);
    },
    onSuccess: () => {
      toast.sucesso("Notificação enviada com sucesso ao estudante!");
      setNotificando(false);
    },
    onError: (err: any) => {
      toast.erro(err.response?.data?.erro || "Erro ao enviar notificação.");
    }
  });

  if (isLoading) {
    return (
      <>
        <PageHeader title="..." breadcrumb={[{ label: "Estudantes", href: "/estudantes" }, { label: "..." }]} />
        <div className="page-body">
          <div className="skeleton" style={{ height: 120, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 400 }} />
        </div>
      </>
    );
  }

  if (!estudante) return (
    <div className="empty-state" style={{ minHeight: "100dvh" }}>
      <p className="empty-title">Estudante não encontrado</p>
      <Link href="/estudantes" className="btn btn-ghost btn-sm">← Voltar à lista</Link>
    </div>
  );

  const iniciarEdicao = () => {
    setFormData({
      nome: estudante.nome,
      email_jwpub: estudante.email_jwpub || "",
      telefone_principal: estudante.telefone_principal || "",
      telefone_alternativo: estudante.telefone_alternativo || "",
      papel_ministerial: estudante.papel_ministerial,
      congregacao_id: estudante.congregacao_id || "",
      fotografia: estudante.fotografia || ""
    });
    setEditando(true);
  };

  const guardarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAcao(true);
    try {
      await api.patch(`/estudantes/${id}`, formData);
      queryClient.invalidateQueries({ queryKey: ["estudantes"] });
      setEditando(false);
      toast.sucesso("Estudante editado com sucesso!");
    } catch (err) {
      toast.erro("Erro ao editar o estudante.");
    } finally {
      setLoadingAcao(false);
    }
  };

  const toggleAtivo = async () => {
    const confirmar = confirm(`Tem a certeza que deseja ${estudante.activo ? 'DESATIVAR' : 'REATIVAR'} a conta deste estudante?`);
    if (!confirmar) return;
    try {
      await api.patch(`/estudantes/${id}`, { activo: estudante.activo ? 0 : 1 });
      queryClient.invalidateQueries({ queryKey: ["estudantes"] });
      toast.sucesso(`Estudante ${estudante.activo ? 'desativado' : 'reativado'} com sucesso.`);
    } catch (err) {
      toast.erro("Erro ao alterar o estado do estudante.");
    }
  };

  const eliminarEstudante = async () => {
    const confirmar = confirm("ATENÇÃO: Deseja eliminar permanentemente este estudante? Esta ação não pode ser desfeita e irá apagar a ficha da base de dados.");
    if (!confirmar) return;
    try {
      await api.delete(`/estudantes/${id}`);
      toast.sucesso("Estudante eliminado permanentemente.");
      router.push("/estudantes");
    } catch (err: any) {
      toast.erro(err.response?.data?.erro || "Erro ao eliminar o estudante.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadDocMutation.mutate(file);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const handleCorrecaoNomeEdicao = () => {
    const nomeSujo = formData.nome || "";
    if (nomeSujo.includes(",")) {
      const partes = nomeSujo.split(",");
      if (partes.length >= 2) {
        const apelido = partes[0].trim();
        const nomeProprio = partes.slice(1).join(" ").trim();
        setFormData({ ...formData, nome: `${nomeProprio} ${apelido}` });
      }
    }
  };

  const handleSubmeterNotificacao = (e: React.FormEvent) => {
    e.preventDefault();
    enviarNotifMutation.mutate({ assunto: notifAssunto, conteudo: notifMensagem });
  };

  return (
    <>
      <PageHeader
        title="Perfil do Estudante"
        breadcrumb={[{ label: "Estudantes", href: "/estudantes" }, { label: estudante.nome }]}
      />

      <div className="page-body" style={{ position: "relative" }}>
        
        {/* Cartão de Perfil */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: estudante.activo ? "var(--bg-elevated)" : "var(--danger-faint)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", border: "1px solid var(--border)" }}>
              {estudante.fotografia && (estudante.fotografia.startsWith('data:image') || estudante.fotografia.startsWith('/')) ? (
                <img src={estudante.fotografia} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UserCircle size={40} color={estudante.activo ? "var(--text-muted)" : "var(--danger)"} />
              )}
              {!estudante.activo && <div style={{ position: "absolute", bottom: 0, width: "100%", background: "var(--danger)", color: "#fff", fontSize: 9, padding: "2px 0", textAlign: "center", fontWeight: "bold" }}>INATIVO</div>}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, color: estudante.activo ? "var(--text)" : "var(--text-muted)" }}>{estudante.nome}</h2>
              <div className="flex gap-4 text-sm text-muted" style={{ flexWrap: "wrap" }}>
                <span><span className="font-semibold text-text">Papel:</span> {estudante.papel_ministerial === "anciao" ? "Ancião" : "Servo Ministerial"}</span>
                <span><span className="font-semibold text-text">Congregação:</span> {(estudante as any).congregacao_nome || "—"}</span>
                <span><span className="font-semibold text-text">Email:</span> {estudante.email_jwpub || "—"}</span>
                <span><span className="font-semibold text-text">Telf:</span> {estudante.telefone_principal || "—"}</span>
              </div>
            </div>
          </div>
          
          {/* Barra de Ações Rápidas (Condicional: RBAC) */}
          {temAcessoCompleto && (
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="btn btn-outline" onClick={iniciarEdicao}><Edit2 size={16} /> Editar Perfil</button>
              <button className="btn btn-outline" onClick={() => setNotificando(true)}><Mail size={16} /> Notificar</button>
              <Link href={`/estudantes/${id}/ficha/imprimir`} className="btn btn-outline"><Printer size={16} /> Imprimir Ficha</Link>
              <Link href={`/preview-pdf?url=/api/estudantes/${id}/ficha/pdf&title=Ficha%20de%20Estudante&back=/estudantes/${id}`} className="btn btn-outline"><FileText size={16} /> Exportar Ficha</Link>
              <div style={{ flex: 1 }} />
              <button className="btn btn-ghost" style={{ color: estudante.activo ? "var(--danger)" : "var(--success)" }} onClick={toggleAtivo}>
                <PowerOff size={16} /> {estudante.activo ? "Desativar" : "Reativar"}
              </button>
              <button className="btn btn-ghost" style={{ color: "var(--danger)" }} onClick={eliminarEstudante}><Trash2 size={16} /> Eliminar Ficha</button>
            </div>
          )}
        </div>

        {/* Módulo Duplo: Histórico e Documentos */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          
          {/* Histórico de Turmas */}
          <div className="card" style={{ padding: 0, overflow: "hidden", alignSelf: "start" }}>
            <div className="card-header" style={{ padding: "16px 20px" }}>
              <span className="card-title flex items-center gap-2"><BookOpen size={16} /> Histórico de Turmas</span>
            </div>
            {!estudante.historico?.length ? (
              <div className="empty-state" style={{ padding: "32px 24px" }}>
                <Clock size={28} style={{ opacity: 0.3 }} />
                <p className="empty-title">Sem histórico</p>
                <p className="empty-desc">O estudante ainda não participou na escola.</p>
              </div>
            ) : (
              <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Turma</th>
                      <th>Avaliação</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estudante.historico.map((h: any) => {
                      const nivel = h.nivel_oratoria?.charAt(0) ?? "default";
                      return (
                        <tr key={h.id}>
                          <td style={{ fontWeight: 500 }}><Link href={`/turmas/${h.turma_id}`} style={{ color: "var(--accent)" }}>{h.numero_turma}ª Turma</Link></td>
                          <td>{h.nivel_oratoria ? <span className={`badge badge-${nivel}`}>{h.nivel_oratoria}</span> : <span className="text-faint text-xs">Pendente</span>}</td>
                          <td><span className={`badge badge-${h.status}`}>{h.status}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Gestão de Documentos (Troca Ficheiros) */}
          <div className="card" style={{ padding: 0, overflow: "hidden", alignSelf: "start" }}>
            <div className="card-header" style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="card-title flex items-center gap-2"><FileText size={16} /> Arquivo & Documentos</span>
              {temAcessoCompleto && (
                <>
                  <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
                  <button className="btn btn-outline btn-sm" onClick={() => fileInputRef.current?.click()} disabled={uploadDocMutation.isPending}>
                    <FileUp size={14} /> {uploadDocMutation.isPending ? "A carregar..." : "Carregar Ficheiro"}
                  </button>
                </>
              )}
            </div>

            {carregandoDocs ? (
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="skeleton" style={{ height: 40 }} />
                <div className="skeleton" style={{ height: 40 }} />
              </div>
            ) : !documentos?.length ? (
              <div className="empty-state" style={{ padding: "48px 24px", background: "var(--bg)" }}>
                <FileText size={32} style={{ opacity: 0.2, marginBottom: 8 }} />
                <p className="empty-title">O Cofre está Vazio</p>
                <p className="empty-desc" style={{ maxWidth: 300, margin: "0 auto" }}>Nenhum documento anexado ao estudante.</p>
              </div>
            ) : (
              <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Nome do Ficheiro</th>
                      <th>Tamanho</th>
                      <th style={{ textAlign: "right" }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentos.map((doc) => (
                      <tr key={doc.id}>
                        <td style={{ fontWeight: 500, fontSize: "13px" }}>{doc.nome}</td>
                        <td className="text-muted font-mono" style={{ fontSize: "12px" }}>{formatBytes(doc.tamanho)}</td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <a href={doc.url} download className="btn btn-ghost btn-icon" style={{ width: 28, height: 28 }} title="Download">
                              <Download size={14} />
                            </a>
                            {temAcessoCompleto && (
                              <button onClick={() => deleteDocMutation.mutate(doc.id)} className="btn btn-ghost btn-icon" style={{ width: 28, height: 28, color: "var(--danger)" }} title="Eliminar">
                                <Trash2 size={14} />
                              </button>
                            )}
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
      </div>

      {/* Modal de Edição */}
      {editando && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="card" style={{ width: "100%", maxWidth: 500, padding: 32, animation: "slideUp 0.3s ease" }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, color: "var(--text)" }}>Editar Informações do Estudante</h3>
            <form onSubmit={guardarEdicao} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              
              <div className="form-group">
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Nome Completo *</span>
                  <span style={{ fontSize: "10px", color: "var(--info)", fontWeight: "normal" }}>Inversão automática de vírgula ativada</span>
                </label>
                <input 
                  required 
                  className="form-input" 
                  value={formData.nome} 
                  onChange={e => setFormData({...formData, nome: e.target.value})} 
                  onBlur={handleCorrecaoNomeEdicao}
                  placeholder="Pode colar: Apelido, Nome Próprio"
                />
              </div>

              <div style={{ display: "flex", gap: 16 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Email JWPub</label>
                  <input type="email" className="form-input" value={formData.email_jwpub} onChange={e => setFormData({...formData, email_jwpub: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Telefone</label>
                  <input type="tel" className="form-input" value={formData.telefone_principal} onChange={e => setFormData({...formData, telefone_principal: e.target.value})} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 16 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Papel Ministerial</label>
                  <select className="form-input" value={formData.papel_ministerial} onChange={e => setFormData({...formData, papel_ministerial: e.target.value})}>
                    <option value="anciao">Ancião</option>
                    <option value="servo_ministerial">Servo Ministerial</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Congregação</label>
                  <select className="form-input" value={formData.congregacao_id} onChange={e => setFormData({...formData, congregacao_id: e.target.value})}>
                    <option value="">(Sem Congregação)</option>
                    {congs?.map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Fotografia</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="form-input" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, fotografia: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
                {formData.fotografia && <img src={formData.fotografia} alt="Preview" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: '50%', marginTop: 8 }} />}
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setEditando(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loadingAcao}>{loadingAcao ? "A gravar..." : "Gravar Alterações"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Envio de Notificação */}
      {notificando && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="card" style={{ width: "100%", maxWidth: 500, padding: 32, animation: "slideUp 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
                <Mail size={20} color="var(--accent)" />
                <span>Notificar Estudante</span>
              </h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setNotificando(false)} style={{ width: 30, height: 30 }}><X size={16} /></button>
            </div>
            
            <form onSubmit={handleSubmeterNotificacao} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Destinatário</label>
                <input className="form-input" value={`${estudante.nome} (${estudante.email_jwpub || "Sem e-mail"})`} disabled />
              </div>

              <div className="form-group">
                <label className="form-label">Assunto *</label>
                <input 
                  required 
                  className="form-input" 
                  value={notifAssunto} 
                  onChange={e => setNotifAssunto(e.target.value)} 
                  placeholder="Ex: Assunto da Notificação"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mensagem *</label>
                <textarea 
                  required 
                  className="form-input" 
                  rows={4}
                  value={notifMensagem} 
                  onChange={e => setNotifMensagem(e.target.value)} 
                  placeholder="Escreva a mensagem aqui..."
                  style={{ resize: "vertical", minHeight: 80 }}
                />
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setNotificando(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={enviarNotifMutation.isPending}>
                  {enviarNotifMutation.isPending ? "A enviar..." : <><Send size={14} /> Enviar Mensagem</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
