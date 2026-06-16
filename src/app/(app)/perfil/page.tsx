"use client";
import { PageHeader } from "@/components/layout/Sidebar";
import { useState, useEffect } from "react";
import { User, Mail, Key, Shield, Calendar, LogOut, CheckCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useToast } from "@/components/ui/Toast";

const papelLabel: Record<string, string> = {
  admin: "Administrador",
  instrutor: "Instrutor",
  viajante: "Viajante",
  secretaria: "Secretária",
};

const papelCor: Record<string, string> = {
  admin: "var(--danger)",
  instrutor: "var(--accent)",
  viajante: "var(--success)",
  secretaria: "var(--info)",
};

export default function PerfilPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: perfil, isLoading } = useQuery({
    queryKey: ["perfil"],
    queryFn: async () => {
      const res = await api.get("/perfil");
      return res.data.data;
    }
  });

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [tabActiva, setTabActiva] = useState<"info" | "senha">("info");

  useEffect(() => {
    if (perfil) {
      setNome(perfil.nome || "");
      setEmail(perfil.email || "");
    }
  }, [perfil]);

  const updateMutacao = useMutation({
    mutationFn: async (dados: any) => {
      await api.patch("/perfil", dados);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["perfil"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.sucesso("Perfil atualizado com sucesso!");
    },
    onError: (err: any) => toast.erro(err.response?.data?.erro || "Erro ao atualizar perfil")
  });

  const handleSalvarInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutacao.mutate({ nome, email });
  };

  const handleAlterarSenha = (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha.length < 6) {
      toast.erro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha === "12345678") {
      toast.erro("Não pode usar a senha padrão. Escolha uma senha pessoal.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast.erro("As senhas não coincidem.");
      return;
    }
    updateMutacao.mutate({ nome, email, password: novaSenha }, {
      onSuccess: () => {
        setSenhaAtual(""); setNovaSenha(""); setConfirmarSenha("");
      }
    });
  };

  const forcaSenha = novaSenha.length >= 12 ? 4 : novaSenha.length >= 8 ? 3 : novaSenha.length >= 6 ? 2 : novaSenha.length > 0 ? 1 : 0;
  const forcaCores = ["", "var(--danger)", "var(--warning)", "var(--info)", "var(--success)"];
  const forcaLabels = ["", "Fraca", "Aceitável", "Boa", "Forte"];

  if (isLoading || !perfil) return (
    <div style={{ padding: 32, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
      <div style={{ color: "var(--text-muted)" }}>A carregar perfil...</div>
    </div>
  );

  return (
    <>
      <PageHeader title="O Meu Perfil" breadcrumb={[{ label: "Perfil" }]} />

      <div className="page-body">
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }}>

          {/* Cartão Lateral */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card" style={{ textAlign: "center", padding: "32px 24px" }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: `linear-gradient(135deg, ${papelCor[perfil.papel] || "var(--accent)"} 0%, rgba(0,0,0,0.3) 100%)`,
                margin: "0 auto 16px",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 8px 24px ${papelCor[perfil.papel] || "var(--accent)"}40`
              }}>
                <User size={36} color="#fff" />
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>{perfil.nome}</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16, fontFamily: "var(--font-mono)" }}>{perfil.email}</p>
              <span style={{
                display: "inline-block",
                background: `${papelCor[perfil.papel] || "var(--accent)"}18`,
                color: papelCor[perfil.papel] || "var(--accent)",
                padding: "4px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em"
              }}>
                {papelLabel[perfil.papel] || perfil.papel}
              </span>
            </div>

            {/* Metadata */}
            <div className="card" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Shield size={14} color="var(--text-faint)" />
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", fontWeight: 600 }}>Papel de Acesso</div>
                    <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{papelLabel[perfil.papel] || perfil.papel}</div>
                  </div>
                </div>
                <div style={{ borderTop: "1px solid var(--border)" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Calendar size={14} color="var(--text-faint)" />
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", fontWeight: 600 }}>Conta Criada</div>
                    <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>
                      {perfil.criado_em ? new Date(perfil.criado_em).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" }) : "—"}
                    </div>
                  </div>
                </div>
                <div style={{ borderTop: "1px solid var(--border)" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CheckCircle size={14} color={perfil.activo ? "var(--success)" : "var(--danger)"} />
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", fontWeight: 600 }}>Estado da Conta</div>
                    <div style={{ fontSize: 13, color: perfil.activo ? "var(--success)" : "var(--danger)", fontWeight: 600 }}>
                      {perfil.activo ? "Ativa" : "Inativa"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Painel de Configurações */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
              {[
                { id: "info", label: "Informação Pessoal", icon: User },
                { id: "senha", label: "Alterar Palavra-passe", icon: Key },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTabActiva(id as any)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "14px 20px", fontSize: 13, fontWeight: 600,
                    color: tabActiva === id ? "var(--accent)" : "var(--text-muted)",
                    background: "transparent", border: "none", cursor: "pointer",
                    borderBottom: tabActiva === id ? "2px solid var(--accent)" : "2px solid transparent",
                    marginBottom: -1, transition: "all 0.2s"
                  }}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {/* Tab: Info */}
            {tabActiva === "info" && (
              <form onSubmit={handleSalvarInfo} style={{ padding: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                  <div className="form-group">
                    <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <User size={13} /> Nome Completo
                    </label>
                    <input
                      className="form-input"
                      value={nome}
                      onChange={e => setNome(e.target.value)}
                      placeholder="O seu nome completo"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Mail size={13} /> E-mail Principal
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="email@jwpub.org"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, marginBottom: 24 }}>
                  <Shield size={14} color="var(--text-faint)" />
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                    O papel de acesso <strong>{papelLabel[perfil.papel]}</strong> só pode ser alterado por um Administrador.
                  </p>
                </div>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" className="btn btn-primary" disabled={updateMutacao.isPending}>
                    {updateMutacao.isPending ? "A guardar..." : "Guardar Alterações"}
                  </button>
                </div>
              </form>
            )}

            {/* Tab: Senha */}
            {tabActiva === "senha" && (
              <form onSubmit={handleAlterarSenha} style={{ padding: 24 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }}>
                  <div className="form-group">
                    <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Key size={13} /> Nova Palavra-passe
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      value={novaSenha}
                      onChange={e => setNovaSenha(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                    {/* Indicador de força */}
                    {novaSenha.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{
                              flex: 1, height: 3, borderRadius: 99,
                              background: i <= forcaSenha ? forcaCores[forcaSenha] : "var(--border)",
                              transition: "background 0.3s"
                            }} />
                          ))}
                        </div>
                        <span style={{ fontSize: 11, color: forcaCores[forcaSenha] || "var(--text-faint)", fontWeight: 600 }}>
                          {forcaLabels[forcaSenha]}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Key size={13} /> Confirmar Palavra-passe
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      value={confirmarSenha}
                      onChange={e => setConfirmarSenha(e.target.value)}
                      placeholder="Repita a nova senha"
                      required
                    />
                    {confirmarSenha && novaSenha !== confirmarSenha && (
                      <p style={{ fontSize: 11, color: "var(--danger)", marginTop: 4 }}>As senhas não coincidem.</p>
                    )}
                    {confirmarSenha && novaSenha === confirmarSenha && novaSenha.length >= 6 && (
                      <p style={{ fontSize: 11, color: "var(--success)", marginTop: 4 }}>✓ As senhas coincidem.</p>
                    )}
                  </div>
                </div>

                <div style={{ padding: "12px 16px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 8, marginTop: 8, marginBottom: 24 }}>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                    Após alterar a senha, será necessário fazer login novamente na próxima sessão.
                  </p>
                </div>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={updateMutacao.isPending || novaSenha !== confirmarSenha || novaSenha.length < 6}
                  >
                    {updateMutacao.isPending ? "A alterar..." : "Alterar Palavra-passe"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
