"use client";
import { PageHeader } from "@/components/layout/Sidebar";
import { MessageSquare, Search, User, ChevronRight, Reply } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export default function MensagensPage() {
  const queryClient = useQueryClient();
  const [mensagemAtiva, setMensagemAtiva] = useState<number | null>(null);

  const { data: mensagensReq, isLoading } = useQuery({
    queryKey: ["mensagens"],
    queryFn: async () => {
      const res = await api.get("/mensagens");
      return res.data.data;
    }
  });

  const lerMutacao = useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/mensagens/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mensagens"] })
  });

  const mensagens = mensagensReq || [];

  const handleSelecionarMensagem = (msg: any) => {
    setMensagemAtiva(msg.id);
    if (!msg.lida) lerMutacao.mutate(msg.id);
  };

  const msgDetalhe = mensagens.find((m: any) => m.id === mensagemAtiva);

  return (
    <>
      <PageHeader title="Mensagens Internas" breadcrumb={[{ label: "Comunicações" }, { label: "Mensagens" }]} />
      
      <div className="page-body">
        <div className="card" style={{ padding: 0, overflow: "hidden", display: "grid", gridTemplateColumns: "350px 1fr", minHeight: "600px" }}>
          
          {/* Lista de Mensagens (Esquerda) */}
          <div style={{ borderRight: "1px solid var(--border)", background: "var(--bg-surface)", display: "flex", flexDirection: "column" }}>
            
            <div style={{ padding: 16, borderBottom: "1px solid var(--border)" }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center", background: "var(--bg)", borderRadius: 6, padding: "8px 12px", border: "1px solid var(--border)" }}>
                <Search size={14} color="var(--text-faint)" />
                <input type="text" placeholder="Procurar mensagens..." style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, marginLeft: 8, width: "100%" }} />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              {isLoading && <div style={{ padding: 16 }}>A carregar...</div>}
              {mensagens.map((msg: any) => (
                <div 
                  key={msg.id} 
                  onClick={() => handleSelecionarMensagem(msg)}
                  style={{ 
                    padding: "16px", borderBottom: "1px solid var(--border)", cursor: "pointer",
                    background: mensagemAtiva === msg.id ? "var(--bg-elevated)" : "transparent",
                    borderLeft: !msg.lida ? "3px solid var(--primary)" : "3px solid transparent",
                    transition: "background 0.2s"
                  }}
                  onMouseOver={e => e.currentTarget.style.background = mensagemAtiva === msg.id ? "var(--bg-elevated)" : "var(--bg)"}
                  onMouseOut={e => e.currentTarget.style.background = mensagemAtiva === msg.id ? "var(--bg-elevated)" : "transparent"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: !msg.lida ? 700 : 600, fontSize: 14, color: "var(--text)" }}>{msg.remetente_nome}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(msg.criado_em).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: 13, color: !msg.lida ? "var(--text)" : "var(--text-muted)", fontWeight: !msg.lida ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {msg.assunto}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Área de Detalhe (Direita) */}
          {msgDetalhe ? (
            <div style={{ display: "flex", flexDirection: "column", background: "#fff" }}>
              {/* Header da Mensagem */}
              <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--border)" }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{msgDetalhe.assunto}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--primary-faint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <User size={20} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{msgDetalhe.remetente_nome}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{msgDetalhe.remetente_email || "Sem email"} • {new Date(msgDetalhe.criado_em).toLocaleString()}</div>
                  </div>
                  <button className="btn btn-outline btn-sm"><Reply size={14}/> Responder</button>
                </div>
              </div>
              
              {/* Corpo da Mensagem */}
              <div style={{ padding: 32, fontSize: 14, lineHeight: 1.6, color: "var(--text)", flex: 1, whiteSpace: "pre-wrap" }}>
                {msgDetalhe.conteudo}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg)", color: "var(--text-faint)" }}>
              <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
              <p>Selecione uma mensagem para ler.</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
