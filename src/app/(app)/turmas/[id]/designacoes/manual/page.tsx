"use client";
import { use, useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/Sidebar";
import { useTurmaDesignacoes, useTurma, useTurmaEstudantes } from "@/hooks/useTurmas";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { ArrowLeft, Save, ShieldAlert, FileDigit } from "lucide-react";
import api from "@/lib/axios";
import { useToast } from "@/components/ui/Toast";
import { useQueryClient } from "@tanstack/react-query";

export default function TurmaDesignacoesManualPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: user, isLoading: authLoading } = useAuth();
  const { data: turma } = useTurma(id);
  const { data: estudantes, isLoading: loadingEst } = useTurmaEstudantes(id);
  const { data: designacoes, isLoading: loadingDes } = useTurmaDesignacoes(id);
  
  const toast = useToast();
  const qc = useQueryClient();

  // Estado local para os inputs: Record<turma_estudante_id, string (ex: "15, 23")>
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);

  // Preencher os inputs iniciais baseados nas designações já atribuídas
  useEffect(() => {
    if (designacoes && estudantes) {
      const novosInputs: Record<string, string> = {};
      estudantes.forEach(est => {
        // Encontrar as partes atribuídas a este estudante
        const atribuidas = designacoes.filter(d => (d as any).turma_estudante_id === est.id);
        if (atribuidas.length > 0) {
          const numeros = atribuidas.map(a => (a as any).numero).sort((a,b) => a - b).join(", ");
          novosInputs[est.id] = numeros;
        } else {
          novosInputs[est.id] = "";
        }
      });
      setInputs(novosInputs);
    }
  }, [designacoes, estudantes]);

  if (!authLoading && user?.papel === "secretaria") {
    return (
      <div className="empty-state" style={{ minHeight: "80dvh" }}>
        <ShieldAlert size={48} color="var(--danger)" style={{ opacity: 0.8, marginBottom: 16 }} />
        <p className="empty-title">Acesso Restrito</p>
        <p className="text-muted" style={{ maxWidth: 400, textAlign: "center", marginBottom: 24 }}>
          O seu perfil não permite atribuir designações.
        </p>
        <Link href={`/turmas/${id}/estudantes`} className="btn btn-primary">Voltar</Link>
      </div>
    );
  }

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      // 1. Processar as strings ("15, 23") e validar contra as partes existentes
      const atribuicoes: { turma_estudante_id: string; parte_id: string; dia_semana: string }[] = [];
      
      for (const estId of Object.keys(inputs)) {
        const texto = inputs[estId] || "";
        // Extrair números separados por vírgula ou espaço
        const numerosStr = texto.split(/[, \-]+/).filter(Boolean);
        
        for (const numStr of numerosStr) {
          const num = parseInt(numStr.trim(), 10);
          if (isNaN(num)) continue;
          
          // Procurar a parte correspondente
          const parte = designacoes?.find(d => (d as any).numero === num);
          if (parte) {
            atribuicoes.push({
              turma_estudante_id: estId,
              parte_id: (parte as any).parte_id,
              dia_semana: (parte as any).dia_semana,
            });
          }
        }
      }

      // 2. Enviar para a API
      await api.post(`/turmas/${id}/designacoes/bulk`, { atribuicoes });
      
      toast.sucesso("Designações atualizadas com sucesso!");
      qc.invalidateQueries({ queryKey: ["turmas", id, "designacoes"] });

    } catch (err: any) {
      toast.erro(err?.response?.data?.erro || "Erro ao salvar designações.");
    } finally {
      setSalvando(false);
    }
  };

  const isLoading = loadingEst || loadingDes;

  return (
    <>
      <PageHeader
        title="Atribuição Rápida (Por Número)"
        breadcrumb={[
          { label: "Turmas", href: "/turmas" },
          { label: turma?.nome || "...", href: `/turmas/${id}` },
          { label: "Designações", href: `/turmas/${id}/designacoes` },
          { label: "Atribuição Rápida" }
        ]}
        actions={
          <div className="flex gap-2">
            <Link href={`/turmas/${id}/designacoes`} className="btn btn-ghost">
              <ArrowLeft size={14} /> Voltar
            </Link>
            <button
              className={`btn btn-primary ${salvando ? "btn-loading" : ""}`}
              onClick={handleSalvar}
              disabled={salvando || isLoading}
            >
              <Save size={14} /> {salvando ? "A gravar..." : "Gravar Tudo"}
            </button>
          </div>
        }
      />

      <div className="page-body">
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60 }} />)}
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="card-header" style={{ padding: "16px 20px", background: "var(--bg-elevated)", marginBottom: 0, display: "flex", gap: 12, alignItems: "center" }}>
              <FileDigit size={18} className="text-primary" />
              <div>
                <span className="card-title" style={{ display: "block" }}>Mapa de Estudantes</span>
                <span className="text-xs text-muted">Digite os números das designações separados por vírgula (Ex: 15, 23, 42).</span>
              </div>
            </div>
            
            <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ width: "50px", textAlign: "center" }}>Nº</th>
                    <th style={{ minWidth: "250px" }}>Estudante</th>
                    <th style={{ width: "150px" }}>Congregação</th>
                    <th style={{ width: "120px", textAlign: "center" }}>Oratória</th>
                    <th>Números das Designações</th>
                  </tr>
                </thead>
                <tbody>
                  {estudantes?.map((est, idx) => (
                    <tr key={est.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }} onMouseOver={e => e.currentTarget.style.background = "var(--bg-elevated)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{est.estudante_nome}</td>
                      <td className="text-muted" style={{ fontSize: 13 }}>{est.congregacao_nome || "—"}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className="badge badge-activa">{est.nivel_oratoria || "S/A"}</span>
                      </td>
                      <td style={{ padding: "8px 16px" }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Ex: 15, 22"
                          style={{ maxWidth: "300px", fontFamily: "monospace", fontSize: 14 }}
                          value={inputs[est.id] || ""}
                          onChange={(e) => setInputs(prev => ({ ...prev, [est.id]: e.target.value }))}
                        />
                      </td>
                    </tr>
                  ))}
                  {estudantes?.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "40px" }}>
                        Nenhum estudante na turma.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
