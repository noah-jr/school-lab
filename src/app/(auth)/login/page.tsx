"use client";
import { useState } from "react";
import { ArrowRight, ArrowLeft, Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { Logo } from "@/components/ui/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const handleVerificarEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErro("");
    try {
      const { data } = await api.post("/auth/verificar-email", { email });
      if (data.existe) setStep(2);
      else setErro("Email não encontrado no sistema.");
    } catch (err: any) {
      setErro(err.response?.data?.erro || "Erro ao verificar email");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    try {
      await api.post("/auth/login", { email, password });
      router.push("/dashboard");
    } catch (err: any) {
      setErro(err.response?.data?.erro || "Erro ao iniciar sessão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Link href="/" className="auth-back">
        <ArrowLeft size={16} /> Voltar para o início
      </Link>

      <div className="auth-sidebar">
        <div className="auth-sidebar-glow"></div>
        <div className="auth-sidebar-content">
          <Logo size="lg" className="logo-sidebar" subtitle="Gestão Digital" />
          
          <div className="auth-sidebar-hero">
            <h1>Portal de Administração e Designações</h1>
            <p>
              Acesso exclusivo para administradores, instrutores e anciãos designados para a coordenação de turmas e oradores.
            </p>
          </div>

          <div className="auth-sidebar-features">
            <div className="sidebar-feature-item">
              <span className="sidebar-feature-dot"></span>
              <div>
                <strong>Segurança Encriptada</strong>
                <p>Ligação segura de ponta a ponta com auditoria ativa.</p>
              </div>
            </div>
            <div className="sidebar-feature-item">
              <span className="sidebar-feature-dot"></span>
              <div>
                <strong>Automação de Designações</strong>
                <p>Geração inteligente respeitando critérios de periodicidade.</p>
              </div>
            </div>
          </div>

          <div className="auth-sidebar-footer">
            <span>© {new Date().getFullYear()} School-Lab. Todos os direitos reservados.</span>
            <span style={{ display: "block", marginTop: "4px" }}>
              Desenvolvimento por <strong>VA TECH INTERPRISES</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="auth-form-section">
        <div className="auth-glow"></div>
        <div className="auth-glow-2"></div>
        
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Acesso Restrito</h1>
            <p className="auth-subtitle">Introduza os dados da sua conta institucional</p>
          </div>

          {erro && (
            <div className="error-banner">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{erro}</span>
            </div>
          )}

          <form onSubmit={step === 1 ? handleVerificarEmail : handleSubmit} className="auth-form">
            {step === 1 ? (
              <div className="form-group">
                <label className="form-label">Email Institucional</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="exemplo@school-lab.ao" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
            ) : (
              <div className="user-verified-badge">
                <div className="user-avatar-initial">
                  {email.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <span className="user-email">{email}</span>
                  <button
                    type="button"
                    onClick={() => { setStep(1); setPassword(""); setErro(""); }}
                    className="user-change-btn"
                  >
                    Alterar e-mail
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="form-group">
                <label className="form-label">Palavra-passe</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-input" 
                    placeholder="••••••••" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    style={{ paddingRight: "44px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="input-toggle-pwd"
                    aria-label={showPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary-full"
              disabled={loading}
              style={{ marginTop: "8px" }}
            >
              {loading ? (
                <span>Aguarde...</span>
              ) : (
                <>
                  {step === 1 ? "Continuar" : "Entrar no Sistema"} <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="auth-security-notice">
            <span className="security-icon">🔒</span>
            <p>Este é um portal privado de acesso regulado. Todo o tráfego é auditado.</p>
          </div>
          <div className="auth-mobile-footer">
            <span>© {new Date().getFullYear()} School-Lab</span>
            <span style={{ margin: "0 8px", opacity: 0.5 }}>•</span>
            <span>Desenvolvimento por <strong>VA TECH INTERPRISES</strong></span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .auth-container {
          min-height: 100dvh;
          background: var(--bg);
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          transition: background 0.3s ease;
        }

        /* LEFT SIDEBAR (BRANDING) */
        .auth-sidebar {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 64px 80px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        [data-theme="dark"] .auth-sidebar {
          background: linear-gradient(135deg, #0b0f19 0%, #111827 100%);
        }
        .auth-sidebar-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
          top: -100px;
          left: -100px;
          pointer-events: none;
        }
        .auth-sidebar-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: space-between;
          z-index: 10;
        }
        .auth-sidebar .logo-sidebar div {
          color: #94a3b8 !important;
        }
        .auth-sidebar-hero {
          margin: auto 0;
        }
        .auth-sidebar-hero h1 {
          font-size: 38px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin-bottom: 20px;
        }
        .auth-sidebar-hero p {
          font-size: 16px;
          line-height: 1.6;
          color: #94a3b8;
          max-width: 460px;
        }
        .auth-sidebar-features {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: auto;
          margin-top: 48px;
        }
        .sidebar-feature-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .sidebar-feature-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #3b82f6;
          margin-top: 8px;
          flex-shrink: 0;
          box-shadow: 0 0 8px #3b82f6;
        }
        .sidebar-feature-item strong {
          color: #f1f5f9;
          font-size: 15px;
          display: block;
          margin-bottom: 4px;
        }
        .sidebar-feature-item p {
          color: #64748b;
          font-size: 13px;
          line-height: 1.5;
        }
        .auth-sidebar-footer {
          font-size: 13px;
          color: #475569;
        }

        /* RIGHT FORM SECTION */
        .auth-form-section {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 64px 48px;
          position: relative;
        }
        .auth-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(30, 64, 175, 0.05) 0%, transparent 70%);
          top: -150px;
          right: -150px;
          pointer-events: none;
        }
        .auth-glow-2 {
          position: absolute;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(234, 88, 12, 0.02) 0%, transparent 70%);
          bottom: -150px;
          left: -150px;
          pointer-events: none;
        }

        .auth-back {
          position: absolute;
          top: 24px;
          right: 24px;
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          z-index: 20;
          padding: 8px 16px;
          border-radius: 99px;
          border: 1px solid var(--border);
          background: var(--bg-surface);
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          cursor: pointer;
        }
        .auth-back:hover {
          color: var(--text);
          transform: translateX(-4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .auth-card {
          width: 100%;
          max-width: 400px;
          z-index: 10;
        }
        .auth-header {
          margin-bottom: 32px;
        }
        .auth-title {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text);
          margin-bottom: 8px;
        }
        .auth-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Form Controls */
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-faint);
          pointer-events: none;
        }
        .form-input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          color: var(--text);
          border-radius: 10px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .form-input:focus {
          border-color: var(--accent);
          background: var(--bg-surface);
          box-shadow: 0 0 0 3px var(--accent-bg);
        }

        /* Verified Badge */
        .user-verified-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 4px;
        }
        .user-avatar-initial {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--accent);
          color: white;
          font-weight: 700;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(59, 130, 246, 0.25);
        }
        .user-details {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .user-email {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          word-break: break-all;
        }
        .user-change-btn {
          font-size: 12px;
          font-weight: 500;
          color: var(--accent);
          background: none;
          border: none;
          cursor: pointer;
          align-self: flex-start;
          padding: 0;
          margin-top: 2px;
          transition: opacity 0.2s;
        }
        .user-change-btn:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        .btn-primary-full {
          width: 100%;
          padding: 14px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }
        .btn-primary-full:hover:not(:disabled) {
          background: var(--accent-dim);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
        }
        .btn-primary-full:active:not(:disabled) {
          transform: translateY(0);
        }
        .btn-primary-full:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .input-toggle-pwd {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          color: var(--text-faint);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: color 0.2s;
        }
        .input-toggle-pwd:hover {
          color: var(--text);
        }

        .error-banner {
          background-color: rgba(241, 76, 76, 0.06);
          color: var(--danger);
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          margin-bottom: 24px;
          border: 1px solid rgba(241, 76, 76, 0.15);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .auth-security-notice {
          display: flex;
          gap: 12px;
          align-items: center;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          padding: 12px 16px;
          border-radius: 10px;
          margin-top: 28px;
        }
        .security-icon {
          font-size: 16px;
        }
        .auth-security-notice p {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.4;
          margin: 0;
        }

        .auth-mobile-footer {
          display: none;
        }

        /* RESPONSIVE */
        @media (max-width: 968px) {
          .auth-container {
            grid-template-columns: 1fr;
          }
          .auth-sidebar {
            display: none;
          }
          .auth-form-section {
            padding: 96px 24px 48px;
            flex-direction: column;
            justify-content: space-between;
            min-height: 100dvh;
          }
          .auth-card {
            margin: auto 0;
          }
          .auth-back {
            top: 24px;
            left: 24px;
            right: auto;
          }
          .auth-mobile-footer {
            display: flex !important;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            font-size: 12px;
            color: var(--text-muted);
            margin-top: 32px;
            text-align: center;
            z-index: 10;
          }
          .auth-mobile-footer strong {
            color: var(--text);
          }
        }
      `}} />
    </div>
  );
}
