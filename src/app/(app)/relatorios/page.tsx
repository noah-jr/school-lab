"use client";
import { PageHeader } from "@/components/layout/Sidebar";
import { FileText, Download, Users, ClipboardList } from "lucide-react";
import { useTurmas } from "@/hooks/useTurmas";
import Link from "next/link";

export default function RelatoriosPage() {
  const { data, isLoading } = useTurmas({ status: "activa" });

  return (
    <>
      <PageHeader title="Relatórios" breadcrumb={[{ label: "Relatórios" }]} />
      <div className="page-body">
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="card-header" style={{ padding: "16px 20px", marginBottom: 0 }}>
            <span className="card-title">Exportação de Documentos (PDF)</span>
          </div>
          
          {isLoading ? (
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="skeleton" style={{ height: 60 }} />
              <div className="skeleton" style={{ height: 60 }} />
            </div>
          ) : !data?.data?.length ? (
            <div className="empty-state" style={{ padding: "32px 24px" }}>
              <FileText size={28} style={{ opacity: 0.3 }} />
              <p className="empty-title">Nenhuma turma activa</p>
              <p className="empty-desc">Inicie uma turma para gerar relatórios.</p>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: "none" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                  <tr>
                    <th style={{ padding: "12px 24px", color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Turma</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Local</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Folha Viajante</th>
                    <th style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Programa</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map(t => (
                    <tr key={t.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }} onMouseOver={e => e.currentTarget.style.background = "var(--bg-elevated)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ fontWeight: 600, padding: "12px 24px" }}>
                        <Link href={`/turmas/${t.id}`} style={{ color: "var(--text)", fontSize: "13px" }}>
                          {t.nome}
                        </Link>
                      </td>
                      <td className="text-muted" style={{ fontSize: "13px" }}>{t.local_nome}</td>
                      <td>
                        <Link href={`/relatorios/${t.id}/viajante`} className="btn btn-ghost btn-sm" style={{ fontSize: "12px", display: "inline-flex", gap: "6px" }}>
                          <Users size={14} /> Viajante PDF
                        </Link>
                      </td>
                      <td>
                        <Link href={`/relatorios/${t.id}/programa`} className="btn btn-ghost btn-sm" style={{ fontSize: "12px", display: "inline-flex", gap: "6px" }}>
                          <ClipboardList size={14} /> Programa PDF
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
