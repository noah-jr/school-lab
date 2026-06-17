"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(circle at center, var(--bg-elevated) 0%, var(--bg) 100%)",
      padding: "24px",
      fontFamily: "'Inter', sans-serif",
      color: "var(--text)"
    }}>
      <div style={{
        maxWidth: "480px",
        width: "100%",
        textAlign: "center",
        padding: "48px 32px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        
        {/* Ícone Animado */}
        <div style={{
          position: "relative",
          width: "96px",
          height: "96px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, var(--accent-faint) 0%, rgba(99, 102, 241, 0.05) 100%)",
          border: "1px solid var(--accent)",
          borderRadius: "24px",
          color: "var(--accent)",
          marginBottom: "32px",
          boxShadow: "0 8px 32px rgba(99, 102, 241, 0.15)"
        }}>
          <FileQuestion size={44} style={{ animation: "bounce 2s infinite" }} />
        </div>

        <h1 style={{
          fontSize: "32px",
          fontWeight: 800,
          letterSpacing: "-0.5px",
          marginBottom: "12px",
          background: "linear-gradient(to right, var(--text), var(--text-muted))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Página não encontrada
        </h1>

        <p style={{
          fontSize: "14px",
          lineHeight: "1.6",
          color: "var(--text-muted)",
          marginBottom: "36px",
          maxWidth: "360px"
        }}>
          A página que procura não existe ou foi removida temporariamente. Verifique o endereço digitado.
        </p>

        {/* Botões de Ação */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%"
        }}>
          <Link href="/dashboard" className="btn btn-primary" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "12px",
            fontSize: "14px",
            fontWeight: 600,
            borderRadius: "8px",
            width: "100%"
          }}>
            <Home size={16} /> Ir para o Início
          </Link>

          <button onClick={() => router.back()} className="btn btn-outline" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "12px",
            fontSize: "14px",
            fontWeight: 600,
            borderRadius: "8px",
            width: "100%"
          }}>
            <ArrowLeft size={16} /> Voltar Atrás
          </button>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}} />
    </div>
  );
}
