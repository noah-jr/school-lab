"use client";
import { use } from "react";
import { PageHeader } from "@/components/layout/Sidebar";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Estudante } from "@/lib/types";
import { UserCircle, BookOpen, Clock } from "lucide-react";
import Link from "next/link";

export default function EstudanteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: response, isLoading } = useQuery({
    queryKey: ["estudantes", "detail", id],
    queryFn: async () => {
      const { data } = await api.get(`/estudantes/${id}`);
      return data.data as Estudante & { historico: any[] };
    },
    enabled: !!id,
  });

  const estudante = response;

  if (isLoading) {
    return (
      <>
        <PageHeader title="..." breadcrumb={[{ label: "Estudantes", href: "/estudantes" }, { label: "..." }]} />
        <div className="page-body">
          <div className="skeleton" style={{ height: 120, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 400 }} />
        </div>
      </>
    );
  }

  if (!estudante) return (
    <div className="empty-state" style={{ minHeight: "100dvh" }}>
      <p className="empty-title">Estudante não encontrado</p>
      <Link href="/estudantes" className="btn btn-ghost btn-sm">← Voltar à lista</Link>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Perfil do Estudante"
        breadcrumb={[{ label: "Estudantes", href: "/estudantes" }, { label: estudante.nome }]}
      />

      <div className="page-body">
        
        {/* Cartão de Perfil */}
        <div className="card" style={{ marginBottom: 24, display: "flex", gap: 24, alignItems: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UserCircle size={40} color="var(--text-muted)" />
          </div>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{estudante.nome}</h2>
            <div className="flex gap-4 text-sm text-muted">
              <span><span className="font-semibold text-text">Papel:</span> {estudante.papel_ministerial === "anciao" ? "Ancião" : "Servo Ministerial"}</span>
              <span><span className="font-semibold text-text">Congregação:</span> {(estudante as any).congregacao_nome || "—"}</span>
              <span><span className="font-semibold text-text">Email:</span> {estudante.email_jwpub || "—"}</span>
              <span><span className="font-semibold text-text">Telf:</span> {estudante.telefone_principal || "—"}</span>
            </div>
          </div>
        </div>

        {/* Histórico de Turmas */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="card-header" style={{ padding: "16px 20px" }}>
            <span className="card-title flex items-center gap-2">
              <BookOpen size={16} /> Histórico de Turmas EAC
            </span>
          </div>

          {!estudante.historico?.length ? (
            <div className="empty-state" style={{ padding: "32px 24px" }}>
              <Clock size={28} style={{ opacity: 0.3 }} />
              <p className="empty-title">Sem histórico</p>
              <p className="empty-desc">Este estudante ainda não participou em nenhuma turma.</p>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Turma</th>
                    <th>Período</th>
                    <th>Nº Lista</th>
                    <th>Avaliação Recebida</th>
                    <th>Status Turma</th>
                  </tr>
                </thead>
                <tbody>
                  {estudante.historico.map((h: any) => {
                    const nivel = h.nivel_oratoria?.charAt(0) ?? "default";
                    return (
                      <tr key={h.id}>
                        <td style={{ fontWeight: 500 }}>
                          <Link href={`/turmas/${h.turma_id}`} style={{ color: "var(--accent)" }}>
                            {h.numero_turma}ª - {h.turma_nome}
                          </Link>
                        </td>
                        <td className="text-muted text-sm">
                          {new Date(h.data_inicio).toLocaleDateString("pt-AO")} a {new Date(h.data_fim).toLocaleDateString("pt-AO")}
                        </td>
                        <td className="font-mono text-sm">{h.numero_lista}</td>
                        <td>
                          {h.nivel_oratoria ? (
                            <span className={`badge badge-${nivel}`}>{h.nivel_oratoria}</span>
                          ) : (
                            <span className="text-faint text-xs">Pendente</span>
                          )}
                        </td>
                        <td><span className={`badge badge-${h.status}`}>{h.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
