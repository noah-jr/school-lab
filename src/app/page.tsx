"use client";
import Link from "next/link";
import { BookOpen, Users, ShieldCheck, ArrowRight, Sparkles, Upload } from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadStatus("idle");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("tipo_upload", "outro");

    try {
      const res = await fetch("/api/public/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setUploadStatus("success");
        setFile(null);
      } else {
        setUploadStatus("error");
      }
    } catch {
      setUploadStatus("error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="landing-container">
      {/* Background Effects */}
      <div className="bg-glow"></div>
      <div className="bg-grid"></div>

      {/* Header Público */}
      <header className="landing-header">
        <div className="landing-logo">
          <div className="landing-logo-icon"><Sparkles size={20} color="#fff" /></div>
          <span className="landing-logo-text">EAC Lab</span>
        </div>
        <nav className="landing-nav">
          <Link href="/login" className="btn btn-ghost btn-sm">Acesso Reservado</Link>
          <Link href="/login" className="btn btn-primary btn-sm">Entrar <ArrowRight size={14} style={{ marginLeft: 4 }} /></Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="landing-main">
        <div className="hero-section">
          <div className="hero-badge">✨ Plataforma Inteligente de Designações</div>
          <h1 className="hero-title">
            Designação Automática para a<br />
            <span className="text-gradient">Escola de Anciãos</span>
          </h1>
          <p className="hero-subtitle">
            Insira os oradores, a sua congregação e o nível de oratória (A, B, C). O sistema encarrega-se de gerar o programa de <strong>Segunda a Quinta-feira</strong> automaticamente.
          </p>
          <div className="hero-actions" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", gap: "16px" }}>
              <Link href="/login" className="btn btn-primary" style={{ padding: "14px 28px", fontSize: "15px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(30, 64, 175, 0.2)" }}>
                Aceder ao Painel <ArrowRight size={18} style={{ marginLeft: 8 }} />
              </Link>
            </div>
            
            {/* Secção de Upload Público */}
            <div style={{ marginTop: "32px", padding: "24px", background: "rgba(255,255,255,0.8)", borderRadius: "12px", border: "1px dashed var(--border)", width: "100%", maxWidth: "400px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px", color: "var(--text)" }}>Envio de Documentos (Anciãos)</h3>
              <input type="file" id="public-upload" onChange={handleFileChange} style={{ display: "none" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label htmlFor="public-upload" className="btn btn-ghost" style={{ border: "1px solid var(--border)", cursor: "pointer", display: "flex", justifyContent: "center", gap: "8px" }}>
                  <Upload size={16} /> {file ? file.name : "Selecionar Ficheiro"}
                </label>
                <button 
                  onClick={handleUpload} 
                  disabled={!file || uploading} 
                  className="btn btn-primary" 
                  style={{ opacity: (!file || uploading) ? 0.5 : 1 }}
                >
                  {uploading ? "A Enviar..." : "Submeter Documento"}
                </button>
                {uploadStatus === "success" && <p style={{ color: "var(--success)", fontSize: "13px", marginTop: "8px" }}>Documento enviado com sucesso!</p>}
                {uploadStatus === "error" && <p style={{ color: "var(--danger)", fontSize: "13px", marginTop: "8px" }}>Erro ao enviar. Tente novamente.</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon" style={{ background: "rgba(30, 64, 175, 0.1)", border: "1px solid rgba(30, 64, 175, 0.2)" }}><Users color="var(--accent)" size={24} /></div>
            <h3 className="feature-title">Base de Dados Detalhada</h3>
            <p className="feature-desc">Registe nomes, congregações e níveis de oratória precisos (A, B, C, com suporte a + e - para clarificação fina).</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ background: "rgba(21, 128, 61, 0.1)", border: "1px solid rgba(21, 128, 61, 0.2)" }}><ShieldCheck color="var(--success)" size={24} /></div>
            <h3 className="feature-title">Motor de Regras Estritas</h3>
            <p className="feature-desc">Garante que nenhum orador tem mais de uma parte por dia (Seg-Qui) e cruza o nível do orador com o nível exigido pela parte.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ background: "rgba(3, 105, 161, 0.1)", border: "1px solid rgba(3, 105, 161, 0.2)" }}><BookOpen color="var(--info)" size={24} /></div>
            <h3 className="feature-title">Agrupamento Inteligente</h3>
            <p className="feature-desc">Para demonstrações e partes conjuntas, o algoritmo agrupa automaticamente intervenientes da mesma congregação ou de vizinhas.</p>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .landing-container {
          min-height: 100dvh;
          background: var(--bg);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        .bg-glow {
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 80vw;
          height: 60vh;
          background: radial-gradient(ellipse at center, rgba(30, 64, 175, 0.08) 0%, transparent 70%);
          z-index: 0;
          pointer-events: none;
        }
        .bg-grid {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(circle at center, black, transparent 80%);
          -webkit-mask-image: radial-gradient(circle at center, black, transparent 80%);
          z-index: 0;
          pointer-events: none;
        }
        .landing-header, .landing-main {
          position: relative;
          z-index: 10;
        }
        .landing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 48px;
          border-bottom: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .landing-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .landing-logo-icon {
          width: 36px; height: 36px;
          background: var(--accent);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 6px rgba(30, 64, 175, 0.2);
        }
        .landing-logo-text {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text);
        }
        .landing-nav {
          display: flex;
          gap: 12px;
        }
        .landing-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 100px 24px;
        }
        .hero-section {
          text-align: center;
          max-width: 860px;
          margin-bottom: 80px;
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 99px;
          color: var(--accent);
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 32px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .hero-title {
          font-size: 64px;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.04em;
          color: var(--text);
          margin-bottom: 24px;
        }
        .text-gradient {
          background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          font-size: 20px;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 48px;
          max-width: 640px;
          margin-inline: auto;
          font-weight: 400;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          width: 100%;
          max-width: 1100px;
          animation: slideUp 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .feature-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          padding: 40px 32px;
          border-radius: 12px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
        }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 3px;
          background: var(--accent);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          border-color: var(--border-hover);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }
        .feature-card:hover::before {
          opacity: 1;
        }
        .feature-icon {
          width: 56px; height: 56px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px;
        }
        .feature-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 12px;
          letter-spacing: -0.01em;
        }
        .feature-desc {
          font-size: 15px;
          color: var(--text-muted);
          line-height: 1.6;
        }
        
        @media (max-width: 768px) {
          .hero-title { font-size: 44px; }
          .landing-header { padding: 20px; flex-direction: column; gap: 16px; }
          .hero-subtitle { font-size: 16px; }
          .landing-main { padding: 60px 20px; }
        }
      `}} />
    </div>
  );
}

