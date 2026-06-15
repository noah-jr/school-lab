"use client";
import { use, useState } from "react";
import { PageHeader } from "@/components/layout/Sidebar";
import { useTurma, useTurmaEstudantes, useGerarDesignacoes } from "@/hooks/useTurmas";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import Link from "next/link";
import { Users, ClipboardList, Zap, CheckCircle, Link2, Shield, Copy, Trash2, Plus, Video } from "lucide-react";

// ── Painel de Tokens do Viajante ──────────────────────────
function PainelTokens({ turmaId }: { turmaId: string }) {
  const qc = useQueryClient();
  const [descricao, setDescricao] = useState("");
  const [dias, setDias] = useState(7);
  const [copiado, setCopiado] = useState<string | null>(null);

  const { data: tokensData, isLoading } = useQuery({
    queryKey: ["tokens", turmaId],
    queryFn: async () => {
      const { data } = await api.get(`/turmas/${turmaId}/tokens`);
      return data.data as Array<{
        id: string; token: string; descricao?: string;
        expira_em: string; revogado: number; criado_em: string;
      }>;
    },
  });

  const criar = useMutation({
    mutationFn: () => api.post(`/turmas/${turmaId}/tokens`, { descricao, dias_validade: dias }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tokens", turmaId] });
      setDescricao("");
    },
  });

  const revogar = useMutation({
    mutationFn: (tokenId: string) =>
      api.delete(`/turmas/${turmaId}/tokens`, { data: { token_id: tokenId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tokens", turmaId] }),
  });

  const copiarLink = (token: string) => {
    const url = `${window.location.origin}/avaliacao/${token}`;
    navigator.clipboard.writeText(url);
    setCopiado(token);
    setTimeout(() => setCopiado(null), 2000);
  };

  const agora = new Date();

  return (
    <div className="card" style={{ marginTop: 24 }}>
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Shield size={16} color="var(--accent)" />
          <span className="card-title">Acesso do Viajante</span>
        </div>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Links temporários de avaliação</span>
      </div>

      {/* Formulário de criação */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: "1 1 200px" }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
            Identificação do Viajante
          </label>
          <input
            className="form-input"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="ex: Viajante Circuito 206 — João Silva"
            style={{ width: "100%", fontSize: 13 }}
          />
        </div>
        <div style={{ flex: "0 0 130px" }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
            Validade (dias)
          </label>
          <select
            className="form-select"
            value={dias}
            onChange={(e) => setDias(Number(e.target.value))}
            style={{ width: "100%", fontSize: 13 }}
          >
            {[1, 3, 7, 14, 30].map((d) => (
              <option key={d} value={d}>{d} {d === 1 ? "dia" : "dias"}</option>
            ))}
          </select>
        </div>
        <button
          className="btn btn-primary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
          onClick={() => criar.mutate()}
          disabled={criar.isPending}
        >
          <Plus size={14} /> {criar.isPending ? "A criar..." : "Gerar Link"}
        </button>
      </div>

      {/* Lista de tokens */}
      <div style={{ padding: "12px 0" }}>
        {isLoading && (
          <div style={{ padding: "16px 20px" }}>
            {[1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8, borderRadius: 6 }} />)}
          </div>
        )}

        {!isLoading && !tokensData?.length && (
          <div style={{ padding: "24px", textAlign: "center", color: "var(--text-faint)", fontSize: 13 }}>
            <Link2 size={24} style={{ opacity: 0.2, margin: "0 auto 8px", display: "block" }} />
            Nenhum link gerado. Crie o primeiro para partilhar com o viajante.
          </div>
        )}

        {tokensData?.map((t) => {
          const expirado = new Date(t.expira_em) < agora;
          const revogado = t.revogado === 1;
          const inactivo = expirado || revogado;

          return (
            <div key={t.id} style={{
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderBottom: "1px solid var(--border)",
              opacity: inactivo ? 0.55 : 1,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: revogado ? "var(--danger)" : expirado ? "var(--text-faint)" : "var(--success)",
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {t.descricao || "Sem identificação"}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, fontFamily: "var(--font-mono)", display: "flex", gap: 12 }}>
                  <span>
                    {revogado ? "🔴 Revogado" : expirado ? "⏱ Expirado" : "🟢 Activo"}
                  </span>
                  <span>
                    Expira: {new Date(t.expira_em).toLocaleDateString("pt-AO", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                {!inactivo && (
                  <button
                    title="Copiar link"
                    onClick={() => copiarLink(t.token)}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: "6px 10px", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}
                  >
                    {copiado === t.token ? <CheckCircle size={13} color="var(--success)" /> : <Copy size={13} />}
                    {copiado === t.token ? "Copiado!" : "Copiar"}
                  </button>
                )}
                {!revogado && (
                  <button
                    title="Revogar link"
                    onClick={() => revogar.mutate(t.id)}
                    disabled={revogar.isPending}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: "6px 10px", color: "var(--danger)", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}
                  >
                    <Trash2 size={13} /> Revogar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TurmaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: turma, isLoading } = useTurma(id);
  const { data: estudantes } = useTurmaEstudantes(id);
  const { mutateAsync: gerar, isPending: gerandoDesig } = useGerarDesignacoes(id);
  const { data: user } = useAuth();
  
  const isSecretaria = user?.papel === "secretaria";

  if (isLoading) {
    return (
      <>
        <PageHeader title="..." breadcrumb={[{ label: "Turmas", href: "/turmas" }, { label: "..." }]} />
        <div className="page-body">
          <div className="skeleton" style={{ height: 120, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 400 }} />
        </div>
      </>
    );
  }

  if (!turma) return (
    <div className="empty-state" style={{ minHeight: "100dvh" }}>
      <p className="empty-title">Turma não encontrada</p>
      <Link href="/turmas" className="btn btn-ghost btn-sm">← Voltar</Link>
    </div>
  );

  const totalAvaliados = estudantes?.filter((e) => e.avaliado_pelo_viajante).length ?? 0;
  const totalEstudantes = estudantes?.length ?? 0;
  const percentAvaliados = totalEstudantes > 0 ? Math.round((totalAvaliados / totalEstudantes) * 100) : 0;

  return (
    <>
      <PageHeader
        title={turma.nome}
        breadcrumb={[{ label: "Turmas", href: "/turmas" }, { label: turma.nome }]}
        actions={
          <div className="flex gap-2">
            <span className={`badge badge-${turma.status}`} style={{ padding: "6px 12px" }}>{turma.status}</span>
          </div>
        }
      />

      <div className="page-body">
        {/* Info da turma */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <span className="stat-label">Nº Turma</span>
            <span className="stat-value font-mono">{turma.numero_turma}ª</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Período</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {new Date(turma.data_inicio).toLocaleDateString("pt-AO")} — {new Date(turma.data_fim).toLocaleDateString("pt-AO")}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Local</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{turma.local_nome}</span>
            {turma.local_cidade && <span className="stat-sub">{turma.local_cidade}</span>}
          </div>
          <div className="stat-card">
            <span className="stat-label">Avaliação Viajante</span>
            <span className="stat-value" style={{ color: percentAvaliados === 100 ? "var(--success)" : "var(--warning)" }}>
              {percentAvaliados}%
            </span>
            <div className="progress" style={{ marginTop: 4 }}>
              <div className="progress-bar" style={{ width: `${percentAvaliados}%` }} />
            </div>
            <span className="stat-sub">{totalAvaliados}/{totalEstudantes} avaliados</span>
          </div>
        </div>

        {/* Instrutores */}
        {(turma.instrutor_a_nome || turma.instrutor_b_nome) && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><span className="card-title">Instrutores</span></div>
            <div className="flex gap-4">
              {turma.instrutor_a_nome && (
                <div>
                  <span className="text-xs text-muted">Instrutor A</span>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{turma.instrutor_a_nome}</p>
                </div>
              )}
              {turma.instrutor_b_nome && (
                <div>
                  <span className="text-xs text-muted">Instrutor B</span>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{turma.instrutor_b_nome}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Acções rápidas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
          <Link href={`/turmas/${id}/estudantes`} className="card flex items-center gap-3" style={{ cursor: "pointer" }}>
            <div style={{ width: 36, height: 36, borderRadius: "var(--radius)", background: "var(--accent-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={16} color="var(--accent)" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600 }}>Estudantes</p>
              <p className="text-xs text-muted">{totalEstudantes} inscritos</p>
            </div>
          </Link>

          <Link href={`/turmas/${id}/sala-virtual`} className="card flex items-center gap-3" style={{ cursor: "pointer" }}>
            <div style={{ width: 36, height: 36, borderRadius: "var(--radius)", background: "var(--accent-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Video size={16} color="var(--accent)" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600 }}>Sala Virtual</p>
              <p className="text-xs text-muted">Vídeo, Chat e Ficheiros</p>
            </div>
          </Link>

          {!isSecretaria && (
            <Link href={`/turmas/${id}/designacoes`} className="card flex items-center gap-3" style={{ cursor: "pointer" }}>
              <div style={{ width: 36, height: 36, borderRadius: "var(--radius)", background: "var(--accent-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ClipboardList size={16} color="var(--accent)" />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600 }}>Designações</p>
                <p className="text-xs text-muted">Ver e gerar partes</p>
              </div>
            </Link>
          )}

          {!isSecretaria && (
          <button
            className={`card flex items-center gap-3 ${gerandoDesig ? "btn-loading" : ""}`}
            style={{ cursor: "pointer", textAlign: "left", width: "100%" }}
            onClick={() => gerar()}
            disabled={gerandoDesig || totalAvaliados === 0}
          >
            <div style={{ width: 36, height: 36, borderRadius: "var(--radius)", background: totalAvaliados > 0 ? "rgba(76,175,125,0.15)" : "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {gerandoDesig ? <Zap size={16} color="var(--warning)" /> : <Zap size={16} color={totalAvaliados > 0 ? "var(--success)" : "var(--text-faint)"} />}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: totalAvaliados === 0 ? "var(--text-faint)" : undefined }}>
                {gerandoDesig ? "A gerar..." : "Gerar Designações"}
              </p>
              <p className="text-xs text-muted">
                {totalAvaliados === 0 ? "Avalie estudantes primeiro" : "Distribuição automática"}
              </p>
            </div>
          </button>
          )}
        </div>

        {/* Lista de estudantes */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="card-header" style={{ padding: "16px 20px" }}>
            <span className="card-title">Estudantes Inscritos</span>
            <Link href={`/turmas/${id}/estudantes`} className="btn btn-ghost btn-sm">Gerir →</Link>
          </div>

          {!estudantes?.length ? (
            <div className="empty-state" style={{ padding: "32px 24px" }}>
              <Users size={28} style={{ opacity: 0.3 }} />
              <p className="empty-title">Sem estudantes</p>
              <Link href={`/turmas/${id}/estudantes`} className="btn btn-primary btn-sm">
                Adicionar Estudantes
              </Link>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: "none" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                  <tr>
                    <th style={{ padding: "12px 24px", color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>#</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Nome</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Congregação</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Idade</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Nível</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Avaliado</th>
                  </tr>
                </thead>
                <tbody>
                  {estudantes.slice(0, 10).map((te) => {
                    const nivel = te.nivel_oratoria?.charAt(0) ?? null;
                    return (
                      <tr key={te.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }} onMouseOver={e => e.currentTarget.style.background = "var(--bg-elevated)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                        <td className="font-mono text-muted" style={{ padding: "12px 24px", fontSize: "13px" }}>{te.numero_lista ?? "—"}</td>
                        <td style={{ fontWeight: 600, fontSize: "13px", color: "var(--text)" }}>{(te as any).estudante_nome ?? "—"}</td>
                        <td className="text-muted text-sm" style={{ fontSize: "13px" }}>{(te as any).congregacao_nome ?? "—"}</td>
                        <td className="font-mono text-sm" style={{ fontSize: "13px" }}>{te.idade ?? "—"}</td>
                        <td>
                          {te.nivel_oratoria ? (
                            <span className={`badge badge-${nivel}`} style={{ fontSize: "11px", fontWeight: 600, borderRadius: "4px" }}>{te.nivel_oratoria}</span>
                          ) : (
                            <span className="text-faint" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Sem avaliação</span>
                          )}
                        </td>
                        <td>
                          {te.avaliado_pelo_viajante ? (
                            <CheckCircle size={14} color="var(--success)" />
                          ) : (
                            <span className="text-faint" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Pendente</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {estudantes.length > 10 && (
                <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
                  <Link href={`/turmas/${id}/estudantes`} className="text-muted text-sm">
                    Ver todos os {estudantes.length} estudantes →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
        {!isSecretaria && <PainelTokens turmaId={id} />}
      </div>
    </>
  );
}
