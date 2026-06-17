"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";

export function CookieConsent() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    // Verificamos se já existe consentimento no localStorage
    const consentimento = localStorage.getItem("cookieConsent");
    if (!consentimento) {
      // Pequeno atraso para dar uma sensação natural de entrada
      const timer = setTimeout(() => setVisivel(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const aceitarTodos = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setVisivel(false);
  };

  const aceitarApenasNecessarios = () => {
    localStorage.setItem("cookieConsent", "necessary");
    setVisivel(false);
  };

  if (!visivel) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "24px",
      right: "24px",
      left: "24px",
      maxWidth: "420px",
      backgroundColor: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: "14px",
      boxShadow: "0 12px 36px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.05)",
      zIndex: 9999,
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      backdropFilter: "blur(12px)",
      animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      fontFamily: "'Inter', sans-serif"
    }}>
      
      {/* Cabeçalho */}
      <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--accent)" }}>
          <div style={{
            padding: "8px",
            background: "var(--accent-faint)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center"
          }}>
            <Cookie size={20} />
          </div>
          <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)" }}>Cookies & Privacidade</span>
        </div>
        <button 
          onClick={aceitarApenasNecessarios}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-faint)",
            cursor: "pointer",
            padding: "4px"
          }}
          aria-label="Fechar e recusar não-essenciais"
        >
          <X size={16} />
        </button>
      </div>

      {/* Conteúdo */}
      <p style={{
        fontSize: "13px",
        lineHeight: "1.5",
        color: "var(--text-muted)",
        margin: 0
      }}>
        Utilizamos cookies essenciais para manter a sua sessão segura e registar o seu tema visual. Nenhum dado de rastreio de terceiros é utilizado. Consulte a nossa <Link href="/sobre" style={{ color: "var(--accent)", textDecoration: "underline", fontWeight: 500 }}>Política de Privacidade</Link>.
      </p>

      {/* Botões */}
      <div style={{ display: "flex", gap: "10px", width: "100%" }}>
        <button 
          onClick={aceitarApenasNecessarios} 
          className="btn btn-outline" 
          style={{ flex: 1, padding: "8px 12px", fontSize: "12px", height: "auto", justifyContent: "center" }}
        >
          Apenas Necessários
        </button>
        <button 
          onClick={aceitarTodos} 
          className="btn btn-primary" 
          style={{ flex: 1, padding: "8px 12px", fontSize: "12px", height: "auto", justifyContent: "center", gap: "6px" }}
        >
          <ShieldCheck size={14} /> Aceitar Todos
        </button>
      </div>

      {/* Estilos CSS Inline de Animação */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (max-width: 480px) {
          div[style*="position: fixed"] {
            right: 16px !important;
            left: 16px !important;
            bottom: 16px !important;
            max-width: none !important;
          }
        }
      `}} />
    </div>
  );
}
