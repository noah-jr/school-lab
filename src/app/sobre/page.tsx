"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { ShieldCheck, Info, Database, Users, Lock, Eye, ArrowLeft, Heart, Server } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

import { useEffect } from "react";

export default function SobrePage() {
  const { data: user } = useAuth();

  useEffect(() => {
    fetch("/api/public/visita", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pagina: "Sobre o Sistema" }),
    }).catch(err => console.error("Erro ao registar log de visitante", err));
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at top, var(--bg-elevated) 0%, var(--bg) 100%)",
      color: "var(--text)",
      fontFamily: "'Inter', sans-serif",
      padding: "40px 16px"
    }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Top Header */}
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "48px",
          paddingBottom: "20px",
          borderBottom: "1px solid var(--border)"
        }}>
          <Logo size="md" showText={true} subtitle="Sobre o Projecto" />
          <Link 
            href={user ? "/dashboard" : "/login"} 
            className="btn btn-outline" 
            style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}
          >
            <ArrowLeft size={14} /> {user ? "Voltar ao Painel" : "Ir para o Login"}
          </Link>
        </header>

        {/* Hero Section */}
        <section style={{ textAlign: "center", marginBottom: "56px" }}>
          <span style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "var(--accent)",
            letterSpacing: "1.5px",
            background: "var(--accent-faint)",
            padding: "6px 12px",
            borderRadius: "99px",
            display: "inline-block",
            marginBottom: "16px"
          }}>
            Gestão & Privacidade Unificadas
          </span>
          <h1 style={{
            fontSize: "36px",
            fontWeight: 800,
            letterSpacing: "-1px",
            marginBottom: "16px",
            color: "var(--text)"
          }}>
            Sobre a Escola para Anciãos de Congregação
          </h1>
          <p style={{
            fontSize: "15px",
            lineHeight: "1.6",
            color: "var(--text-muted)",
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            Uma plataforma de alta fidelidade desenhada especificamente para simplificar a gestão de turmas, oradores, programas de designação e auditoria escolar de forma descentralizada.
          </p>
        </section>

        {/* 3 Columns Features */}
        <section style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "24px",
          marginBottom: "56px"
        }}>
          
          <div className="card" style={{ padding: "24px", transition: "transform 0.2s" }}>
            <div style={{ color: "var(--accent)", marginBottom: "16px" }}>
              <Database size={28} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>Base de Dados Local</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Toda a informação da plataforma é guardada localmente numa base de dados SQLite encriptada. Sem servidores externos na cloud pública.
            </p>
          </div>

          <div className="card" style={{ padding: "24px", transition: "transform 0.2s" }}>
            <div style={{ color: "var(--success)", marginBottom: "16px" }}>
              <ShieldCheck size={28} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>Auditoria & RBAC</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Controlo de acesso estrito com base em papéis (Admin, Secretaria, Instrutor). Logs de auditoria automáticos para todas as alterações críticas.
            </p>
          </div>

          <div className="card" style={{ padding: "24px", transition: "transform 0.2s" }}>
            <div style={{ color: "var(--info)", marginBottom: "16px" }}>
              <Users size={28} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>Avaliação sem Conta</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Superintendentes de circuito avaliam estudantes de forma 100% descentralizada via portais temporários tokenizados sem necessidade de registo.
            </p>
          </div>

        </section>

        {/* Detalhes de Privacidade e Segurança */}
        <section style={{ marginBottom: "56px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Lock size={20} color="var(--accent)" /> Política de Privacidade & Proteção de Dados
          </h2>
          
          <div className="card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
            
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "8px" }}>1. Recolha Mínima de Dados</h4>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
                O sistema regista apenas dados estritamente necessários para a gestão das turmas: nome, contacto telefónico, congregação, e histórico de oratória dos estudantes. Não recolhemos dados de geolocalização ou telemetria.
              </p>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
              <h4 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "8px" }}>2. Localização física dos dados</h4>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
                A base de dados é mantida inteiramente na infraestrutura privada local da instituição. Os backups exportados contêm um espelho exato destes ficheiros e devem ser guardados pelos administradores com o mesmo nível de zelo.
              </p>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
              <h4 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "8px" }}>3. Política de Cookies</h4>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
                Utilizamos cookies de sessão para autenticar utilizadores e cookies de configuração para memorizar preferências visuais (ex: Modo Escuro). Não utilizamos cookies de publicidade, nem cookies de terceiros.
              </p>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
              <h4 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "8px" }}>4. Segurança de Comunicações</h4>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
                Todas as ligações para as APIs públicas (avaliação de viajantes, portal de feedback do estudante) estão protegidas por tokens criptográficos únicos e filtros contra ataques de força bruta (Rate Limiting por IP).
              </p>
            </div>

          </div>
        </section>

        {/* Stack Tecnológico */}
        <section style={{ marginBottom: "56px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Server size={20} color="var(--success)" /> Arquitetura Tecnológica
          </h2>
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-faint)", textTransform: "uppercase", fontWeight: 600 }}>Framework UI</span>
                <p style={{ fontSize: "14px", fontWeight: 600, margin: "4px 0 0 0" }}>Next.js 15 & React 19</p>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-faint)", textTransform: "uppercase", fontWeight: 600 }}>Base de Dados</span>
                <p style={{ fontSize: "14px", fontWeight: 600, margin: "4px 0 0 0" }}>SQLite (better-sqlite3)</p>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-faint)", textTransform: "uppercase", fontWeight: 600 }}>Estado Global</span>
                <p style={{ fontSize: "14px", fontWeight: 600, margin: "4px 0 0 0" }}>Zustand & React Query</p>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-faint)", textTransform: "uppercase", fontWeight: 600 }}>Geração PDF</span>
                <p style={{ fontSize: "14px", fontWeight: 600, margin: "4px 0 0 0" }}>jsPDF & AutoTable</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          textAlign: "center",
          paddingTop: "24px",
          borderTop: "1px solid var(--border)",
          fontSize: "12px",
          color: "var(--text-faint)"
        }}>
          <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", margin: "0 0 8px 0" }}>
            Desenvolvido com <Heart size={12} color="var(--danger)" /> para gestão educacional.
          </p>
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} Escola para Anciãos de Congregação. Todos os direitos reservados.</p>
        </footer>

      </div>
    </div>
  );
}
