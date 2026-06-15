"use client";
import { PageHeader } from "@/components/layout/Sidebar";
import Link from "next/link";
import { useTurmas } from "@/hooks/useTurmas";
import { ClipboardList, BookOpen } from "lucide-react";

export default function GlobalDesignacoesPage() {
  const { data, isLoading } = useTurmas({ status: "activa" });
  
  return (
    <>
      <PageHeader title="Designações" breadcrumb={[{ label: "Designações" }]} />
      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Selecione uma turma activa</span>
          </div>
          
          {isLoading ? (
            <div className="skeleton" style={{ height: 100 }} />
          ) : !data?.data?.length ? (
            <div className="empty-state">
              <ClipboardList size={28} style={{ opacity: 0.3 }} />
              <p className="empty-title">Nenhuma turma activa</p>
              <p className="empty-desc">Para ver designações, precisa de uma turma em andamento.</p>
              <Link href="/turmas" className="btn btn-primary btn-sm mt-4">Ver Turmas</Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
              {data.data.map(t => (
                <Link key={t.id} href={`/turmas/${t.id}/designacoes`} className="card" style={{ cursor: "pointer", display: "block" }}>
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen size={16} className="text-accent" />
                    <span className="font-semibold">{t.nome}</span>
                  </div>
                  <div className="text-sm text-muted">{t.local_nome}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
