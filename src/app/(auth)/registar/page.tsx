"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function RegistarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    try {
      const res = await api.post("/auth/registar", { nome, email, password });
      setSucesso(true);
    } catch (err: any) {
      setErro(err.response?.data?.erro || "Erro ao criar conta.");
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
          <div className="auth-icon"><UserPlus size={20} color="var(--accent)" /></div>
          <h1 className="auth-title">Nova Conta</h1>
          <p className="auth-subtitle">Criação de acesso institucional (Secretaria)</p>
        </div>

        {erro && (
          <div style={{ backgroundColor: "rgba(224,92,106,0.1)", color: "var(--danger)", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "20px", border: "1px solid rgba(224,92,106,0.2)" }}>
            {erro}
          </div>
        )}

        {sucesso ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "var(--success)", padding: "16px", borderRadius: "8px", fontSize: "14px", marginBottom: "24px", border: "1px solid rgba(16,185,129,0.2)" }}>
              Conta registada com sucesso! O seu acesso será avaliado e ativado pela Administração.
            </div>
            <Link href="/login" className="btn btn-primary w-full" style={{ padding: "12px", justifyContent: "center" }}>
              Ir para o Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ex: João Silva" 
                required 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={{ padding: "12px 14px", fontSize: "14px" }}
              />
            </div>

            <div className="form-group">
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

            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label className="form-label">Palavra-passe</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                required 
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ padding: "12px 14px", fontSize: "14px" }}
              />
            </div>

            <button 
              type="submit" 
              className={`btn btn-primary w-full ${loading ? "btn-loading" : ""}`}
              style={{ padding: "12px", fontSize: "15px", justifyContent: "center", borderRadius: "8px" }}
              disabled={loading}
            >
              {loading ? "A processar..." : "Registar Conta"} <ArrowRight size={16} />
            </button>
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
