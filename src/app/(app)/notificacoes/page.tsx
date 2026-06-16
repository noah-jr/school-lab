"use client";
import { PageHeader } from "@/components/layout/Sidebar";
import { Bell, CheckCircle, Info, AlertTriangle, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export default function NotificacoesPage() {
  const queryClient = useQueryClient();

  const { data: notificacoesReq, isLoading } = useQuery({
    queryKey: ["notificacoes"],
    queryFn: async () => {
      const res = await api.get("/notificacoes");
      return res.data.data;
    }
  });

  const apagarMutacao = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/notificacoes/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notificacoes"] })
  });

  const lerTodasMutacao = useMutation({
    mutationFn: async () => {
      await api.post("/notificacoes/ler_todas");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notificacoes"] })
  });

  const notificacoes = notificacoesReq || [];

  return (
    <>
      <PageHeader title="Notificações" breadcrumb={[{ label: "Atividade" }, { label: "Notificações" }]} />
      
      <div className="page-body">
        <div className="card" style={{ padding: 0, overflow: "hidden", maxWidth: 800, margin: "0 auto" }}>
          
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-surface)" }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Últimas Notificações</span>
            <button 
              className="btn btn-ghost btn-sm" 
              style={{ fontSize: 12 }}
              onClick={() => lerTodasMutacao.mutate()}
              disabled={lerTodasMutacao.isPending}
            >
              Marcar todas como lidas
            </button>
          </div>

          <div>
            {isLoading && <div style={{ padding: 24, textAlign: "center" }}>A carregar...</div>}
            {!isLoading && notificacoes.length === 0 && <div style={{ padding: 24, textAlign: "center", color: "var(--text-faint)" }}>Sem novas notificações.</div>}
            {notificacoes.map((n: any) => {
              let Icon = Info;
              let iconColor = "var(--info)";
              let bgIcon = "var(--info-faint)";
              
              if (n.tipo === "success") { Icon = CheckCircle; iconColor = "var(--success)"; bgIcon = "var(--success-faint)"; }
              if (n.tipo === "warning") { Icon = AlertTriangle; iconColor = "var(--warning)"; bgIcon = "var(--warning-faint)"; }

              return (
                <div key={n.id} style={{ 
                  padding: "16px 24px", 
                  borderBottom: "1px solid var(--border)", 
                  display: "flex", 
                  gap: 16, 
                  alignItems: "flex-start",
                  background: !n.lida ? "var(--bg-elevated)" : "transparent",
                  transition: "background 0.2s"
                }}
                onMouseOver={e => e.currentTarget.style.background = "var(--bg-elevated)"}
                onMouseOut={e => e.currentTarget.style.background = !n.lida ? "var(--bg-elevated)" : "transparent"}
                >
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: bgIcon, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={20} color={iconColor} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                      <span style={{ fontWeight: !n.lida ? 700 : 600, fontSize: 14, color: "var(--text)" }}>{n.titulo}</span>
                      <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{new Date(n.criado_em).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                      {n.texto}
                    </div>
                  </div>
                  <button 
                    className="btn btn-ghost btn-icon text-muted" 
                    style={{ width: 28, height: 28 }} 
                    title="Apagar"
                    onClick={() => apagarMutacao.mutate(n.id)}
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ padding: "16px 24px", textAlign: "center", background: "var(--bg-surface)" }}>
            <button className="btn btn-outline" style={{ fontSize: 13 }}>Carregar Mais Notificações</button>
          </div>

        </div>
      </div>
    </>
  );
}
