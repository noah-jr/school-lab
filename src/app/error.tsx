"use client";
import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para a consola em desenvolvimento/produção
    console.error("[Erro Global do Next.js]", error);
  }, [error]);

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
        maxWidth: "520px",
        width: "100%",
        textAlign: "center",
        padding: "48px 32px",
        background: "var(--bg-surface)",
        border: "1px solid rgba(239, 68, 68, 0.2)",
        borderRadius: "16px",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        
        {/* Ícone de Alerta */}
        <div style={{
          position: "relative",
          width: "96px",
          height: "96px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.02) 100%)",
          border: "1px solid var(--danger)",
          borderRadius: "24px",
          color: "var(--danger)",
          marginBottom: "32px",
          boxShadow: "0 8px 32px rgba(239, 68, 68, 0.15)"
        }}>
          <AlertTriangle size={44} style={{ animation: "pulse 2s infinite" }} />
        </div>

        <h1 style={{
          fontSize: "26px",
          fontWeight: 800,
          letterSpacing: "-0.5px",
          marginBottom: "12px",
          color: "var(--text)"
        }}>
          Algo correu mal!
        </h1>

        <p style={{
          fontSize: "14px",
          lineHeight: "1.6",
          color: "var(--text-muted)",
          marginBottom: "28px",
          maxWidth: "400px"
        }}>
          Ocorreu um erro inesperado no sistema. A nossa equipa de TI já foi notificada. Pode tentar recarregar esta secção.
        </p>

        {/* Detalhes Técnicos Colapsáveis */}
        <details style={{
          width: "100%",
          textAlign: "left",
          marginBottom: "32px",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          overflow: "hidden"
        }}>
          <summary style={{
            padding: "10px 14px",
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--text-muted)",
            cursor: "pointer",
            userSelect: "none",
            outline: "none"
          }}>
            Informações Técnicas do Erro
          </summary>
          <div style={{
            padding: "14px",
            borderTop: "1px solid var(--border)",
            fontFamily: "monospace",
            fontSize: "12px",
            color: "var(--danger)",
            background: "rgba(0, 0, 0, 0.2)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            maxHeight: "120px",
            overflowY: "auto"
          }}>
            <strong>Mensagem:</strong> {error.message || "Erro desconhecido"}<br />
            {error.digest && <><strong>ID do Erro:</strong> {error.digest}</>}
          </div>
        </details>

        {/* Botões de Ação */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%"
        }}>
          <button onClick={() => reset()} className="btn btn-primary" style={{
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
            <RotateCcw size={16} /> Tentar Novamente
          </button>

          <Link href="/dashboard" className="btn btn-outline" style={{
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
            <Home size={16} /> Voltar ao Início
          </Link>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.97); }
        }
      `}} />
    </div>
  );
}
