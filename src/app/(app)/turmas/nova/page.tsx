"use client";
import { PageHeader } from "@/components/layout/Sidebar";
import { useCriarTurma } from "@/hooks/useTurmas";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Users, Hash, Info } from "lucide-react";
import type { CriarTurmaInput } from "@/lib/types";

export default function NovaTurmaPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCriarTurma();
  const [form, setForm] = useState<Partial<CriarTurmaInput>>({
    status: "rascunho", pais: "Angola", numero_turma: 1, nome: "1ª Turma EAC",
    local_cidade: "", local_nome: "", instrutor_a_nome: "", instrutor_b_nome: "",
    restricao_diaria: 1
  });
  const [nomeEditadoManualmente, setNomeEditadoManualmente] = useState(false);

  const set = (k: keyof CriarTurmaInput, v: unknown) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (k === "nome") setNomeEditadoManualmente(true);
  };

  // Auto-gerar nome da turma se o utilizador não o tiver editado manualmente
  useEffect(() => {
    if (!nomeEditadoManualmente) {
      const num = form.numero_turma || 1;
      const cidade = form.local_cidade ? ` — ${form.local_cidade}` : "";
      setForm(f => ({ ...f, nome: `${num}ª Turma EAC${cidade}` }));
    }
  }, [form.numero_turma, form.local_cidade, nomeEditadoManualmente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const novaTurma = await mutateAsync(form as CriarTurmaInput);
      router.push(`/turmas/${novaTurma.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <h3 style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "8px", paddingBottom: "8px", borderBottom: "1px solid var(--border)", marginBottom: "16px" }}>
      <Icon size={14} color="var(--accent)" /> {title}
    </h3>
  );

  return (
    <>
      <PageHeader
        title="Criar Nova Turma"
        breadcrumb={[
          { label: "Turmas", href: "/turmas" },
          { label: "Registo de Turma" }
        ]}
      />

      <div className="page-body" style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 16px" }}>
        
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text)", letterSpacing: "-0.01em" }}>Configuração da Turma</h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>Preencha os detalhes da nova turma. O nome será gerado automaticamente com base no número e cidade.</p>
        </div>

        <div className="card" style={{ padding: "32px", borderTop: "3px solid var(--accent)" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            
            {/* Secção 1: Identificação */}
            <div>
              <SectionTitle icon={Hash} title="Identificação da Turma" />
              <div className="turma-identificacao-grid">
                <div className="form-group">
                  <label className="form-label">Número *</label>
                  <input type="number" className="form-input" required min={1}
                    value={form.numero_turma ?? ""}
                    onChange={(e) => set("numero_turma", Number(e.target.value))} 
                    style={{ fontFamily: "var(--font-mono)", fontSize: "14px" }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nome Oficial da Turma *</label>
                  <input className="form-input" required placeholder="ex: 451ª Turma EAC — Malange"
                    value={form.nome ?? ""}
                    onChange={(e) => set("nome", e.target.value)} 
                    style={{ fontWeight: 500 }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status Inicial</label>
                  <select className="form-select"
                    value={form.status ?? "rascunho"}
                    onChange={(e) => set("status", e.target.value)}>
                    <option value="rascunho">Rascunho</option>
                    <option value="activa">Activa</option>
                  </select>
                </div>
                
                <div className="form-group" style={{ gridColumn: "span 3", marginTop: "8px" }}>
                  <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "var(--text)" }}>
                    <input type="checkbox"
                      checked={form.restricao_diaria !== 0}
                      onChange={(e) => set("restricao_diaria", e.target.checked ? 1 : 0)}
                      style={{ width: "16px", height: "16px", accentColor: "var(--accent)", cursor: "pointer" }}
                    />
                    <span>Restrição Diária (máximo 1 parte por dia por estudante no algoritmo de distribuição)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Secção 2: Localização e Datas */}
            <div>
              <SectionTitle icon={MapPin} title="Localização e Calendário" />
              <div className="form-row" style={{ marginBottom: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Local (Edifício/Congregação) *</label>
                  <input className="form-input" required placeholder="ex: Salão de Assembleias de Viana"
                    value={form.local_nome ?? ""}
                    onChange={(e) => set("local_nome", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cidade / Província *</label>
                  <input className="form-input" required placeholder="ex: Luanda"
                    value={form.local_cidade ?? ""}
                    onChange={(e) => set("local_cidade", e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Data de Início *</label>
                  <div style={{ position: "relative" }}>
                    <Calendar size={14} style={{ position: "absolute", left: "10px", top: "11px", color: "var(--text-muted)" }} />
                    <input type="date" className="form-input" required
                      value={form.data_inicio ?? ""}
                      onChange={(e) => set("data_inicio", e.target.value)} 
                      style={{ paddingLeft: "32px", fontFamily: "var(--font-mono)" }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Data de Fim *</label>
                  <div style={{ position: "relative" }}>
                    <Calendar size={14} style={{ position: "absolute", left: "10px", top: "11px", color: "var(--text-muted)" }} />
                    <input type="date" className="form-input" required
                      value={form.data_fim ?? ""}
                      onChange={(e) => set("data_fim", e.target.value)} 
                      style={{ paddingLeft: "32px", fontFamily: "var(--font-mono)" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Secção 3: Equipa Instrutora */}
            <div>
              <SectionTitle icon={Users} title="Corpo Docente (Opcional)" />
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Instrutor A</label>
                  <input className="form-input" placeholder="Nome do Instrutor Principal"
                    value={form.instrutor_a_nome ?? ""}
                    onChange={(e) => set("instrutor_a_nome", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Instrutor B</label>
                  <input className="form-input" placeholder="Nome do Instrutor Auxiliar"
                    value={form.instrutor_b_nome ?? ""}
                    onChange={(e) => set("instrutor_b_nome", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div>
              <SectionTitle icon={Info} title="Notas Adicionais" />
              <div className="form-group">
                <textarea className="form-input" placeholder="Observações internas sobre a turma..." rows={3}
                  value={form.observacoes ?? ""}
                  onChange={(e) => set("observacoes", e.target.value)} 
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>
            
            <div style={{ paddingTop: "24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <Link href="/turmas" className="btn btn-ghost" style={{ padding: "10px 20px" }}>Cancelar</Link>
              <button type="submit" className={`btn btn-primary ${isPending ? "btn-loading" : ""}`} disabled={isPending} style={{ padding: "10px 24px" }}>
                {isPending ? "A Registar..." : "Registar Turma e Continuar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
