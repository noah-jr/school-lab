"use client";
import { PageHeader } from "@/components/layout/Sidebar";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Activity, ShieldAlert, RefreshCw, AlertTriangle, Info, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LogsPage() {
  const { data: user } = useAuth();
  const isAdmin = user?.papel === "admin";

  const [q, setQ] = useState("");
  const [debounceQ, setDebounceQ] = useState("");
  const [pagina, setPagina] = useState(1);

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
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Data / Hora</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Ação</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Utilizador</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: any) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }} onMouseOver={e => e.currentTarget.style.background = "var(--bg-elevated)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "12px 24px", textAlign: "center" }}>
                        {getLogIcon(log.severidade)}
                      </td>
                      <td className="font-mono text-muted" style={{ fontSize: "12px" }}>
                        {new Date(log.criado_em).toLocaleString("pt-PT")}
                      </td>
                      <td style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)" }}>
                        {log.acao}
                      </td>
                      <td style={{ fontSize: "13px", color: "var(--text)" }}>
                        {log.utilizador_nome || "Sistema"}
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", maxWidth: "300px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
    </>
  );
}
