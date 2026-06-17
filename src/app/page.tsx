"use client";
import Link from "next/link";
import { ArrowRight, Upload, MessageSquare, Send, CheckCircle, Zap, Shield, Layout, FileText, ChevronRight, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { Logo } from "@/components/ui/Logo";

export default function LandingPage() {
  const [theme, setTheme] = useState("light");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    // Registar visita pública do internauta
    fetch("/api/public/visitor-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pagina: "Apresentação (Landing Page)" }),
    }).catch(err => console.error("Erro ao registar log de visitante", err));

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

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

  const [feedback, setFeedback] = useState({
    nome: "",
    email: "",
    congregacao: "",
    departamento: "suporte",
    mensagem_texto: "",
  });
  const [feedbackStatus, setFeedbackStatus] = useState<"idle" | "sending" | "success">("idle");

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackStatus("sending");

    const assuntoTexto = feedback.departamento === "suporte" 
      ? "Suporte Técnico" 
      : feedback.departamento === "sugestao" 
      ? "Sugestão de Melhoria" 
      : feedback.departamento === "regras"
      ? "Questões de Regras/Escola"
      : "Outro Assunto";
      
    const mensagemFormatada = `Área: ${assuntoTexto}\nCongregação/Instituição: ${feedback.congregacao || "Não informada"}\n\nMensagem:\n${feedback.mensagem_texto}`;

    try {
      const res = await fetch("/api/public/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: feedback.nome,
          email: feedback.email,
          mensagem: mensagemFormatada,
        })
      });
      if (res.ok) {
        setFeedbackStatus("success");
        setFeedback({
          nome: "",
          email: "",
          congregacao: "",
          departamento: "suporte",
          mensagem_texto: "",
        });
        setTimeout(() => setFeedbackStatus("idle"), 3000);
      } else {
        setFeedbackStatus("idle");
        alert("Erro ao enviar solicitação.");
      }
    } catch {
      setFeedbackStatus("idle");
      alert("Erro de conexão ao servidor.");
    }
  };

  return (
    <div className="modern-landing">
      {/* Navbar */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">
          <Logo size="md" />
          <div className="navbar-actions">
            <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Alternar Tema">
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <Link href="/login" className="nav-link">Acesso Restrito</Link>
            <Link href="/login" className="btn-primary-sm">
              Entrar <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-grid">
            {/* Hero Text */}
            <div className="hero-text-col">
              <div className="badge">
                <span className="badge-dot"></span> School-Lab v0.1.0
              </div>
              <h1 className="hero-title">
                Gestão Institucional <br />
                <span className="text-gray">Simplificada.</span>
              </h1>
              <p className="hero-desc">
                Automatize a designação de oradores para a Escola de Anciãos. 
                Regras precisas, zero conflitos de horário e agrupamento inteligente.
              </p>
              
              <div className="hero-cta-group">
                <Link href="/login" className="btn-primary-lg">
                  Começar Agora <ArrowRight size={18} />
                </Link>
              </div>

              {/* Upload Box */}
              {/* <div className="upload-box">
                <div className="upload-header">
                  <FileText size={18} className="text-gray" />
                  <span className="upload-title">Envio de Documentos (Anciãos)</span>
                </div>
                <div className="upload-actions">
                  <input type="file" id="public-upload" onChange={handleFileChange} style={{ display: "none" }} />
                  <label htmlFor="public-upload" className="btn-outline">
                    {file ? file.name : "Selecionar Ficheiro..."}
                  </label>
                  <button 
                    onClick={handleUpload} 
                    disabled={!file || uploading} 
                    className="btn-solid"
                    style={{ opacity: (!file || uploading) ? 0.6 : 1 }}
                  >
                    {uploading ? "A Enviar..." : <Upload size={16} />}
                  </button>
                </div>
                {uploadStatus === "success" && <p className="status-success"><CheckCircle size={14}/> Enviado com sucesso</p>}
                {uploadStatus === "error" && <p className="status-error">Erro ao enviar ficheiro</p>}
              </div> */}
            </div>

            {/* Hero Visual Mockup */}
            <div className="hero-visual-col">
              <div className="mockup-window">
                <div className="mockup-header">
                  <div className="mac-dots">
                    <span className="mac-dot red"></span>
                    <span className="mac-dot yellow"></span>
                    <span className="mac-dot green"></span>
                  </div>
                  <div className="mockup-url">app.school-lab.ao</div>
                </div>
                <div className="mockup-body">
                  <div className="mockup-sidebar">
                    <div className="ms-item active"></div>
                    <div className="ms-item"></div>
                    <div className="ms-item"></div>
                  </div>
                  <div className="mockup-content">
                    <div className="mc-header">
                      <div className="mc-title"></div>
                      <div className="mc-badge"></div>
                    </div>
                    <div className="mc-grid">
                      <div className="mc-card">
                        <div className="mc-avatar"></div>
                        <div className="mc-lines">
                          <div className="mc-line short"></div>
                          <div className="mc-line long"></div>
                        </div>
                      </div>
                      <div className="mc-card">
                        <div className="mc-avatar"></div>
                        <div className="mc-lines">
                          <div className="mc-line short"></div>
                          <div className="mc-line long"></div>
                        </div>
                      </div>
                      <div className="mc-card">
                        <div className="mc-avatar"></div>
                        <div className="mc-lines">
                          <div className="mc-line short"></div>
                          <div className="mc-line long"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating element */}
              <div className="floating-badge">
                <CheckCircle size={16} color="#16a34a" />
                <span>Zero Conflitos Detectados</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="bento-section">
          <div className="bento-grid">
            <div className="bento-card large">
              <div className="bento-icon"><Zap size={24} /></div>
              <h3>Motor de Regras Inteligente</h3>
              <p>O algoritmo garante que nenhum orador tem mais de uma parte por dia (Seg-Qui) e cruza o nível do orador (A, B, C) com o exigido pela parte.</p>
              <div className="bento-visual rule-visual">
                <div className="rule-box green">Orador Nível A</div>
                <ArrowRight size={16} className="text-gray" />
                <div className="rule-box blue">Parte Exigência A/B</div>
              </div>
            </div>
            
            <div className="bento-card">
              <div className="bento-icon"><Shield size={24} /></div>
              <h3>Base de Dados Segura</h3>
              <p>Registe congregações, níveis de oratória e papéis (Ancião / Servo) de forma estruturada e privada.</p>
            </div>
            
            <div className="bento-card">
              <div className="bento-icon"><Layout size={24} /></div>
              <h3>Agrupamento Lógico</h3>
              <p>Agrupa automaticamente intervenientes da mesma congregação ou de congregações vizinhas.</p>
            </div>
          </div>
        </section>

        {/* Contact/Feedback Section */}
        <section className="contact-section">
          <div className="contact-container">
            <div className="contact-text">
              <div className="badge">
                <span className="badge-dot"></span> Canal Oficial
              </div>
              <h2>Solicitação & Suporte</h2>
              <p>
                Utilize este canal para comunicar com a administração da plataforma <strong>School-Lab</strong>. 
                As solicitações de suporte, sugestões de novos recursos ou relatos de anomalias no motor de designações são analisadas com máxima prioridade.
              </p>
              <div className="contact-info-list">
                <div className="contact-info-item">
                  <span className="contact-info-icon">✓</span>
                  <span>Tempo médio de resposta: 24 horas úteis.</span>
                </div>
                <div className="contact-info-item">
                  <span className="contact-info-icon">✓</span>
                  <span>Disponível para todos os Anciãos e Servos designados.</span>
                </div>
              </div>
            </div>
            
            <div className="contact-form-container">
              <form onSubmit={handleFeedbackSubmit} className="modern-form">
                <h3 className="form-header-title">Enviar Pedido</h3>
                
                <div className="form-row">
                  <div className="input-group">
                    <label>Nome Completo</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Ex: João da Silva" 
                      value={feedback.nome} 
                      onChange={e => setFeedback({...feedback, nome: e.target.value})} 
                    />
                  </div>
                  <div className="input-group">
                    <label>E-mail de Contacto</label>
                    <input 
                      required 
                      type="email" 
                      placeholder="Ex: joao.silva@jwpub.org" 
                      value={feedback.email} 
                      onChange={e => setFeedback({...feedback, email: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Congregação / Circuito</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Ex: Central / AO-02" 
                      value={feedback.congregacao} 
                      onChange={e => setFeedback({...feedback, congregacao: e.target.value})} 
                    />
                  </div>
                  <div className="input-group">
                    <label>Área de Interesse</label>
                    <select 
                      value={feedback.departamento} 
                      onChange={e => setFeedback({...feedback, departamento: e.target.value})}
                      className="form-select"
                    >
                      <option value="suporte">Suporte Técnico</option>
                      <option value="sugestao">Sugestão de Melhoria</option>
                      <option value="regras">Questões de Regras/Escola</option>
                      <option value="outro">Outro Assunto</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>Mensagem / Descrição do Pedido</label>
                  <textarea 
                    required 
                    placeholder="Descreva detalhadamente a sua solicitação..." 
                    rows={4} 
                    value={feedback.mensagem_texto} 
                    onChange={e => setFeedback({...feedback, mensagem_texto: e.target.value})} 
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={feedbackStatus === "sending" || feedbackStatus === "success"} 
                  className="btn-primary-full"
                >
                  {feedbackStatus === "sending" ? (
                    "A Enviar Pedido..."
                  ) : feedbackStatus === "success" ? (
                    "Solicitação Enviada!"
                  ) : (
                    <>
                      <MessageSquare size={16} /> Submeter Solicitação
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand-col">
              <Logo size="sm" />
              <p className="footer-brand-desc">
                Sistema avançado de gestão institucional para automação de designações, gerenciamento de turmas e relatórios congregacionais.
              </p>
            </div>
            <div className="footer-links-col">
              <h4>Links Úteis</h4>
              <ul>
                <li><Link href="/login">Acesso Restrito</Link></li>
                <li><Link href="/login">Painel de Controlo</Link></li>
              </ul>
            </div>
            <div className="footer-contact-col">
              <h4>Contacto</h4>
              <p>Email: suporte@school-lab.ao</p>
              <p>Localização: Luanda, Angola</p>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-text">
              @ {new Date().getFullYear()} School-Lab Angola. Todos os direitos reservados.
            </span>
            <span className="footer-credit">
              Desenvolvido por <strong>VATECH INTERPRISES</strong>
            </span>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        /* --- RESET & VARIABLES --- */
        .modern-landing {
          --bg: #FAFAFA;
          --surface: #FFFFFF;
          --border: #E5E7EB;
          --text: #111827;
          --text-gray: #6B7280;
          --primary: #0F172A;
          --primary-hover: #1E293B;
          --accent: #1D4ED8;
          --radius-md: 12px;
          --radius-lg: 24px;
          --navbar-bg: rgba(255, 255, 255, 0.7);
          --navbar-bg-scrolled: rgba(255, 255, 255, 0.8);
          --border-scrolled: rgba(229, 231, 235, 0.8);
          --mockup-bg-alt: #F9FAFB;
          --rule-green-text: #16a34a;
          --rule-green-bg: rgba(22, 163, 74, 0.1);
          --rule-blue-text: #1d4ed8;
          --rule-blue-bg: rgba(29, 78, 216, 0.1);
          
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          transition: background 0.3s ease, color 0.3s ease;
        }

        [data-theme="dark"] .modern-landing {
          --bg: #0b0f19;
          --surface: #111827;
          --border: #1f2937;
          --text: #f9fafb;
          --text-gray: #9ca3af;
          --primary: #f3f4f6;
          --primary-hover: #e5e7eb;
          --accent: #3b82f6;
          --navbar-bg: rgba(11, 15, 25, 0.7);
          --navbar-bg-scrolled: rgba(17, 24, 39, 0.8);
          --border-scrolled: rgba(31, 41, 55, 0.8);
          --mockup-bg-alt: #161f30;
          --rule-green-text: #4ade80;
          --rule-green-bg: rgba(74, 222, 128, 0.15);
          --rule-blue-text: #60a5fa;
          --rule-blue-bg: rgba(96, 165, 250, 0.15);
        }

        /* --- NAVBAR --- */
        .navbar {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 48px);
          max-width: 1200px;
          height: 72px;
          background: var(--navbar-bg);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 99px;
          z-index: 100;
          box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.02);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .navbar.scrolled {
          top: 12px;
          height: 64px;
          background: var(--navbar-bg-scrolled);
          border-color: var(--border-scrolled);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.12);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .navbar-container {
          max-width: 100%;
          width: 100%;
          height: 100%;
          padding: 0 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .theme-toggle-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid var(--border);
          color: var(--text);
          background: var(--surface);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .theme-toggle-btn:hover {
          background: var(--bg);
          transform: scale(1.05);
        }
        .nav-link {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-gray);
          text-decoration: none;
          transition: color 0.2s;
        }
        .nav-link:hover {
          color: var(--text);
        }
        .btn-primary-sm {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--primary);
          color: var(--surface);
          border: 1px solid var(--border);
          font-size: 14px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 99px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-primary-sm:hover {
          background: var(--primary-hover);
          transform: translateY(-1px);
        }

        /* --- MAIN LAYOUT --- */
        .main-content {
          padding-top: 112px;
          flex: 1;
        }

        /* --- HERO --- */
        .hero {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 24px;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        .hero-text-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 6px 14px;
          border-radius: 99px;
          margin-bottom: 32px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .badge-dot {
          width: 8px; height: 8px;
          background: var(--accent);
          border-radius: 50%;
        }
        .hero-title {
          font-size: 64px;
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.04em;
          margin-bottom: 24px;
        }
        .text-gray {
          color: var(--text-gray);
        }
        .hero-desc {
          font-size: 18px;
          line-height: 1.6;
          color: var(--text-gray);
          max-width: 480px;
          margin-bottom: 40px;
        }
        .btn-primary-lg {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--accent);
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          padding: 16px 32px;
          border-radius: 99px;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 8px 20px rgba(29, 78, 216, 0.25);
        }
        .btn-primary-lg:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(29, 78, 216, 0.3);
        }

        /* --- UPLOAD BOX --- */
        .upload-box {
          margin-top: 64px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 20px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
        }
        .upload-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }
        .upload-title {
          font-size: 14px;
          font-weight: 600;
        }
        .upload-actions {
          display: flex;
          gap: 12px;
        }
        .btn-outline {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 16px;
          background: var(--bg);
          border: 1px dashed #D1D5DB;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-gray);
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .btn-outline:hover {
          border-color: var(--text-gray);
          color: var(--text);
        }
        .btn-solid {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--primary);
          color: white;
          border: none;
          padding: 0 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-solid:hover:not(:disabled) {
          background: var(--primary-hover);
        }
        .status-success { color: #16a34a; font-size: 13px; margin-top: 12px; display: flex; align-items: center; gap: 6px; font-weight: 500; }
        .status-error { color: #dc2626; font-size: 13px; margin-top: 12px; font-weight: 500; }

        /* --- VISUAL MOCKUP --- */
        .hero-visual-col {
          position: relative;
          perspective: 1000px;
        }
        .mockup-window {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1);
          overflow: hidden;
          transform: rotateY(-5deg) rotateX(5deg) scale(0.95);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hero-visual-col:hover .mockup-window {
          transform: rotateY(0deg) rotateX(0deg) scale(1);
        }
        .mockup-header {
          height: 48px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          padding: 0 16px;
          background: var(--mockup-bg-alt);
        }
        .mac-dots { display: flex; gap: 6px; }
        .mac-dot { width: 10px; height: 10px; border-radius: 50%; }
        .mac-dot.red { background: #FF5F56; }
        .mac-dot.yellow { background: #FFBD2E; }
        .mac-dot.green { background: #27C93F; }
        .mockup-url {
          margin: 0 auto;
          background: var(--bg);
          padding: 4px 60px;
          border-radius: 6px;
          font-size: 12px;
          color: var(--text-gray);
          border: 1px solid var(--border);
          font-family: monospace;
        }
        .mockup-body {
          display: flex;
          height: 380px;
        }
        .mockup-sidebar {
          width: 80px;
          border-right: 1px solid var(--border);
          background: var(--mockup-bg-alt);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ms-item { height: 12px; border-radius: 4px; background: var(--border); }
        .ms-item.active { background: rgba(29, 78, 216, 0.2); }
        .mockup-content {
          flex: 1;
          padding: 24px;
          background: var(--surface);
        }
        .mc-header { display: flex; justify-content: space-between; margin-bottom: 24px; }
        .mc-title { width: 120px; height: 20px; background: var(--border); border-radius: 4px; }
        .mc-badge { width: 60px; height: 20px; background: rgba(22, 163, 74, 0.1); border-radius: 99px; }
        .mc-grid { display: flex; flex-direction: column; gap: 16px; }
        .mc-card {
          padding: 16px;
          border: 1px solid var(--border);
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .mc-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--bg); }
        .mc-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .mc-line { height: 8px; border-radius: 4px; background: var(--bg); }
        .mc-line.short { width: 40%; }
        .mc-line.long { width: 80%; background: var(--border); }
        
        .floating-badge {
          position: absolute;
          bottom: -20px;
          left: -30px;
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 12px 20px;
          border-radius: 99px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          animation: float 4s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        /* --- BENTO GRID --- */
        .bento-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 24px 80px;
        }
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: minmax(280px, auto);
          gap: 24px;
        }
        .bento-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 32px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
          transition: border-color 0.2s;
        }
        .bento-card:hover { border-color: #D1D5DB; }
        .bento-card.large {
          grid-column: span 2;
        }
        .bento-icon {
          width: 48px; height: 48px;
          background: var(--bg);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px;
          color: var(--primary);
        }
        .bento-card h3 {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
        }
        .bento-card p {
          font-size: 15px;
          color: var(--text-gray);
          line-height: 1.6;
        }
        .rule-visual {
          margin-top: auto;
          padding-top: 32px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .rule-box {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
        }
        .rule-box.green { background: var(--rule-green-bg); color: var(--rule-green-text); }
        .rule-box.blue { background: var(--rule-blue-bg); color: var(--rule-blue-text); }

        /* --- CONTACT --- */
        .contact-section {
          background: var(--surface);
          border-top: 1px solid var(--border);
          padding: 100px 24px;
        }
        .contact-container {
          max-width: 1000px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 64px;
          align-items: center;
        }
        .contact-text h2 {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 16px;
        }
        .contact-text p {
          font-size: 16px;
          color: var(--text-gray);
          line-height: 1.6;
        }
        .modern-form {
          background: var(--bg);
          padding: 32px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .input-group label {
          font-size: 13px;
          font-weight: 600;
          color: var(--primary);
        }
        .input-group input, .input-group textarea {
          width: 100%;
          padding: 12px 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text);
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .input-group input::placeholder, .input-group textarea::placeholder {
          color: var(--text-gray);
          opacity: 0.8;
        }
        .input-group input:focus, .input-group textarea:focus, .modern-form select.form-select:focus {
          border-color: var(--accent);
        }
        .modern-form select.form-select {
          width: 100%;
          padding: 12px 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text);
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 16px;
          padding-right: 40px;
        }
        [data-theme="dark"] .modern-form select.form-select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
        }
        .form-header-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--text);
        }
        .contact-info-list {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .contact-info-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 15px;
          color: var(--text-gray);
        }
        .contact-info-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          border-radius: 50%;
          font-weight: 700;
          font-size: 12px;
        }
        .btn-primary-full {
          width: 100%;
          padding: 14px;
          background: var(--primary);
          color: var(--bg);
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-primary-full:hover:not(:disabled) {
          background: var(--primary-hover);
        }
        .btn-primary-full:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* --- FOOTER --- */
        .footer {
          border-top: 1px solid var(--border);
          padding: 64px 24px 32px;
          background: var(--surface);
          color: var(--text);
        }
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 64px;
        }
        .footer-brand-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .footer-brand-desc {
          font-size: 14px;
          color: var(--text-gray);
          line-height: 1.6;
          max-width: 360px;
        }
        .footer-links-col h4, .footer-contact-col h4 {
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 16px;
          color: var(--text);
        }
        .footer-links-col ul {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .footer-links-col a {
          font-size: 14px;
          color: var(--text-gray);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-links-col a:hover {
          color: var(--text);
        }
        .footer-contact-col p {
          font-size: 14px;
          color: var(--text-gray);
          line-height: 1.6;
          margin-bottom: 8px;
        }
        .footer-bottom {
          border-top: 1px solid var(--border);
          padding-top: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .footer-text {
          font-size: 13px;
          color: var(--text-gray);
        }
        .footer-credit {
          font-size: 13px;
          color: var(--text-gray);
        }
        .footer-credit strong {
          color: var(--text);
        }

        /* RESPONSIVE */
        @media (max-width: 968px) {
          .navbar {
            width: calc(100% - 24px);
            padding: 0 16px;
            top: 12px;
            height: 60px;
          }
          .navbar.scrolled {
            top: 8px;
            height: 56px;
          }
          .navbar-container {
            padding: 0 8px;
          }
          .navbar-actions {
            gap: 12px;
          }
          .nav-link {
            display: none;
          }
          .main-content {
            padding-top: 88px;
          }
          .hero-grid { grid-template-columns: 1fr; }
          .hero-title { font-size: 48px; }
          .bento-grid { grid-template-columns: 1fr; }
          .bento-card.large { grid-column: span 1; }
          .contact-container { grid-template-columns: 1fr; gap: 32px; }
          .form-row { grid-template-columns: 1fr; }
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .footer-bottom {
            flex-direction: column;
            text-align: center;
            align-items: center;
          }
        }
      `}} />
    </div>
  );
}
