"use client";
import { use } from "react";
import { PageHeader } from "@/components/layout/Sidebar";
import { useTurmaEstudantes, useTurma } from "@/hooks/useTurmas";
import Link from "next/link";
import { Users, Plus, CheckCircle, Copy, Link2 } from "lucide-react";
import api from "@/lib/axios";
import { useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import type { Estudante } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";

export default function TurmaEstudantesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: turma } = useTurma(id);
  const { data: estudantes, isLoading } = useTurmaEstudantes(id);
  const qc = useQueryClient();
  const [loadingAvaliacao, setLoadingAvaliacao] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [estudanteIdSelecionado, setEstudanteIdSelecionado] = useState("");
  const [salvando, setSalvando] = useState(false);
  const toast = useToast();

  // Lista todos os estudantes para popular o select
  const { data: todosEstudantes } = useQuery({
    queryKey: ["estudantes", "all"],
    queryFn: async () => {
      const { data } = await api.get(`/estudantes?por_pagina=1000`);
      return data.data as Estudante[];
    }
  });

  const registarAvaliacao = async (turmaEstudanteId: string, nivel: string) => {
    try {
      setLoadingAvaliacao(turmaEstudanteId);
      await api.patch(`/turmas/${id}/estudantes/${turmaEstudanteId}`, { nivel_oratoria: nivel });
      qc.invalidateQueries({ queryKey: ["turmas", id, "estudantes"] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAvaliacao(null);
    }
  };

  const handleAdicionar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estudanteIdSelecionado) return;
    setSalvando(true);
    try {
      await api.post(`/turmas/${id}/estudantes`, { 
        estudante_id: estudanteIdSelecionado,
        numero_lista: (estudantes?.length || 0) + 1 
      });
      qc.invalidateQueries({ queryKey: ["turmas", id, "estudantes"] });
      setModalAberto(false);
      setEstudanteIdSelecionado("");
    } catch (err) {
      console.error(err);
    } finally {
      setSalvando(false);
    }
  };

  const handleImportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSalvando(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("turma_id", id);
      
      const { data: uploadRes } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const { data: importRes } = await api.post(`/turmas/${id}/importar`, {
        upload_id: uploadRes.data.id
      });
      
      toast.sucesso(importRes.mensagem);
      qc.invalidateQueries({ queryKey: ["turmas", id, "estudantes"] });
      qc.invalidateQueries({ queryKey: ["estudantes", "all"] });
    } catch (err) {
      console.error(err);
      toast.erro("Erro ao importar ficheiro. Verifique se o formato é DOCX da lista de estudantes.");
    } finally {
      setSalvando(false);
      if (e.target) e.target.value = ""; // reset input
    }
  };

  return (
    <>
      <PageHeader
        title="Estudantes da Turma"
        breadcrumb={[
          { label: "Turmas", href: "/turmas" },
          { label: turma?.nome || "...", href: `/turmas/${id}` },
          { label: "Estudantes" }
        ]}
        actions={
          <div className="flex gap-2">
            <button className={`btn btn-ghost ${salvando ? "btn-loading" : ""}`} onClick={async () => {
              setSalvando(true);
              try {
                const { data } = await api.post(`/turmas/${id}/token-avaliacao`);
                const link = `${window.location.origin}/avaliacao/${data.token}`;
                await navigator.clipboard.writeText(link);
                toast.sucesso("Link do Viajante copiado para a área de transferência!");
              } catch (err) {
                toast.erro("Erro ao gerar link para o viajante.");
              } finally {
                setSalvando(false);
              }
            }}>
              <Link2 size={14} /> Link Viajante
            </button>
            <label className={`btn btn-ghost ${salvando ? "btn-loading" : ""}`} style={{ cursor: "pointer" }}>
              <input type="file" accept=".docx" style={{ display: "none" }} onChange={handleImportUpload} disabled={salvando} />
              Importar DOCX
            </label>
            <button className="btn btn-primary" onClick={() => setModalAberto(true)} disabled={salvando}>
              <Plus size={14} /> Adicionar Manualmente
            </button>
          </div>
        }
      />

      <div className="page-body">
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="card-header" style={{ padding: "16px 20px" }}>
            <span className="card-title">Lista de Estudantes</span>
          </div>

          {isLoading ? (
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 8 }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 44 }} />)}
            </div>
          ) : !estudantes?.length ? (
            <div className="empty-state">
              <div className="empty-icon"><Users /></div>
              <p className="empty-title">Sem estudantes</p>
              <p className="empty-desc">Esta turma ainda não tem estudantes inscritos.</p>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: "none" }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nome</th>
                    <th>Congregação</th>
                    <th>Avaliação (Viajante)</th>
                    <th>Status</th>
                    <th style={{ width: 100 }}>Acesso</th>
                  </tr>
                </thead>
                <tbody>
                  {estudantes.map((te) => {
                    const nivelVal = te.nivel_oratoria ?? "";
                    const nivelCat = nivelVal.charAt(0) || "default";
                    return (
                      <tr key={te.id}>
                        <td className="font-mono text-muted">{te.numero_lista ?? "—"}</td>
                        <td style={{ fontWeight: 500 }}>{(te as any).estudante_nome ?? "—"}</td>
                        <td className="text-muted text-sm">{(te as any).congregacao_nome ?? "—"}</td>
                        <td>
                          <select 
                            className="form-select form-sm" 
                            style={{ width: "auto", padding: "4px 8px", fontSize: 12 }}
                            value={nivelVal}
                            onChange={(e) => registarAvaliacao(te.id, e.target.value)}
                            disabled={loadingAvaliacao === te.id}
                          >
                            <option value="">-- Sem Avaliação --</option>
                            <option value="A+">A+</option>
                            <option value="A">A</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B">B</option>
                            <option value="B-">B-</option>
                            <option value="C+">C+</option>
                            <option value="C">C</option>
                            <option value="C-">C-</option>
                          </select>
                        </td>
                        <td>
                          {te.avaliado_pelo_viajante ? (
                            <span className="badge badge-A flex items-center gap-2">
                              <CheckCircle size={12} /> Avaliado
                            </span>
                          ) : (
                            <span className="badge badge-C text-muted">Pendente</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            title="Copiar link de acesso pessoal"
                            onClick={() => {
                              const url = `${window.location.origin}/confirmacao/${te.token_acesso}`;
                              navigator.clipboard.writeText(url);
                              toast.sucesso("Link do estudante copiado!");
                            }}
                            disabled={!te.token_acesso}
                            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "4px 8px" }}
                          >
                            <Copy size={14} /> Link
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalAberto && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalAberto(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Adicionar Estudante</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setModalAberto(false)}>✕</button>
            </div>
            <form onSubmit={handleAdicionar}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Selecione o Estudante *</label>
                  <select 
                    className="form-select" 
                    required 
                    value={estudanteIdSelecionado} 
                    onChange={(e) => setEstudanteIdSelecionado(e.target.value)}
                  >
                    <option value="">-- Selecione --</option>
                    {todosEstudantes?.map((est) => {
                      const jaInscrito = estudantes?.some((e) => e.estudante_id === est.id);
                      if (jaInscrito) return null;
                      return (
                        <option key={est.id} value={est.id}>
                          {est.nome} ({(est as any).congregacao_nome || 'Sem congregação'})
                        </option>
                      );
                    })}
                  </select>
                  <div className="text-xs text-muted mt-2">
                    Apenas estudantes não inscritos nesta turma são apresentados.
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalAberto(false)}>Cancelar</button>
                <button type="submit" className={`btn btn-primary ${salvando ? "btn-loading" : ""}`} disabled={salvando || !estudanteIdSelecionado}>
                  {salvando ? "A adicionar..." : "Adicionar à Turma"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
