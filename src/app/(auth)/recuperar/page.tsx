"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function RecuperarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Fase 1: Pedir email
  const [email, setEmail] = useState("");
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  
  // Fase 2: Validar OTP e Nova Password
  const [codigo, setCodigo] = useState("");
  const [novaPassword, setNovaPassword] = useState("");
  
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handlePedirOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    try {
      const res = await api.post("/auth/recuperar", { email });
      setCodigoEnviado(true);
      setSucesso(res.data.mensagem);
    } catch (err: any) {
      setErro(err.response?.data?.erro || "Erro ao pedir recuperação.");
    } finally {
      setLoading(false);
    }
  };

  const handleRedefinir = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    setSucesso("");
    try {
      const res = await api.post("/auth/reset", { email, codigo, novaPassword });
      setSucesso(res.data.mensagem);
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err: any) {
      setErro(err.response?.data?.erro || "Erro ao atualizar a password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-glow"></div>
      <Link href="/login" className="auth-back">← Voltar ao Login</Link>
      
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon"><KeyRound size={20} color="var(--accent)" /></div>
          <h1 className="auth-title">Recuperação de Acesso</h1>
          <p className="auth-subtitle">Restabeleça a sua password via OTP</p>
        </div>

        {erro && (
          <div style={{ backgroundColor: "rgba(224,92,106,0.1)", color: "var(--danger)", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "20px", border: "1px solid rgba(224,92,106,0.2)" }}>
            {erro}
          </div>
        )}

        {sucesso && !codigoEnviado && (
          <div style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "var(--success)", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "20px", border: "1px solid rgba(16,185,129,0.2)" }}>
            {sucesso}
          </div>
        )}

        {!codigoEnviado ? (
          <form onSubmit={handlePedirOTP} className="auth-form">
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px", lineHeight: 1.5 }}>
              Introduza o endereço de correio eletrónico associado à sua conta. Enviaremos um código temporário de 6 dígitos para o ajudar a redefinir a sua senha.
            </p>
            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label className="form-label">Email Institucional</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="exemplo@jwpub.org" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: "12px 14px", fontSize: "14px" }}
              />
            </div>

            <button 
              type="submit" 
              className={`btn btn-primary w-full ${loading ? "btn-loading" : ""}`}
              style={{ padding: "12px", fontSize: "15px", justifyContent: "center", borderRadius: "8px" }}
              disabled={loading}
            >
              {loading ? "A verificar..." : "Pedir Código OTP"} <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRedefinir} className="auth-form">
            <div style={{ backgroundColor: "var(--bg-elevated)", padding: "12px 16px", borderRadius: "6px", marginBottom: "16px", border: "1px dashed var(--border)" }}>
              <span style={{ fontSize: "12px", color: "var(--text-faint)", textTransform: "uppercase", fontWeight: 600 }}>Email Alvo</span>
              <div style={{ fontSize: "14px", color: "var(--text)", fontWeight: 500, marginTop: "4px" }}>{email}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Código OTP (6 dígitos)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="000000" 
                required 
                maxLength={6}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/[^0-9]/g, ''))}
                style={{ padding: "12px 14px", fontSize: "18px", letterSpacing: "0.2em", textAlign: "center", fontFamily: "var(--font-mono)" }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label className="form-label">Nova Palavra-passe</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                required 
                minLength={6}
                value={novaPassword}
                onChange={(e) => setNovaPassword(e.target.value)}
                style={{ padding: "12px 14px", fontSize: "14px" }}
              />
            </div>

            <button 
              type="submit" 
              className={`btn btn-primary w-full ${loading ? "btn-loading" : ""}`}
              style={{ padding: "12px", fontSize: "15px", justifyContent: "center", borderRadius: "8px", background: "var(--success)" }}
              disabled={loading}
            >
              {loading ? "A validar..." : "Atualizar Palavra-passe"} <KeyRound size={16} />
            </button>
            {sucesso && <div style={{ textAlign: "center", color: "var(--success)", fontSize: "13px", marginTop: "12px", fontWeight: 500 }}>{sucesso}</div>}
          </form>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .auth-container {
          min-height: 100dvh;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 24px;
          overflow: hidden;
        }
        .auth-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 50vw;
          height: 50vh;
          background: radial-gradient(circle, rgba(30, 64, 175, 0.08) 0%, transparent 70%);
          z-index: 0;
          pointer-events: none;
        }
        .auth-back {
          position: absolute;
          top: 32px;
          left: 32px;
          color: var(--text-muted);
          font-size: 13px;
          transition: color 0.2s;
          z-index: 10;
        }
        .auth-back:hover { color: var(--text); }
        .auth-card {
          width: 100%;
          max-width: 400px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 40px 32px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05), 0 4px 6px -1px rgba(0,0,0,0.02);
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 10;
          position: relative;
        }
        .auth-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 3px;
          background: var(--accent);
          border-radius: 16px 16px 0 0;
        }
        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .auth-icon {
          width: 56px; height: 56px;
          background: rgba(30, 64, 175, 0.05);
          border: 1px solid rgba(30, 64, 175, 0.1);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 4px 8px rgba(30, 64, 175, 0.05);
        }
        .auth-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 6px;
          letter-spacing: -0.02em;
        }
        .auth-subtitle {
          font-size: 14px;
          color: var(--text-muted);
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .w-full { width: 100%; }
      `}} />
    </div>
  );
}
