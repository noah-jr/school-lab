"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Lock, AlertTriangle } from "lucide-react";
import { useState } from "react";
import api from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";

export default function MudarSenhaPage() {
  const router = useRouter();
  const { data: user, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (!isLoading && user && !user.precisa_mudar_senha) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (senha === "12345678") {
      setErro("Não pode usar a senha padrão. Escolha uma senha pessoal.");
      return;
    }
    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await api.patch("/perfil", { password: senha, nome: user?.nome, email: user?.email });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      setSucesso(true);
      setTimeout(() => router.replace("/dashboard"), 1500);
    } catch (err: any) {
      setErro(err.response?.data?.erro || "Erro ao alterar a senha.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>A carregar...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100dvh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Glow de fundo */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "50vw", height: "50vh",
        background: "radial-gradient(circle, rgba(234, 88, 12, 0.06) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      <div style={{
        width: "100%", maxWidth: 420,
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "40px 32px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        position: "relative",
        zIndex: 10,
        animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        {/* Barra de topo laranja */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: "var(--warning)", borderRadius: "16px 16px 0 0"
        }} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: "rgba(234, 88, 12, 0.08)",
            border: "1px solid rgba(234, 88, 12, 0.2)",
            borderRadius: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            <Lock size={24} color="var(--warning)" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 6, letterSpacing: "-0.02em" }}>
            Alterar Palavra-passe
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Por questões de segurança, é obrigatório definir uma <strong>senha pessoal</strong> antes de aceder ao sistema.
          </p>
        </div>

        {/* Aviso */}
        <div style={{
          display: "flex", gap: 10, alignItems: "flex-start",
          background: "rgba(234, 88, 12, 0.06)",
          border: "1px solid rgba(234, 88, 12, 0.15)",
          borderRadius: 8, padding: "10px 14px",
          marginBottom: 24
        }}>
          <AlertTriangle size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.5 }}>
            A senha padrão <strong>12345678</strong> foi atribuída pelo administrador. Crie uma senha segura que só você conheça.
          </p>
        </div>

        {/* Erro */}
        {erro && (
          <div style={{
            background: "rgba(224,92,106,0.1)", color: "var(--danger)",
            padding: "10px 14px", borderRadius: 8, fontSize: 13,
            marginBottom: 20, border: "1px solid rgba(224,92,106,0.2)"
          }}>
            {erro}
          </div>
        )}

        {/* Sucesso */}
        {sucesso && (
          <div style={{
            background: "rgba(16,185,129,0.1)", color: "var(--success)",
            padding: "10px 14px", borderRadius: 8, fontSize: 13,
            marginBottom: 20, border: "1px solid rgba(16,185,129,0.2)",
            textAlign: "center", fontWeight: 600
          }}>
            ✓ Senha alterada! A redirecionar...
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Nova Palavra-passe</label>
            <input
              type="password"
              className="form-input"
              placeholder="Mínimo 6 caracteres"
              required
              value={senha}
              onChange={e => setSenha(e.target.value)}
              autoFocus
              style={{ padding: "12px 14px", fontSize: 14 }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar Palavra-passe</label>
            <input
              type="password"
              className="form-input"
              placeholder="Repita a senha"
              required
              value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
              style={{ padding: "12px 14px", fontSize: 14 }}
            />
          </div>

          {/* Indicador de força */}
          {senha.length > 0 && (
            <div style={{ display: "flex", gap: 4, marginTop: -8 }}>
              {[1, 2, 3, 4].map(i => {
                const forca = senha.length >= 12 ? 4 : senha.length >= 8 ? 3 : senha.length >= 6 ? 2 : 1;
                const cores = ["var(--danger)", "var(--warning)", "var(--info)", "var(--success)"];
                return (
                  <div key={i} style={{
                    flex: 1, height: 3, borderRadius: 99,
                    background: i <= forca ? cores[forca - 1] : "var(--border)",
                    transition: "background 0.3s"
                  }} />
                );
              })}
              <span style={{ fontSize: 10, color: "var(--text-faint)", marginLeft: 4, alignSelf: "center" }}>
                {senha.length >= 12 ? "Forte" : senha.length >= 8 ? "Boa" : senha.length >= 6 ? "Aceitável" : "Fraca"}
              </span>
            </div>
          )}

          <button
            type="submit"
            className={`btn btn-primary w-full ${loading ? "btn-loading" : ""}`}
            disabled={loading || sucesso}
            style={{ padding: "12px", fontSize: 15, justifyContent: "center", borderRadius: 8, marginTop: 8 }}
          >
            {loading ? "A guardar..." : "Definir Nova Palavra-passe"}
          </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .w-full { width: 100%; }
      ` }} />
    </div>
  );
}
