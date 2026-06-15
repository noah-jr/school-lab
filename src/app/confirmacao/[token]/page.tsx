"use client";
import { use, useCallback, useState } from "react";
import { CheckCircle, Calendar, Clock, BookOpen, AlertTriangle, User, XCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// -------------------------------------------------------
// TIPOS
// -------------------------------------------------------
interface Designacao {
  designacao_id: string;
  status: string;
  motivo_recusa?: string;
  parte_id: string;
  numero: number;
  titulo: string;
  tipo: string;
  dia_semana: string;
  hora_inicio: string;
  duracao_minutos: number;
}

// -------------------------------------------------------
// COMPONENTE DO CARD DA DESIGNAÇÃO
// -------------------------------------------------------
function DesignacaoCard({
  d,
  onConfirmar,
  onRecusar,
  isPending,
}: {
  d: Designacao;
  onConfirmar: (id: string) => void;
  onRecusar: (id: string, motivo: string) => void;
  isPending: boolean;
}) {
  const [isRecusando, setIsRecusando] = useState(false);
  const [motivo, setMotivo] = useState("");

  const isConfirmada = d.status === "confirmada" || d.status === "realizada";
  const isCancelada = d.status === "cancelada";

  return (
    <div style={{
      background: "#fff", borderRadius: 12, overflow: "hidden",
      border: `1px solid ${isConfirmada ? "#bbf7d0" : isCancelada ? "#fecaca" : "#e5e7eb"}`,
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
    }}>
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Cabeçalho */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.02em" }}>
              Parte {d.numero} • {d.tipo}
            </span>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginTop: 4 }}>
              {d.titulo}
            </h3>
          </div>
          {isConfirmada ? (
            <span style={{ padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", gap: 4 }}>
              <CheckCircle size={12} /> Confirmada
            </span>
          ) : isCancelada ? (
            <span style={{ padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", gap: 4 }}>
              <XCircle size={12} /> Recusada
            </span>
          ) : (
            <span style={{ padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: "#fef9c3", color: "#a16207" }}>
              Pendente
            </span>
          )}
        </div>

        {/* Detalhes de Horário */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 13, color: "#4b5563", background: "#f9fafb", padding: "12px", borderRadius: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Calendar size={14} color="#6b7280" /> <span style={{ textTransform: "capitalize" }}>{d.dia_semana}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Clock size={14} color="#6b7280" /> {d.hora_inicio || "--:--"} ({d.duracao_minutos || 0} min)
          </div>
        </div>

        {/* Se foi recusada, mostrar o motivo */}
        {isCancelada && d.motivo_recusa && (
          <div style={{ fontSize: 13, color: "#991b1b", background: "#fef2f2", padding: "10px 12px", borderRadius: 8, border: "1px solid #fecaca" }}>
            <strong>Motivo da recusa:</strong> {d.motivo_recusa}
          </div>
        )}

        {/* Botões de Ação (Apenas se pendente) */}
        {!isConfirmada && !isCancelada && !isRecusando && (
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button
              onClick={() => onConfirmar(d.designacao_id)}
              disabled={isPending}
              style={{
                flex: 1, padding: "10px", borderRadius: 8, background: "#fff",
                border: "1px solid #d1d5db", color: "#374151", fontWeight: 600, fontSize: 14,
                cursor: isPending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: isPending ? 0.6 : 1
              }}
            >
              <CheckCircle size={16} color="#16a34a" /> Aceitar e Confirmar
            </button>
            <button
              onClick={() => setIsRecusando(true)}
              disabled={isPending}
              style={{
                padding: "10px 16px", borderRadius: 8, background: "#fff",
                border: "1px solid #fecaca", color: "#dc2626", fontWeight: 600, fontSize: 14,
                cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.6 : 1
              }}
            >
              Não posso cumprir
            </button>
          </div>
        )}

        {/* Formulário de Recusa */}
        {isRecusando && (
          <div style={{ marginTop: 8, padding: 16, background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca" }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#991b1b", display: "block", marginBottom: 8 }}>
              Por que você não aceita a designação? *
            </label>
            <textarea
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              rows={3}
              placeholder="Escreva o motivo aqui..."
              style={{
                width: "100%", padding: 10, borderRadius: 6, border: "1px solid #fca5a5",
                fontSize: 14, marginBottom: 12, resize: "vertical", boxSizing: "border-box",
                fontFamily: "inherit"
              }}
            />
            
            <div style={{ fontSize: 12, color: "#991b1b", marginBottom: 16, display: "flex", flexDirection: "column", gap: 6 }}>
              <strong>Atenção às seguintes instruções:</strong>
              <div style={{ display: "flex", gap: 6 }}><AlertTriangle size={14} style={{ flexShrink: 0 }} /> <span>Exclua/destrua todos os arquivos referentes à designação.</span></div>
              <div style={{ display: "flex", gap: 6 }}><AlertTriangle size={14} style={{ flexShrink: 0 }} /> <span>Mantenha a confidencialidade sobre o convite recebido.</span></div>
              <div style={{ display: "flex", gap: 6 }}><AlertTriangle size={14} style={{ flexShrink: 0 }} /> <span>Entre em contato com a Mesa de Escolas do Departamento de Serviço e informe a sua situação imediatamente.</span></div>
              <div style={{ display: "flex", gap: 6 }}><AlertTriangle size={14} style={{ flexShrink: 0 }} /> <span>Depois destes passos, não precisa ligar para os instrutores.</span></div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  onRecusar(d.designacao_id, motivo);
                  setIsRecusando(false);
                }}
                disabled={!motivo.trim() || isPending}
                style={{
                  flex: 1, padding: "10px", borderRadius: 6, background: "#dc2626", color: "#fff",
                  fontWeight: 600, border: "none", cursor: motivo.trim() ? "pointer" : "not-allowed",
                  opacity: !motivo.trim() || isPending ? 0.5 : 1
                }}
              >
                Submeter Recusa
              </button>
              <button
                onClick={() => setIsRecusando(false)}
                style={{
                  padding: "10px 16px", borderRadius: 6, background: "#fff",
                  border: "1px solid #fca5a5", color: "#991b1b", fontWeight: 600, cursor: "pointer"
                }}
              >
                Voltar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------
// PÁGINA PRINCIPAL
// -------------------------------------------------------
export default function ConfirmacaoPublicaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["confirmacao", token],
    queryFn: async () => {
      const res = await fetch(`/api/public/estudante/${token}`);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.erro || "Erro ao carregar.");
      }
      return res.json() as Promise<{
        data: {
          estudante: { id: string; nome: string; turma_nome: string; numero_turma: number };
          designacoes: Designacao[];
        };
      }>;
    },
    retry: false,
  });

  const accaoMutacao = useMutation({
    mutationFn: async ({ designacao_id, accao, motivo }: { designacao_id: string; accao: "confirmar" | "recusar"; motivo?: string }) => {
      const res = await fetch(`/api/public/estudante/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designacao_id, accao, motivo }),
      });
      if (!res.ok) throw new Error("Erro ao processar");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["confirmacao", token] });
    },
  });

  const estudante = data?.data.estudante;
  const designacoes = data?.data.designacoes ?? [];
  const pendentes = designacoes.filter(d => d.status === "pendente");
  const todasRespondidas = designacoes.length > 0 && pendentes.length === 0;

  const handleConfirmar = (id: string) => accaoMutacao.mutate({ designacao_id: id, accao: "confirmar" });
  const handleRecusar = (id: string, motivo: string) => accaoMutacao.mutate({ designacao_id: id, accao: "recusar", motivo });

  const confirmarTodas = async () => {
    for (const d of pendentes) {
      await accaoMutacao.mutateAsync({ designacao_id: d.designacao_id, accao: "confirmar" });
    }
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <header style={{
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        position: "sticky",
        top: 0,
        zIndex: 10,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, background: "#1e40af",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <BookOpen size={18} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#111827", letterSpacing: "-0.02em" }}>
            EAC Lab — As Minhas Designações
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "32px 16px" }}>

        {isLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ height: 120, borderRadius: 16, background: "#e5e7eb", animation: "pulse 1.5s infinite" }} />
            <div style={{ height: 120, borderRadius: 12, background: "#e5e7eb", animation: "pulse 1.5s infinite", marginTop: 16 }} />
          </div>
        )}

        {isError && (
          <div style={{
            textAlign: "center", padding: "80px 24px",
            background: "#fff", borderRadius: 16, border: "1px solid #fee2e2",
          }}>
            <AlertTriangle size={48} color="#dc2626" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
              Link Inválido
            </h2>
            <p style={{ color: "#6b7280", fontSize: 15 }}>
              Este link pessoal não foi encontrado. Por favor, solicite um novo link aos instrutores da escola.
            </p>
          </div>
        )}

        {data && (
          <>
            {/* Boas-vindas */}
            <div style={{
              background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb",
              padding: "24px", marginBottom: 24,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              textAlign: "center"
            }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <User size={28} color="#6b7280" />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 8, letterSpacing: "-0.02em" }}>
                Olá, {estudante?.nome}!
              </h1>
              <p style={{ fontSize: 15, color: "#4b5563", marginBottom: 20 }}>
                Aqui estão as suas designações para a <strong>{estudante?.numero_turma}ª Turma</strong> da Escola de Anciãos.
              </p>
              
              {pendentes.length > 1 && (
                <button
                  onClick={confirmarTodas}
                  disabled={accaoMutacao.isPending}
                  style={{
                    padding: "12px 24px", borderRadius: 8, background: "#1e40af", color: "#fff",
                    fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: 8, width: "100%", justifyContent: "center"
                  }}
                >
                  <CheckCircle size={18} /> Aceitar Todas as Partes
                </button>
              )}
              {todasRespondidas && (
                <div style={{ padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, color: "#16a34a", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <CheckCircle size={18} /> Todas as suas designações foram respondidas.
                </div>
              )}
            </div>

            {/* Lista de designações */}
            {designacoes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 24px", color: "#6b7280" }}>
                Ainda não tem nenhuma designação atribuída nesta turma.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: 8 }}>
                  As suas partes no programa
                </h2>
                
                {designacoes.map((d) => (
                  <DesignacaoCard
                    key={d.designacao_id}
                    d={d}
                    onConfirmar={handleConfirmar}
                    onRecusar={handleRecusar}
                    isPending={accaoMutacao.isPending}
                  />
                ))}
              </div>
            )}

            <div style={{ marginTop: 40, textAlign: "center", fontSize: 12, color: "#9ca3af" }}>
              EAC Lab · O seu acesso é seguro e pessoal
            </div>
          </>
        )}
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
