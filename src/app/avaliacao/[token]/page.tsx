"use client";
import { use, useState, useCallback } from "react";
import { CheckCircle, Clock, AlertTriangle, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// -------------------------------------------------------
// TIPOS
// -------------------------------------------------------
interface EstudanteParaAvaliar {
  turma_estudante_id: string;
  nome: string;
  numero_lista?: number;
  congregacao_nome?: string;
  circuito_codigo?: string;
  papel_ministerial: string;
  idade?: number;
  anos_batismo?: number;
  nivel_oratoria?: string;
  avaliado_pelo_viajante: number;
  data_avaliacao?: string;
  observacoes?: string;
}

const NIVEIS: { valor: string; label: string; cor: string }[] = [
  { valor: "A+", label: "A+", cor: "#16a34a" },
  { valor: "A",  label: "A",  cor: "#22c55e" },
  { valor: "A-", label: "A−", cor: "#4ade80" },
  { valor: "B+", label: "B+", cor: "#2563eb" },
  { valor: "B",  label: "B",  cor: "#3b82f6" },
  { valor: "B-", label: "B−", cor: "#60a5fa" },
  { valor: "C+", label: "C+", cor: "#d97706" },
  { valor: "C",  label: "C",  cor: "#f59e0b" },
  { valor: "C-", label: "C−", cor: "#fbbf24" },
  { valor: "NR", label: "NR", cor: "#ef4444" },
];

const OBSERVACOES_RAPIDAS = [
  "Limitação por idade avançada",
  "Mudança de território",
  "Desqualificado ministerialmente",
  "Problemas de saúde",
  "Ausente da turma",
];

// -------------------------------------------------------
// CARD DE ESTUDANTE
// -------------------------------------------------------
function EstudanteCard({
  est,
  token,
  onSaved,
}: {
  est: EstudanteParaAvaliar;
  token: string;
  onSaved: () => void;
}) {
  const [aberto, setAberto] = useState(!est.avaliado_pelo_viajante);
  const [nivel, setNivel] = useState(est.nivel_oratoria ?? "");
  const [obs, setObs] = useState(est.observacoes ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const handleSalvar = async () => {
    if (!nivel) { setErro("Seleccione o nível de oratória."); return; }
    setSalvando(true);
    setErro("");
    try {
      const res = await fetch(`/api/public/avaliacao/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turma_estudante_id: est.turma_estudante_id,
          nivel_oratoria: nivel,
          observacoes: obs || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.erro || "Erro ao guardar.");
      }
      setSucesso(true);
      setTimeout(() => { setAberto(false); onSaved(); }, 800);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido.");
    } finally {
      setSalvando(false);
    }
  };

  const avaliado = est.avaliado_pelo_viajante === 1;

  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${avaliado && !aberto ? "#bbf7d0" : "#e5e7eb"}`,
      borderRadius: 12,
      overflow: "hidden",
      transition: "all 0.2s ease",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      {/* Cabeçalho do card */}
      <button
        onClick={() => setAberto(!aberto)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 20px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {/* Avatar */}
        <div style={{
          width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
          background: avaliado ? "#dcfce7" : "#f3f4f6",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 16,
          color: avaliado ? "#16a34a" : "#6b7280",
        }}>
          {avaliado
            ? <CheckCircle size={20} color="#16a34a" />
            : est.nome.charAt(0).toUpperCase()
          }
        </div>

        {/* Info principal */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>
              {est.nome}
            </span>
            {est.numero_lista && (
              <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "monospace" }}>
                #{est.numero_lista}
              </span>
            )}
            {avaliado && (est.nivel_oratoria || est.observacoes?.includes("[NR]")) && (
              <span style={{
                padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                background: est.nivel_oratoria ? "#dcfce7" : "#fee2e2", 
                color: est.nivel_oratoria ? "#16a34a" : "#dc2626",
              }}>
                {est.nivel_oratoria || "NR"}
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2, display: "flex", gap: 12, flexWrap: "wrap" }}>
            {est.congregacao_nome && <span>⛪ {est.congregacao_nome}</span>}
            {est.circuito_codigo && <span>📍 Cir. {est.circuito_codigo}</span>}
            {est.papel_ministerial && (
              <span style={{ textTransform: "capitalize" }}>
                {est.papel_ministerial === "anciao" ? "🔑 Ancião" : "👤 Servo Ministerial"}
              </span>
            )}
          </div>
        </div>

        {/* Estado + Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {!avaliado && (
            <span style={{
              padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
              background: "#fef9c3", color: "#a16207",
            }}>
              Pendente
            </span>
          )}
          {aberto ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
        </div>
      </button>

      {/* Painel de avaliação */}
      {aberto && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid #f3f4f6" }}>
          {/* Info extra */}
          {(est.idade || est.anos_batismo) && (
            <div style={{ display: "flex", gap: 24, padding: "12px 0", fontSize: 13, color: "#6b7280" }}>
              {est.idade && <span>🎂 {est.idade} anos</span>}
              {est.anos_batismo && <span>💧 {est.anos_batismo} anos de batismo</span>}
            </div>
          )}

          {/* Selector de nível */}
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
              Nível de Oratória *
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {NIVEIS.map((n) => (
                <button
                  key={n.valor}
                  onClick={() => setNivel(n.valor)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: `2px solid ${nivel === n.valor ? n.cor : "#e5e7eb"}`,
                    background: nivel === n.valor ? n.cor : "#fff",
                    color: nivel === n.valor ? "#fff" : "#374151",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    minWidth: 52,
                  }}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div style={{ marginTop: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
              Observações / Limitações
            </label>

            {/* Sugestões rápidas */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {OBSERVACOES_RAPIDAS.map((op) => (
                <button
                  key={op}
                  onClick={() => setObs((prev) => prev ? `${prev}; ${op}` : op)}
                  style={{
                    padding: "4px 10px", borderRadius: 99, fontSize: 12,
                    border: "1px solid #e5e7eb", background: "#f9fafb",
                    color: "#4b5563", cursor: "pointer",
                  }}
                >
                  + {op}
                </button>
              ))}
            </div>

            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Indique limitações, motivos de ausência, mudança de território, etc."
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                fontSize: 14,
                resize: "vertical",
                fontFamily: "inherit",
                color: "#111827",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Erro / Sucesso */}
          {erro && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 13 }}>
              ⚠️ {erro}
            </div>
          )}
          {sucesso && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, color: "#16a34a", fontSize: 13 }}>
              ✅ Avaliação guardada com sucesso!
            </div>
          )}

          {/* Acção */}
          <button
            onClick={handleSalvar}
            disabled={salvando || sucesso}
            style={{
              marginTop: 16,
              padding: "11px 24px",
              borderRadius: 8,
              background: sucesso ? "#16a34a" : "#1e40af",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              border: "none",
              cursor: salvando || sucesso ? "not-allowed" : "pointer",
              opacity: salvando ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s",
            }}
          >
            {salvando ? "A guardar..." : sucesso ? "✓ Guardado" : "Guardar Avaliação"}
          </button>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------
// PÁGINA PRINCIPAL
// -------------------------------------------------------
export default function AvaliacaoPublicaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["avaliacao-publica", token],
    queryFn: async () => {
      const res = await fetch(`/api/public/avaliacao/${token}`);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.erro || "Erro ao carregar.");
      }
      return res.json() as Promise<{
        data: {
          turma: { id: string; nome: string; numero_turma: number };
          token: { descricao?: string; expira_em: string };
          estudantes: EstudanteParaAvaliar[];
        };
      }>;
    },
    retry: false,
  });

  const handleSaved = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["avaliacao-publica", token] });
  }, [qc, token]);

  const turma = data?.data.turma;
  const tokenInfo = data?.data.token;
  const estudantes = data?.data.estudantes ?? [];
  const avaliados = estudantes.filter((e) => e.avaliado_pelo_viajante).length;
  const pct = estudantes.length > 0 ? Math.round((avaliados / estudantes.length) * 100) : 0;
  const expiraEm = tokenInfo ? new Date(tokenInfo.expira_em) : null;
  const diasRestantes = expiraEm
    ? Math.ceil((expiraEm.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

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
          <Sparkles size={18} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#111827", letterSpacing: "-0.02em" }}>
            EAC Lab — Avaliação de Viajante
          </div>
          {turma && (
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>
              {turma.numero_turma}ª Turma · {turma.nome}
            </div>
          )}
        </div>
        {expiraEm && (
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600,
            background: diasRestantes <= 2 ? "#fef2f2" : "#f0fdf4",
            color: diasRestantes <= 2 ? "#dc2626" : "#16a34a",
            border: `1px solid ${diasRestantes <= 2 ? "#fecaca" : "#bbf7d0"}`,
          }}>
            <Clock size={12} />
            {diasRestantes}d restantes
          </div>
        )}
      </header>

      {/* Conteúdo */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px" }}>

        {/* Loading */}
        {isLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 80, borderRadius: 12, background: "#e5e7eb", animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        )}

        {/* Erro / Link inválido */}
        {isError && (
          <div style={{
            textAlign: "center", padding: "80px 24px",
            background: "#fff", borderRadius: 16, border: "1px solid #fee2e2",
          }}>
            <AlertTriangle size={48} color="#dc2626" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
              Link Inválido ou Expirado
            </h2>
            <p style={{ color: "#6b7280", fontSize: 15 }}>
              Este link de avaliação não é válido, já expirou ou foi revogado pelo administrador.<br />
              Solicite um novo link ao coordenador da turma.
            </p>
          </div>
        )}

        {/* Dados carregados */}
        {data && (
          <>
            {/* Boas-vindas + Progresso */}
            <div style={{
              background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb",
              padding: "24px", marginBottom: 24,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}>
              {tokenInfo?.descricao && (
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
                  👤 {tokenInfo.descricao}
                </div>
              )}
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 4, letterSpacing: "-0.02em" }}>
                Avaliação da {turma?.numero_turma}ª Turma
              </h1>
              <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 20 }}>
                Indique a classificação como orador (A = excelente, B = acima da média, C = mediano) podendo complementar com sinais (+ e -) para ajudar nas designações.<br /><br />
                <strong>Obs. 1:</strong> Caso conclua que determinado ancião esteja limitado por questões de saúde ou idade, coloque: <strong>NR</strong>.<br />
                <strong>Obs. 2:</strong> Caso um irmão tenha deixado de servir como ancião, adicione a observação: <strong>Desqualificado ministerialmente</strong>.
              </p>

              {/* Barra de progresso */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                  Progresso da avaliação
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: pct === 100 ? "#16a34a" : "#1e40af", fontFamily: "monospace" }}>
                  {avaliados}/{estudantes.length}
                </span>
              </div>
              <div style={{ height: 8, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: pct === 100 ? "#16a34a" : "#1e40af",
                  borderRadius: 99,
                  transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
                }} />
              </div>
              {pct === 100 && (
                <div style={{ marginTop: 12, padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: 13, color: "#16a34a", fontWeight: 600 }}>
                  ✅ Todos os estudantes foram avaliados. Obrigado!
                </div>
              )}
            </div>

            {/* Lista de estudantes */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {estudantes.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 24px", color: "#6b7280" }}>
                  Nenhum estudante inscrito nesta turma.
                </div>
              ) : (
                estudantes.map((est) => (
                  <EstudanteCard
                    key={est.turma_estudante_id}
                    est={est}
                    token={token}
                    onSaved={handleSaved}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            <div style={{ marginTop: 32, textAlign: "center", fontSize: 12, color: "#9ca3af" }}>
              EAC Lab · Acesso seguro e temporário · Expira em{" "}
              {expiraEm?.toLocaleDateString("pt-AO", { day: "2-digit", month: "long", year: "numeric" })}
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
