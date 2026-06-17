"use client";
import { PageHeader } from "@/components/layout/Sidebar";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Activity, ShieldAlert, RefreshCw, AlertTriangle, Info, ShieldCheck, X, Monitor, Clock, User, MapPin, FileText, Tag } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

function LogModal({ log, onClose }: { log: any; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const severidadeColor: Record<string, string> = {
    info: "var(--info)",
    warning: "var(--warning)",
    error: "var(--danger)",
    success: "var(--success)",
  };
  const cor = severidadeColor[log.severidade] || "var(--info)";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px"
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px",
          width: "100%", maxWidth: "560px", boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          animation: "fadeSlideIn 0.15s ease"
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: cor, boxShadow: `0 0 8px ${cor}` }} />
            <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>Detalhes do Registo</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", padding: "4px", borderRadius: "4px" }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Ação */}
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <Tag size={16} color="var(--text-faint)" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Ação</div>
              <code style={{ fontSize: "13px", color: cor, fontFamily: "var(--font-mono)", background: "var(--bg-elevated)", padding: "3px 8px", borderRadius: "3px", border: `1px solid ${cor}33` }}>
                {log.acao}
              </code>
            </div>
          </div>

          {/* Detalhes */}
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <FileText size={16} color="var(--text-faint)" style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Detalhes</div>
              <p style={{ fontSize: "13px", color: "var(--text)", lineHeight: 1.6, background: "var(--bg-elevated)", padding: "10px 12px", borderRadius: "4px", border: "1px solid var(--border)", margin: 0, wordBreak: "break-word" }}>
                {log.detalhe}
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Utilizador */}
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <User size={16} color="var(--text-faint)" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Utilizador</div>
                <div style={{ fontSize: "13px", color: "var(--text)" }}>{log.utilizador_nome || "Sistema"}</div>
              </div>
            </div>

            {/* Severidade */}
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <Monitor size={16} color="var(--text-faint)" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Severidade</div>
                <span style={{ fontSize: "12px", fontWeight: 600, color: cor, background: `${cor}18`, border: `1px solid ${cor}44`, padding: "2px 8px", borderRadius: "3px", textTransform: "uppercase" }}>
                  {log.severidade}
                </span>
              </div>
            </div>

            {/* IP */}
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <MapPin size={16} color="var(--text-faint)" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>IP de Origem</div>
                {log.ip_address ? (
                  <code style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", background: "var(--bg-elevated)", padding: "2px 8px", borderRadius: "3px", border: "1px solid var(--border)" }}>
                    {log.ip_address}
                  </code>
                ) : (
                  <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>—</span>
                )}
              </div>
            </div>

            {/* Data */}
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <Clock size={16} color="var(--text-faint)" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Data / Hora</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  {new Date(log.criado_em).toLocaleString("pt-PT")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: "6px 16px", fontSize: "13px" }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LogsPage() {
  const { data: user } = useAuth();
  const isAdmin = user?.papel === "admin";

  const [q, setQ] = useState("");
  const [debounceQ, setDebounceQ] = useState("");
  const [pagina, setPagina] = useState(1);
  const [logSelecionado, setLogSelecionado] = useState<any>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounceQ(q);
      if (q !== debounceQ) setPagina(1);
    }, 400);
    return () => clearTimeout(t);
  }, [q, debounceQ]);

  const { data: response, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["logs", debounceQ, pagina],
    queryFn: async () => {
      const { data } = await api.get(`/logs?q=${encodeURIComponent(debounceQ)}&pagina=${pagina}&por_pagina=20`);
      return data;
    },
    enabled: isAdmin,
    refetchInterval: 30000,
  });

  const logs = response?.data || [];
  const totalPaginas = response?.totalPaginas || 1;

  if (!isAdmin) {
    return (
      <div className="empty-state" style={{ minHeight: "80dvh" }}>
        <ShieldAlert size={48} color="var(--danger)" style={{ opacity: 0.8, marginBottom: 16 }} />
        <p className="empty-title">Acesso Restrito</p>
        <p className="text-muted" style={{ maxWidth: 400, textAlign: "center", marginBottom: 24 }}>
          Os registos de auditoria são de acesso exclusivo aos administradores do sistema.
        </p>
      </div>
    );
  }

  const getLogIcon = (tipo: string) => {
    switch (tipo) {
      case "error": return <AlertTriangle size={14} color="var(--danger)" />;
      case "security": return <ShieldCheck size={14} color="var(--warning)" />;
      case "info":
      default: return <Info size={14} color="var(--info)" />;
    }
  };

  return (
    <>
      <PageHeader
        title="Registos de Auditoria"
        breadcrumb={[{ label: "Configurações", href: "/configuracoes" }, { label: "Logs" }]}
        actions={
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input 
              type="text" 
              placeholder="Pesquisar registos..." 
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 12px", fontSize: 13, outline: "none", color: "var(--text)", width: 200 }}
            />
            <button className={`btn btn-ghost ${isRefetching ? "opacity-50" : ""}`} onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw size={14} className={isRefetching ? "spin" : ""} /> Atualizar
            </button>
          </div>
        }
      />
      <div className="page-body" style={{ width: "100%", padding: "24px" }}>
        
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {isLoading ? (
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 8 }}>
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ height: 44 }} />)}
            </div>
          ) : !logs?.length ? (
            <div className="empty-state">
              <Activity size={28} style={{ opacity: 0.3 }} />
              <p className="empty-title">Nenhum registo encontrado</p>
              <p className="empty-desc">O sistema não possui eventos de log recentes.</p>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: "none" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                  <tr>
                    <th style={{ padding: "12px 24px", width: 60 }}></th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", padding: "12px 16px", textAlign: "left" }}>Data / Hora</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", padding: "12px 16px", textAlign: "left" }}>Ação</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", padding: "12px 16px", textAlign: "left" }}>Utilizador</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", padding: "12px 16px", textAlign: "left" }}>IP de Origem</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", padding: "12px 16px", textAlign: "left" }}>Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: any) => (
                    <tr
                      key={log.id}
                      onClick={() => setLogSelecionado(log)}
                      style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s", cursor: "pointer" }}
                      onMouseOver={e => e.currentTarget.style.background = "var(--bg-elevated)"}
                      onMouseOut={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "12px 24px", textAlign: "center" }}>
                        {getLogIcon(log.severidade)}
                      </td>
                      <td className="font-mono text-muted" style={{ fontSize: "12px", padding: "12px 16px", whiteSpace: "nowrap" }}>
                        {new Date(log.criado_em).toLocaleString("pt-PT")}
                      </td>
                      <td style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)", padding: "12px 16px" }}>
                        {log.acao}
                      </td>
                      <td style={{ fontSize: "13px", color: "var(--text)", padding: "12px 16px" }}>
                        {log.utilizador_nome || "Sistema"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {log.ip_address ? (
                          <code style={{ fontSize: "12px", fontFamily: "var(--font-mono)", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "3px", padding: "2px 6px", color: "var(--text-muted)" }}>
                            {log.ip_address}
                          </code>
                        ) : (
                          <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>—</span>
                        )}
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", maxWidth: "220px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", padding: "12px 16px" }}>
                        {log.detalhe}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {!isLoading && logs.length > 0 && (
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Página {pagina} de {totalPaginas} (Total: {response?.total || 0} registos)
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button 
                  className="btn btn-outline" 
                  disabled={pagina === 1} 
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  style={{ padding: "4px 12px", fontSize: 12 }}
                >
                  Anterior
                </button>
                <button 
                  className="btn btn-outline" 
                  disabled={pagina >= totalPaginas} 
                  onClick={() => setPagina(p => p + 1)}
                  style={{ padding: "4px 12px", fontSize: 12 }}
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes */}
      {logSelecionado && (
        <LogModal log={logSelecionado} onClose={() => setLogSelecionado(null)} />
      )}
    </>
  );
}
