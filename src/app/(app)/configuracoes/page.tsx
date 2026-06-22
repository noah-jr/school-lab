"use client";
import { PageHeader } from "@/components/layout/Sidebar";
import { Settings, Server, Users, ShieldCheck, Activity, Save, Database, Bell, Mail, Key, Globe, LayoutTemplate, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";

export default function ConfiguracoesPage() {
  const toast = useToast();
  const { data: user } = useAuth();
  const isAdmin = user?.papel === "admin";

  const [saving, setSaving] = useState(false);

  const handleSaveSimulated = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.sucesso("Configurações guardadas com sucesso.");
    }, 1000);
  };

  const SectionTitle = ({ icon: Icon, title, desc }: { icon: any, title: string, desc?: string }) => (
    <div style={{ marginBottom: "20px" }}>
      <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ padding: "6px", background: "var(--bg-elevated)", borderRadius: "8px", border: "1px solid var(--border)" }}>
          <Icon size={16} color="var(--accent)" />
        </div>
        {title}
      </h3>
      {desc && <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", marginLeft: "38px" }}>{desc}</p>}
    </div>
  );

  return (
    <>
      <PageHeader
        title="Configurações do Sistema"
        breadcrumb={[{ label: "Configurações" }]}
        actions={
          isAdmin ? (
            <button className={`btn btn-primary ${saving ? "btn-loading" : ""}`} onClick={handleSaveSimulated} disabled={saving}>
              <Save size={14} /> Guardar Alterações
            </button>
          ) : undefined
        }
      />
      
      <div className="page-body" style={{ width: "100%", padding: "24px", display: "flex", flexDirection: "column", gap: "40px" }}>
        
        {/* Painel Geral */}
        <section>
          <SectionTitle icon={Globe} title="Geral e Identidade" desc="Configure os detalhes da sua instituição e preferências regionais." />
          <div className="card" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            <div className="form-group">
              <label className="form-label">Nome da Instituição</label>
              <input className="form-input" defaultValue="Escola para Anciãos de Congregação" disabled={!isAdmin} />
            </div>
            <div className="form-group">
              <label className="form-label">Fuso Horário Principal</label>
              <select className="form-select" defaultValue="Africa/Luanda" disabled={!isAdmin}>
                <option value="Africa/Luanda">África / Luanda (WAT)</option>
                <option value="Europe/Lisbon">Europa / Lisboa (WET/WEST)</option>
                <option value="America/Sao_Paulo">América / São Paulo (BRT)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Formato de Data</label>
              <select className="form-select" defaultValue="dd/mm/yyyy" disabled={!isAdmin}>
                <option value="dd/mm/yyyy">DD/MM/AAAA (ex: 25/12/2026)</option>
                <option value="mm/dd/yyyy">MM/DD/AAAA (ex: 12/25/2026)</option>
                <option value="yyyy-mm-dd">AAAA-MM-DD (ex: 2026-12-25)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Email de Suporte (Remetente)</label>
              <input type="email" className="form-input" defaultValue="no-reply@jwpub.org" disabled={!isAdmin} />
            </div>
          </div>
        </section>

        {/* Gestão e Segurança */}
        <section>
          <SectionTitle icon={ShieldCheck} title="Acessos e Auditoria" desc="Controlo rápido de quem pode aceder e o que acontece no sistema." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            <Link href="/utilizadores" className="card" style={{ cursor: "pointer", border: "1px solid var(--border)", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.borderColor="var(--accent)"} onMouseOut={e => e.currentTarget.style.borderColor="var(--border)"}>
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{ padding: "12px", background: "rgba(30, 64, 175, 0.1)", borderRadius: "12px", color: "var(--accent)" }}>
                  <Users size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>Utilizadores (RBAC)</h4>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>Gerir contas, suspender acessos e atribuir permissões (Admin, Instrutor, etc).</p>
                </div>
              </div>
            </Link>

            <Link href="/logs" className="card" style={{ cursor: "pointer", border: "1px solid var(--border)", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.borderColor="var(--info)"} onMouseOut={e => e.currentTarget.style.borderColor="var(--border)"}>
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{ padding: "12px", background: "rgba(14, 165, 233, 0.1)", borderRadius: "12px", color: "var(--info)" }}>
                  <Activity size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>Registos de Auditoria (Logs)</h4>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>Monitorizar quem fez o quê, rastrear logins e inspecionar falhas de segurança.</p>
                </div>
              </div>
            </Link>

            <Link href="/backups" className="card" style={{ cursor: "pointer", border: "1px solid var(--border)", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.borderColor="var(--success)"} onMouseOut={e => e.currentTarget.style.borderColor="var(--border)"}>
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{ padding: "12px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "12px", color: "var(--success)" }}>
                  <Database size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>Exportação e Backups</h4>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>Exportar base de dados SQLite, importar backups antigos e garantir redundância.</p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Notificações e Automações */}
        <section>
          <SectionTitle icon={Bell} title="Notificações e Automações" desc="Ative alertas por email para estudantes e eventos da turma." />
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <Mail size={18} color="var(--text-muted)" />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)" }}>Alertas de Designação (Via Email)</div>
                  <div style={{ fontSize: "12px", color: "var(--text-faint)", marginTop: "2px" }}>Envia automaticamente o PDF do programa quando as designações são fechadas.</div>
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", cursor: "pointer", background: "var(--bg-surface)", padding: "4px", borderRadius: "99px", border: "1px solid var(--border)", width: "44px", height: "24px", position: "relative" }}>
                <input type="checkbox" defaultChecked disabled={!isAdmin} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: "absolute", left: "2px", width: "18px", height: "18px", background: "var(--accent)", borderRadius: "50%", transform: "translateX(20px)", transition: "0.2s" }} />
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <Key size={18} color="var(--text-muted)" />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)" }}>Magic Link para Viajantes</div>
                  <div style={{ fontSize: "12px", color: "var(--text-faint)", marginTop: "2px" }}>Permitir geração de links temporários (sem login) para avaliação externa.</div>
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", cursor: "pointer", background: "var(--bg-surface)", padding: "4px", borderRadius: "99px", border: "1px solid var(--border)", width: "44px", height: "24px", position: "relative" }}>
                <input type="checkbox" defaultChecked disabled={!isAdmin} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: "absolute", left: "2px", width: "18px", height: "18px", background: "var(--accent)", borderRadius: "50%", transform: "translateX(20px)", transition: "0.2s" }} />
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <Clock size={18} color="var(--text-muted)" />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)" }}>Lembretes Automáticos</div>
                  <div style={{ fontSize: "12px", color: "var(--text-faint)", marginTop: "2px" }}>Enviar alerta aos instrutores 48h antes da turma começar, caso existam partes não designadas.</div>
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", cursor: "pointer", background: "var(--bg-surface)", padding: "4px", borderRadius: "99px", border: "1px solid var(--border)", width: "44px", height: "24px", position: "relative" }}>
                <input type="checkbox" disabled={!isAdmin} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: "absolute", left: "2px", width: "18px", height: "18px", background: "var(--text-muted)", borderRadius: "50%", transition: "0.2s" }} />
              </label>
            </div>
          </div>
        </section>

        {/* Info Sistema Avançada */}
        <section>
          <SectionTitle icon={Server} title="Saúde do Sistema & Hardware" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" }}>
            <div className="card" style={{ padding: "20px" }}>
              <div className="text-muted" style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 600 }}>Carga do Motor</div>
              <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "8px", color: "var(--text)" }}>2.4 MB</div>
              <div style={{ fontSize: "12px", color: "var(--text-faint)", marginTop: "4px" }}>Tamanho atual do db.sqlite</div>
            </div>
            <div className="card" style={{ padding: "20px" }}>
              <div className="text-muted" style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 600 }}>Versão React/Next</div>
              <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "8px", color: "var(--text)" }}>15.x</div>
              <div style={{ fontSize: "12px", color: "var(--text-faint)", marginTop: "4px" }}>App Router & Server Actions</div>
            </div>
            <div className="card" style={{ padding: "20px" }}>
              <div className="text-muted" style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 600 }}>Renderer PDF</div>
              <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "8px", color: "var(--success)" }}>jsPDF v4</div>
              <div style={{ fontSize: "12px", color: "var(--text-faint)", marginTop: "4px" }}>Motor Estável (Zero-Dependencies)</div>
            </div>
            <div className="card" style={{ padding: "20px" }}>
              <div className="text-muted" style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 600 }}>Ambiente</div>
              <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "8px", color: "var(--accent)" }}>Produção</div>
              <div style={{ fontSize: "12px", color: "var(--text-faint)", marginTop: "4px" }}>Modo Seguro WAL Ativado</div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
