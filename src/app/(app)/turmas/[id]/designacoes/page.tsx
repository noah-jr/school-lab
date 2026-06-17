"use client";
import { use } from "react";
import { PageHeader } from "@/components/layout/Sidebar";
import { useTurmaDesignacoes, useTurma, useGerarDesignacoes, useTurmaEstudantes, useAtribuirDesignacao } from "@/hooks/useTurmas";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { ClipboardList, Zap, ShieldAlert, Printer } from "lucide-react";

const DIAS_DA_SEMANA = ["segunda", "terca", "quarta", "quinta", "sexta"];

export default function TurmaDesignacoesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: user, isLoading: authLoading } = useAuth();
  const { data: turma } = useTurma(id);
  const { data: estudantes } = useTurmaEstudantes(id);
  const { data: designacoes, isLoading } = useTurmaDesignacoes(id);
  const { mutateAsync: gerar, isPending: gerandoDesig } = useGerarDesignacoes(id);
  const { mutateAsync: atribuir, isPending: atribuindo } = useAtribuirDesignacao(id);

  const temAcessoCompleto = user?.papel === "admin" || user?.papel === "instrutor";

  if (!authLoading && !temAcessoCompleto && user?.papel !== "viajante") {
    return (
      <div className="empty-state" style={{ minHeight: "80dvh" }}>
        <ShieldAlert size={48} color="var(--danger)" style={{ opacity: 0.8, marginBottom: 16 }} />
        <p className="empty-title">Acesso Restrito</p>
        <p className="text-muted" style={{ maxWidth: 400, textAlign: "center", marginBottom: 24 }}>
          O seu perfil de acesso não permite visualizar nem gerar designações. Este painel é exclusivo dos administradores e instrutores.
        </p>
        <Link href={`/turmas/${id}/estudantes`} className="btn btn-primary">Voltar para a Lista de Estudantes</Link>
      </div>
    );
  }

  const designacoesPorDia = DIAS_DA_SEMANA.map((dia) => ({
    dia,
    partes: designacoes?.filter((d) => d.dia_semana === dia) || [],
  }));

  const handleSelectEstudante = async (parteId: string, diaSemana: string, turmaEstudanteId: string) => {
    if (!turmaEstudanteId) return;
    try {
      await atribuir({ parte_id: parteId, dia_semana: diaSemana, turma_estudante_id: turmaEstudanteId });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <PageHeader
        title="Designações do Programa"
        breadcrumb={[
          { label: "Turmas", href: "/turmas" },
          { label: turma?.nome || "...", href: `/turmas/${id}` },
          { label: "Designações" }
        ]}
        actions={
          <div className="flex gap-2">
            <Link href={`/preview-pdf?url=/api/turmas/${id}/relatorios/designacoes/pdf&title=Designa%C3%A7%C3%B5es%20da%20Turma&back=/turmas/${id}/designacoes`} className="btn btn-ghost">
              <Printer size={16} /> Exportar PDF
            </Link>
            {temAcessoCompleto && (
              <>
                <Link href={`/turmas/${id}/designacoes/manual`} className="btn btn-ghost" style={{ border: "1px dashed var(--border)" }}>
                  Atribuição Rápida
                </Link>
                <button
                  className={`btn btn-primary ${gerandoDesig ? "btn-loading" : ""}`}
                  onClick={() => gerar()}
                  disabled={gerandoDesig}
                >
                  <Zap size={14} /> {gerandoDesig ? "A gerar..." : "Gerar Automaticamente"}
                </button>
              </>
            )}
          </div>
        }
      />

      <div className="page-body">
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 200 }} />)}
          </div>
        ) : !designacoes?.length ? (
          <div className="empty-state">
            <div className="empty-icon"><ClipboardList /></div>
            <p className="empty-title">Nenhuma designação carregada</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {designacoesPorDia.map(({ dia, partes }) => (
              <div key={dia} className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div className="card-header" style={{ padding: "16px 20px", background: "var(--bg-elevated)", marginBottom: 0 }}>
                  <span className="card-title" style={{ textTransform: "capitalize" }}>{dia}</span>
                  <span className="badge badge-activa">{partes.filter((p: any) => p.designacao_id).length} / {partes.length} preenchidas</span>
                </div>
                {partes.length === 0 ? (
                  <div style={{ padding: "24px", textAlign: "center", color: "var(--text-faint)", fontSize: 13 }}>
                    Nenhuma designação para este dia
                  </div>
                ) : (
                  <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: 80 }}>Hora</th>
                          <th>Parte</th>
                          <th style={{ width: 120 }}>Nível Requerido</th>
                          <th>Estudante Designado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partes.map((d: any) => (
                          <tr key={d.parte_id}>
                            <td className="font-mono text-muted">{d.hora_inicio ?? "—"}</td>
                            <td>
                              <div style={{ fontWeight: 500 }}>{d.titulo ?? "—"}</div>
                              <div className="text-xs text-muted" style={{ textTransform: "capitalize" }}>{d.tipo ?? "—"}</div>
                            </td>
                            <td><span className="badge badge-rascunho">{d.nivel_requerido ?? "—"}</span></td>
                            <td>
                              <select 
                                className="form-select" 
                                style={{ padding: "6px 8px", fontSize: 13, borderColor: d.designacao_id ? "transparent" : "var(--danger)" }}
                                value={d.turma_estudante_id ?? ""}
                                onChange={(e) => handleSelectEstudante(d.parte_id, dia, e.target.value)}
                                disabled={!temAcessoCompleto || atribuindo}
                              >
                                <option value="">-- Por atribuir --</option>
                                {estudantes?.map(est => (
                                  <option key={est.id} value={est.id}>
                                    {est.estudante_nome} (Nível: {est.nivel_oratoria ?? "Sem nível"})
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
