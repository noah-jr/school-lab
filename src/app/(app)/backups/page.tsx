"use client";
import { PageHeader } from "@/components/layout/Sidebar";
import { Database, Download, Upload, AlertTriangle, ShieldAlert, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef } from "react";
import { useToast } from "@/components/ui/Toast";
import api from "@/lib/axios";

export default function BackupsPage() {
  const { data: user } = useAuth();
  const isAdmin = user?.papel === "admin";
  const toast = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [restoring, setRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAdmin) {
    return (
      <div className="empty-state" style={{ minHeight: "80dvh" }}>
        <ShieldAlert size={48} color="var(--danger)" style={{ opacity: 0.8, marginBottom: 16 }} />
        <p className="empty-title">Acesso Restrito</p>
        <p className="text-muted" style={{ maxWidth: 400, textAlign: "center", marginBottom: 24 }}>
          Apenas administradores podem aceder às ferramentas de backup e restauro da base de dados.
        </p>
      </div>
    );
  }

  const handleExport = () => {
    window.location.href = "/api/backups/export";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      // Validar extensão básica
      if (!selectedFile.name.endsWith(".sqlite") && !selectedFile.name.endsWith(".db")) {
        toast.erro("Por favor, selecione um ficheiro .sqlite ou .db válido.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleRestore = async () => {
    if (!file) {
      toast.erro("Por favor, selecione um ficheiro de base de dados primeiro.");
      return;
    }

    const confirmar = window.confirm(
      "PERIGO: Tem a certeza que deseja prosseguir?\n\n" +
      "Restaurar uma base de dados antiga irá SOBRESCREVER permanentemente todos os dados atuais do sistema (estudantes, turmas, avaliações, logs de auditoria). " +
      "Esta ação NÃO pode ser desfeita."
    );

    if (!confirmar) return;

    setRestoring(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/backups/recover", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.sucesso(response.data.mensagem || "Base de dados restaurada com sucesso!");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      console.error(err);
      toast.erro(err?.response?.data?.erro || "Falha ao restaurar base de dados.");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Gestão de Backups"
        breadcrumb={[{ label: "Configurações", href: "/configuracoes" }, { label: "Backups" }]}
      />
      <div className="page-body" style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>
          
          {/* Card de Exportação */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "between", padding: "28px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", flex: 1 }}>
              <div style={{ padding: "16px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "50%", color: "var(--success)", marginBottom: "20px" }}>
                <Database size={40} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>Exportar Base de Dados</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: 1.5, marginBottom: "24px" }}>
                Gere um ficheiro <code style={{ background: "var(--bg-elevated)", padding: "2px 4px", borderRadius: "4px" }}>.sqlite</code> contendo todos os dados registados (estudantes, avaliações, turmas, configurações). Recomendado antes de qualquer atualização importante.
              </p>
            </div>
            <button onClick={handleExport} className="btn btn-primary" style={{ width: "100%", padding: "12px", justifyContent: "center" }}>
              <Download size={16} style={{ marginRight: "8px" }} /> Descarregar Base de Dados
            </button>
          </div>

          {/* Card de Restauro */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "between", padding: "28px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", flex: 1 }}>
              <div style={{ padding: "16px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "50%", color: "var(--danger)", marginBottom: "20px" }}>
                <Upload size={40} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>Restaurar Base de Dados</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: 1.5, marginBottom: "20px" }}>
                Substitua a base de dados ativa por um ficheiro de backup anterior. O sistema validará a integridade do ficheiro antes de efetuar a substituição.
              </p>

              {/* Input de Ficheiro */}
              <div style={{ width: "100%", marginBottom: "24px" }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".sqlite,.db"
                  style={{ display: "none" }}
                  id="backup-file-upload"
                />
                <label
                  htmlFor="backup-file-upload"
                  className="btn btn-outline"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderStyle: "dashed",
                    borderColor: file ? "var(--success)" : "var(--border)",
                    color: file ? "var(--success)" : "var(--text)",
                    justifyContent: "center",
                    cursor: "pointer"
                  }}
                >
                  {file ? (
                    <>
                      <Check size={16} style={{ marginRight: "8px" }} />
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </>
                  ) : (
                    "Selecionar ficheiro .sqlite / .db"
                  )}
                </label>
              </div>
            </div>

            <button
              onClick={handleRestore}
              className={`btn ${file ? "btn-danger" : "btn-outline"}`}
              style={{
                width: "100%",
                padding: "12px",
                justifyContent: "center",
                background: file ? "var(--danger)" : "transparent",
                color: file ? "white" : "var(--text-muted)",
                cursor: file ? "pointer" : "not-allowed"
              }}
              disabled={!file || restoring}
            >
              {restoring ? "A restaurar..." : "Restaurar Backup"}
            </button>
          </div>

        </div>

        {/* Aviso de Atenção */}
        <div style={{ marginTop: "32px", padding: "20px", background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: "var(--radius)", display: "flex", gap: "16px" }}>
          <AlertTriangle size={24} color="var(--warning)" style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--warning)", marginBottom: "4px" }}>Informação de Segurança</h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
              O restauro de base de dados substitui o ficheiro de base de dados ativo do servidor em tempo real. Qualquer utilizador com sessão iniciada poderá ter de reiniciar a página para sincronizar as alterações. Certifique-se de que nenhum instrutor está a lançar notas ou a editar turmas no momento do restauro.
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
