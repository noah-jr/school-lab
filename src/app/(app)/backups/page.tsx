"use client";
import { PageHeader } from "@/components/layout/Sidebar";
import { Database, Download, Upload, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ShieldAlert } from "lucide-react";

export default function BackupsPage() {
  const { data: user } = useAuth();
  const isAdmin = user?.papel === "admin";

  if (!isAdmin) {
    return (
      <div className="empty-state" style={{ minHeight: "80dvh" }}>
        <ShieldAlert size={48} color="var(--danger)" style={{ opacity: 0.8, marginBottom: 16 }} />
        <p className="empty-title">Acesso Restrito</p>
        <p className="text-muted" style={{ maxWidth: 400, textAlign: "center", marginBottom: 24 }}>
          Apenas administradores podem aceder às ferramentas de backup da base de dados.
        </p>
      </div>
    );
  }

  const handleExport = () => {
    window.location.href = "/api/backups/export";
  };

  return (
    <>
      <PageHeader
        title="Gestão de Backups"
        breadcrumb={[{ label: "Configurações", href: "/configuracoes" }, { label: "Backups" }]}
      />
      <div className="page-body" style={{ maxWidth: 800, margin: "0 auto", padding: "40px 16px" }}>
        
        <div className="card" style={{ padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ padding: "16px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "50%", color: "var(--success)", marginBottom: "24px" }}>
            <Database size={48} />
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)", marginBottom: "12px" }}>Backup Completo do Sistema</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.6, maxWidth: 500, marginBottom: "32px" }}>
            O School-Lab funciona com uma base de dados local SQLite. Pode exportar um ficheiro exato de todo o sistema (utilizadores, turmas, relatórios) a qualquer momento. Guarde este ficheiro num local seguro.
          </p>

          <button onClick={handleExport} className="btn btn-primary" style={{ padding: "12px 32px", fontSize: "15px" }}>
            <Download size={18} style={{ marginRight: "8px" }} /> Transferir db.sqlite
          </button>
        </div>

        <div style={{ marginTop: "32px", padding: "24px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "var(--radius)", display: "flex", gap: "16px" }}>
          <AlertCircle size={24} color="var(--danger)" style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--danger)", marginBottom: "4px" }}>Restauro de Backup</h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
              A reposição de um backup requer a substituição manual do ficheiro <code style={{ background: "var(--bg-elevated)", padding: "2px 6px", borderRadius: "4px" }}>data/escola.db</code> ou <code style={{ background: "var(--bg-elevated)", padding: "2px 6px", borderRadius: "4px" }}>db.sqlite</code> no servidor da aplicação. Por motivos de segurança, o upload web está desativado. Peça ao administrador de sistemas (TI) para realizar a substituição do ficheiro caso necessite de reverter os dados.
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
