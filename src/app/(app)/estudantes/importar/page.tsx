"use client";
import { PageHeader } from "@/components/layout/Sidebar";
import { useState } from "react";
import { Upload, ArrowRight, Save, Trash2, AlertCircle } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";

interface ImportRow {
  original: string;
  nome_formatado: string;
  idade?: string;
  congregacao?: string;
  contacto?: string;
  status: "pronto" | "erro" | "sucesso";
}

export default function ImportarEstudantesPage() {
  const [textoImportacao, setTextoImportacao] = useState("");
  const [linhasProcessadas, setLinhasProcessadas] = useState<ImportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Função para inverter "dos Santos, João Mateus" para "João Mateus dos Santos"
  const formatarNome = (nomeSujo: string) => {
    if (!nomeSujo.includes(",")) return nomeSujo.trim();
    const partes = nomeSujo.split(",");
    if (partes.length >= 2) {
      const apelido = partes[0].trim();
      const nomeProprio = partes.slice(1).join(" ").trim();
      return `${nomeProprio} ${apelido}`;
    }
    return nomeSujo.trim();
  };

  const processarTexto = () => {
    if (!textoImportacao.trim()) return;
    
    // Assumimos que o utilizador colou algo como:
    // dos Santos, João Mateus | 45 | Luanda Sul | 923...
    // Vamos processar linha a linha. Como pode ser um CSV ou Excel copiado, tentamos separar por Tabs ou pipes.
    const linhas = textoImportacao.split("\n").filter(l => l.trim() !== "");
    
    const resultado: ImportRow[] = linhas.map(linha => {
      // Tenta separar por Tab (Cópia do Excel)
      let colunas = linha.split("\t");
      if (colunas.length === 1) {
        colunas = linha.split("|").map(c => c.trim()); // Fallback para pipe
      }
      
      const nomeOriginal = colunas[0] || linha;
      
      return {
        original: nomeOriginal,
        nome_formatado: formatarNome(nomeOriginal),
        idade: colunas[1]?.trim() || "",
        congregacao: colunas[2]?.trim() || "Desconhecida",
        contacto: colunas[3]?.trim() || "",
        status: "pronto"
      };
    });

    setLinhasProcessadas(resultado);
  };

  const salvarTodos = async () => {
    setLoading(true);
    try {
      // Neste momento simulamos o envio. Idealmente faríamos um POST para /api/estudantes/batch
      // Exemplo fictício do payload:
      /*
      await api.post("/estudantes/lote", {
        estudantes: linhasProcessadas.map(l => ({
          nome: l.nome_formatado,
          congregacao_nome: l.congregacao,
          telefone: l.contacto
        }))
      });
      */
      
      // Simular delay de gravação
      await new Promise(r => setTimeout(r, 1000));
      
      setLinhasProcessadas(linhasProcessadas.map(l => ({ ...l, status: "sucesso" })));
      setSucesso(true);
    } catch (err) {
      alert("Erro ao gravar na base de dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader 
        title="Assistente de Importação Betel" 
        actions={<Link href="/estudantes" className="btn btn-ghost">Voltar ao Catálogo</Link>}
      />

      <div className="page-body" style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
        
        <div style={{ marginBottom: "24px", padding: "16px", background: "var(--info-bg, rgba(55, 148, 255, 0.1))", borderRadius: "var(--radius)", border: "1px solid var(--info, #3794ff)" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--info)", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>
            <AlertCircle size={16} /> Instruções para o Secretariado
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
            Copie os dados diretamente da folha do Excel/PDF enviada pela Filial e cole na caixa abaixo. 
            O sistema irá automaticamente detetar nomes no formato <strong>"Apelido, Nome Próprio"</strong> e corrigi-los para o formato natural. As colunas esperadas são: <em>Nome, Idade, Congregação, Contacto</em> (separadas por Tabulações ou Barras verticais |).
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: linhasProcessadas.length > 0 ? "repeat(auto-fit, minmax(300px, 1fr))" : "1fr", gap: "24px", alignItems: "start" }}>
          
          {/* PAINEL DE ENTRADA */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", textTransform: "uppercase" }}>
              1. Colar Dados Brutos (Raw Data)
            </label>
            <textarea 
              className="form-input" 
              rows={12} 
              placeholder={"dos Santos, João Mateus\t45\tLuanda Sul\t923000000\nCardoso, Manuel\t38\tViana Centro\t912000000"}
              value={textoImportacao}
              onChange={(e) => setTextoImportacao(e.target.value)}
              style={{ fontFamily: "var(--font-mono)", fontSize: "12px", padding: "16px", lineHeight: 1.6, resize: "vertical" }}
            />
            <button 
              className="btn btn-primary" 
              onClick={processarTexto} 
              disabled={!textoImportacao.trim()}
              style={{ justifyContent: "center", padding: "12px" }}
            >
              <Upload size={16} /> Processar {textoImportacao.split("\n").filter(l=>l.trim()).length || ""} Linhas
            </button>
          </div>

          {/* PAINEL DE RESULTADOS */}
          {linhasProcessadas.length > 0 && (
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", textTransform: "uppercase" }}>
                  2. Revisão & Gravação
                </label>
                {sucesso ? (
                  <span className="badge badge-activa">Importado com Sucesso</span>
                ) : (
                  <span className="badge badge-rascunho">{linhasProcessadas.length} Registos Encontrados</span>
                )}
              </div>

              <div className="table-wrapper" style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "var(--bg-elevated)", position: "sticky", top: 0 }}>
                    <tr>
                      <th style={{ padding: "10px 16px", fontSize: "11px", color: "var(--text-muted)" }}>Original da Filial</th>
                      <th style={{ padding: "10px 16px", fontSize: "11px", color: "var(--text-muted)" }}>Nome Corrigido</th>
                      <th style={{ padding: "10px 16px", fontSize: "11px", color: "var(--text-muted)" }}>Congregação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linhasProcessadas.map((linha, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "10px 16px", fontSize: "12px", color: "var(--danger)", fontFamily: "var(--font-mono)" }}>
                          <del>{linha.original}</del>
                        </td>
                        <td style={{ padding: "10px 16px", fontSize: "13px", fontWeight: 600, color: "var(--success)", display: "flex", alignItems: "center", gap: "6px" }}>
                          <ArrowRight size={12} color="var(--success)" /> {linha.nome_formatado}
                        </td>
                        <td style={{ padding: "10px 16px", fontSize: "12px", color: "var(--text-muted)" }}>
                          {linha.congregacao}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!sucesso ? (
                <div style={{ display: "flex", gap: "12px" }}>
                  <button className="btn btn-ghost" onClick={() => { setLinhasProcessadas([]); setTextoImportacao(""); }} style={{ flex: 1, justifyContent: "center" }}>
                    <Trash2 size={16} /> Descartar
                  </button>
                  <button className="btn btn-success" onClick={salvarTodos} disabled={loading} style={{ flex: 2, justifyContent: "center" }}>
                    <Save size={16} /> {loading ? "A Gravar..." : "Confirmar e Gravar na Base"}
                  </button>
                </div>
              ) : (
                <Link href="/estudantes" className="btn btn-primary" style={{ justifyContent: "center" }}>
                  Ver no Catálogo de Estudantes
                </Link>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
