"use client";
import { PageHeader } from "@/components/layout/Sidebar";
import { Settings, FileCode, Server, Users, Plus, ShieldCheck, ShieldOff, UserCheck, Activity } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface Utilizador {
  id: string;
  nome: string;
  email: string;
  papel: "admin" | "instrutor" | "viajante";
  activo: number;
  criado_em: string;
}

const PAPEL_LABELS: Record<string, string> = {
  admin: "Administrador",
  instrutor: "Instrutor",
  viajante: "Viajante",
};

const PAPEL_BADGE: Record<string, string> = {
  admin: "var(--danger)",
  instrutor: "var(--accent)",
  viajante: "var(--info)",
};

export default function ConfiguracoesPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [novoUtilizador, setNovoUtilizador] = useState({
    nome: "", email: "", password: "", papel: "instrutor",
  });

  const { data: utilizadoresData, isLoading } = useQuery({
    queryKey: ["utilizadores"],
    queryFn: async () => {
      const { data } = await api.get("/utilizadores");
      return data.data as Utilizador[];
    },
  });

  const toggleActivo = useMutation({
    mutationFn: async ({ id, activo }: { id: string; activo: number }) => {
      await api.patch(`/utilizadores/${id}`, { activo });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["utilizadores"] }),
  });

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.post("/utilizadores", novoUtilizador);
      qc.invalidateQueries({ queryKey: ["utilizadores"] });
      setModalAberto(false);
      setNovoUtilizador({ nome: "", email: "", password: "", papel: "instrutor" });
      toast.sucesso("Utilizador criado com sucesso");
    } catch (err: any) {
      toast.erro(err?.response?.data?.erro || "Erro ao criar utilizador");
    } finally {
      setSalvando(false);
    }
  };

  const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <h3 style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "8px", paddingBottom: "8px", borderBottom: "1px solid var(--border)", marginBottom: "16px" }}>
      <Icon size={14} color="var(--accent)" /> {title}
    </h3>
  );

  return (
    <>
      <PageHeader
        title="Administração & Definições"
        breadcrumb={[{ label: "Configurações" }]}
        actions={
          <button className="btn btn-primary" onClick={() => setModalAberto(true)}>
            <Plus size={14} /> Adicionar Utilizador
          </button>
        }
      />
      
      <div className="page-body" style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 16px" }}>
        
        {/* Gestão de Utilizadores */}
        <div style={{ marginBottom: "40px" }}>
          <SectionTitle icon={Users} title="Controlo de Acesso & Utilizadores" />
          <div className="card" style={{ padding: 0, overflow: "hidden", borderTop: "3px solid var(--accent)" }}>
            <div className="card-header" style={{ padding: "16px 24px", marginBottom: 0, borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="card-title flex items-center gap-2" style={{ fontSize: "14px", margin: 0 }}>
                <ShieldCheck size={16} color="var(--text-muted)" /> Gestão de Contas
              </span>
              <span className="badge badge-activa" style={{ borderRadius: "4px" }}>{utilizadoresData?.length ?? 0} Contas Registadas</span>
            </div>

            {isLoading ? (
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 8 }}>
                {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 48 }} />)}
              </div>
            ) : (
              <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                    <tr>
                      <th style={{ padding: "12px 24px", color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Nome & Email</th>
                      <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Permissões</th>
                      <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Status</th>
                      <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Registo</th>
                      <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "right", paddingRight: "24px" }}>Acções</th>
                    </tr>
                  </thead>
                  <tbody>
                    {utilizadoresData?.map((u) => (
                      <tr key={u.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }} onMouseOver={e => e.currentTarget.style.background = "var(--bg-elevated)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "12px 24px" }}>
                          <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--text)" }}>{u.nome}</div>
                          <div className="font-mono text-muted" style={{ fontSize: "11px" }}>{u.email}</div>
                        </td>
                        <td>
                          <span style={{ 
                            fontSize: "11px", fontWeight: 600, textTransform: "uppercase", padding: "2px 8px", 
                            border: `1px solid ${PAPEL_BADGE[u.papel]}40`, color: PAPEL_BADGE[u.papel], 
                            background: `${PAPEL_BADGE[u.papel]}10`, borderRadius: "4px" 
                          }}>
                            {PAPEL_LABELS[u.papel] ?? u.papel}
                          </span>
                        </td>
                        <td>
                          {u.activo ? (
                            <span className="badge badge-activa" style={{ fontSize: "11px", fontWeight: 600, borderRadius: "4px" }}>Activo</span>
                          ) : (
                            <span className="badge badge-cancelada" style={{ fontSize: "11px", fontWeight: 600, borderRadius: "4px" }}>Inactivo</span>
                          )}
                        </td>
                        <td className="text-muted font-mono" style={{ fontSize: "12px" }}>
                          {new Date(u.criado_em).toLocaleDateString("pt-AO")}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "24px" }}>
                          <button
                            className={`btn btn-sm ${u.activo ? "btn-danger" : "btn-success"}`}
                            onClick={() => toggleActivo.mutate({ id: u.id, activo: u.activo ? 0 : 1 })}
                            disabled={toggleActivo.isPending}
                            title={u.activo ? "Bloquear acesso" : "Permitir acesso"}
                            style={{ fontSize: "11px", fontWeight: 600, display: "inline-flex", padding: "4px 12px" }}
                          >
                            {u.activo ? <ShieldOff size={12} /> : <ShieldCheck size={12} />}
                            {u.activo ? "Suspender" : "Activar"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Informações Globais do Sistema */}
        <div>
          <SectionTitle icon={Activity} title="Diagnósticos do Sistema" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>

            {/* Base de Dados */}
            <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", border: "1px solid var(--border)", transition: "border-color 0.2s" }} onMouseOver={e => e.currentTarget.style.borderColor = "var(--info)"} onMouseOut={e => e.currentTarget.style.borderColor = "var(--border)"}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--info-bg, rgba(0, 120, 212, 0.1))", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--info, #0078d4)" }}>
                  <Server size={16} />
                </div>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>Motor de Persistência</span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px", lineHeight: 1.5 }}>
                Os dados são geridos localmente via SQLite em <code style={{ background: "var(--bg-elevated)", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontFamily: "var(--font-mono)", border: "1px solid var(--border)" }}>/data/escola.db</code>.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px", marginTop: "auto", background: "var(--border)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "10px 12px", background: "var(--bg-surface)" }}>
                  <span style={{ color: "var(--text-muted)" }}>Storage Engine</span>
                  <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>SQLite 3 (WAL)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "10px 12px", background: "var(--bg-surface)" }}>
                  <span style={{ color: "var(--text-muted)" }}>ORM Engine</span>
                  <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>Better-SQLite3</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", padding: "10px 12px", background: "var(--bg-surface)" }}>
                  <span style={{ color: "var(--text-muted)" }}>Audit Logs</span>
                  <span className="badge badge-activa" style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px" }}>Ligado</span>
                </div>
              </div>
            </div>

            {/* Programas Escolares */}
            <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", border: "1px solid var(--border)", transition: "border-color 0.2s" }} onMouseOver={e => e.currentTarget.style.borderColor = "var(--accent)"} onMouseOut={e => e.currentTarget.style.borderColor = "var(--border)"}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-bg, rgba(138, 43, 226, 0.1))", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent, #8a2be2)" }}>
                  <FileCode size={16} />
                </div>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>Programas Curriculares</span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px", lineHeight: 1.5 }}>
                Os templates base definem o calendário escolar e a estrutura de designações aplicáveis a todas as turmas ativas.
              </p>
              <div style={{ background: "var(--bg-elevated)", padding: "16px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: "6px" }}><FileCode size={14} color="var(--accent)"/> EAC Padrão</span>
                  <span className="badge badge-activa" style={{ fontSize: "10px", borderRadius: "4px" }}>Default</span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                   <span style={{ fontSize: "11px", color: "var(--text-muted)", background: "var(--bg-surface)", padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--border)" }}>46 partes</span>
                   <span style={{ fontSize: "11px", color: "var(--text-muted)", background: "var(--bg-surface)", padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--border)" }}>5 dias úteis</span>
                   <span style={{ fontSize: "11px", color: "var(--text-muted)", background: "var(--bg-surface)", padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--border)" }}>3 Níveis</span>
                </div>
              </div>
            </div>

            {/* Info Sistema */}
            <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", border: "1px solid var(--border)", transition: "border-color 0.2s" }} onMouseOver={e => e.currentTarget.style.borderColor = "var(--warning)"} onMouseOut={e => e.currentTarget.style.borderColor = "var(--border)"}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--warning-bg, rgba(204, 167, 0, 0.1))", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--warning, #cca700)" }}>
                  <Settings size={16} />
                </div>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>Ambiente da Instância</span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px", lineHeight: 1.5 }}>
                Detalhes técnicos da plataforma em execução no servidor atual.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px", marginTop: "auto", background: "var(--border)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                {[
                  { label: "Core Versão", val: "v1.0.0-rc.1" },
                  { label: "Frontend", val: "Next.js 15 (React 19)" },
                  { label: "Design System", val: "EAC Flat UI" },
                  { label: "Node Runtime", val: "v20 LTS" },
                ].map(({ label, val }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "10px 12px", background: "var(--bg-surface)" }}>
                    <span style={{ color: "var(--text-muted)" }}>{label}</span>
                    <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text)" }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modal novo utilizador */}
      {modalAberto && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalAberto(false)}>
          <div className="modal" style={{ width: "100%", maxWidth: "450px" }}>
            <div className="modal-header">
              <span className="modal-title">Registar Acesso</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setModalAberto(false)}>✕</button>
            </div>
            <form onSubmit={handleCriar}>
              <div className="modal-body" style={{ padding: "24px" }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "11px", textTransform: "uppercase" }}>Nome Completo *</label>
                  <input
                    className="form-input"
                    required
                    placeholder="ex: João Silva"
                    value={novoUtilizador.nome}
                    onChange={(e) => setNovoUtilizador({ ...novoUtilizador, nome: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "11px", textTransform: "uppercase" }}>Email Institucional *</label>
                  <input
                    type="email"
                    className="form-input"
                    required
                    placeholder="ex: joao@jwpub.org"
                    value={novoUtilizador.email}
                    onChange={(e) => setNovoUtilizador({ ...novoUtilizador, email: e.target.value })}
                    style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "11px", textTransform: "uppercase" }}>Palavra-passe Temporária *</label>
                  <input
                    type="password"
                    className="form-input"
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    value={novoUtilizador.password}
                    onChange={(e) => setNovoUtilizador({ ...novoUtilizador, password: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "11px", textTransform: "uppercase" }}>Nível de Permissão</label>
                  <select
                    className="form-select"
                    value={novoUtilizador.papel}
                    onChange={(e) => setNovoUtilizador({ ...novoUtilizador, papel: e.target.value })}
                  >
                    <option value="instrutor">Instrutor (Pode gerir turmas e designações)</option>
                    <option value="viajante">Viajante (Apenas avalia oratórias via link)</option>
                    <option value="admin">Administrador (Controlo total)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: "1px solid var(--border)", padding: "16px 24px", background: "var(--bg-surface)" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModalAberto(false)}>Cancelar</button>
                <button type="submit" className={`btn btn-primary ${salvando ? "btn-loading" : ""}`} disabled={salvando}>
                  {salvando ? "A Processar..." : "Atribuir Acesso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
