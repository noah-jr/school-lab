"use client";
import { use, useEffect, useState } from "react";
import api from "@/lib/axios";
import { CheckCircle, AlertCircle, BookOpen, Moon, Sun } from "lucide-react";

export default function AvaliacaoViajantePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [dados, setDados] = useState<any>(null);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [pesquisa, setPesquisa] = useState("");

  useEffect(() => {
    // Tenta ler a preferência do sistema ou do storage
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(prefersDark);
    
    api.get(`/public/avaliacao/${token}`)
      .then(res => setDados(res.data.data))
      .catch(err => setErro(err.response?.data?.erro || "Link inválido ou expirado."));
  }, [token]);

  const registarNota = async (estudante_id: string, nivel: string) => {
    setSalvando(estudante_id);
    try {
      await api.patch(`/public/avaliacao/${token}`, { turma_estudante_id: estudante_id, nivel });
      
      setDados((prev: any) => ({
        ...prev,
        estudantes: prev.estudantes.map((e: any) => 
          e.turma_estudante_id === estudante_id ? { ...e, nivel_oratoria: nivel, avaliado_pelo_viajante: 1 } : e
        )
      }));
    } catch (err) {
      alert("Erro ao gravar nota. Verifique a internet.");
    } finally {
      setSalvando(null);
    }
  };

  const theme = {
    bg: darkMode ? "#121212" : "#f8f9fa",
    cardBg: darkMode ? "#1e1e1e" : "#ffffff",
    text: darkMode ? "#ffffff" : "#1a1a1a",
    textMuted: darkMode ? "#a0a0a0" : "#666666",
    border: darkMode ? "#333333" : "#eaeaea",
    primary: darkMode ? "#2563eb" : "#1d4ed8",
    headerBg: darkMode ? "#0f172a" : "var(--primary, #0056b3)",
    btnNormalBg: darkMode ? "#2a2a2a" : "#f0f0f0",
  };

  if (erro) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: theme.bg }}>
      <div style={{ background: theme.cardBg, padding: 40, borderRadius: 12, textAlign: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", maxWidth: 400 }}>
        <AlertCircle size={56} color="#ef4444" style={{ margin: "0 auto 20px" }} />
        <h2 style={{ fontSize: 22, color: theme.text, marginBottom: 12 }}>Acesso Negado</h2>
        <p style={{ color: theme.textMuted, lineHeight: 1.5 }}>{erro}</p>
      </div>
    </div>
  );

  if (!dados) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: theme.bg, color: theme.text }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ width: 40, height: 40, border: "3px solid " + theme.primary, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ fontSize: 16, fontWeight: 500 }}>A preparar pauta eletrónica...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  const { turma, estudantes } = dados;
  const notas = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-"];
  
  // Filtro de pesquisa
  const estudantesFiltrados = estudantes.filter((e: any) => 
    e.estudante_nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
    (e.congregacao_nome && e.congregacao_nome.toLowerCase().includes(pesquisa.toLowerCase()))
  );

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, transition: "background 0.3s ease", paddingBottom: 80 }}>
      
      {/* Botão de Tema Flutuante */}
      <button 
        onClick={() => setDarkMode(!darkMode)}
        style={{
          position: "fixed", top: 16, right: 16, zIndex: 100,
          background: "rgba(0,0,0,0.2)", backdropFilter: "blur(4px)",
          border: "1px solid rgba(255,255,255,0.1)", color: "white",
          width: 44, height: 44, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "transform 0.2s"
        }}
        onMouseDown={e => e.currentTarget.style.transform = "scale(0.9)"}
        onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Cabeçalho Expandido */}
      <div style={{ background: theme.headerBg, color: "white", padding: "48px 24px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <BookOpen size={40} style={{ margin: "0 auto 16px", opacity: 0.9 }} />
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px 0", letterSpacing: "-0.5px" }}>Avaliação do Viajante</h1>
        <p style={{ margin: 0, fontSize: 16, opacity: 0.85, fontWeight: 500 }}>Turma {turma.numero_turma}ª - {turma.nome}</p>
      </div>

      {/* Contentor Expandido com Grelha */}
      <div style={{ maxWidth: 1600, width: "100%", margin: "-24px auto 0", padding: "0 16px", boxSizing: "border-box" }}>
        
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
          <div style={{ flex: "1 1 300px", background: theme.cardBg, padding: "20px 24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <p style={{ margin: 0, color: theme.textMuted, fontSize: 15, lineHeight: 1.6 }}>
              As suas avaliações são guardadas automaticamente na base de dados do <strong>Escola EAC</strong>. Selecione a nota apropriada.
            </p>
          </div>
          
          <div style={{ flex: "1 1 300px", display: "flex", background: theme.cardBg, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou congregação..." 
              value={pesquisa}
              onChange={e => setPesquisa(e.target.value)}
              style={{ 
                width: "100%", padding: "0 24px", fontSize: 16, border: "none", 
                background: "transparent", color: theme.text, outline: "none" 
              }}
            />
          </div>
        </div>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
          gap: 16 
        }}>
          {estudantesFiltrados.map((e: any) => (
            <div key={e.turma_estudante_id} style={{ 
              background: theme.cardBg, 
              padding: 24, 
              borderLeft: e.avaliado_pelo_viajante ? `6px solid #10b981` : `6px solid transparent`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              display: "flex", flexDirection: "column"
            }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <h3 style={{ margin: "0 0 6px 0", fontSize: 18, fontWeight: 700, color: theme.text }}>
                    {e.numero_lista ? <span style={{ opacity: 0.5, marginRight: 4 }}>#{e.numero_lista}</span> : ""}
                    {e.estudante_nome}
                  </h3>
                  <p style={{ margin: 0, fontSize: 14, color: theme.textMuted, fontWeight: 500 }}>
                    {e.papel_ministerial === "anciao" ? "Ancião" : "Servo Ministerial"}
                    <span style={{ opacity: 0.5, margin: "0 6px" }}>•</span> 
                    {e.congregacao_nome || "Sem congregação"}
                  </p>
                </div>
                {e.avaliado_pelo_viajante && (
                  <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: 6 }}>
                    <CheckCircle size={24} color="#10b981" />
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, marginTop: "auto" }}>
                {notas.map(nota => {
                  const isSelected = e.nivel_oratoria === nota;
                  return (
                    <button
                      key={nota}
                      onClick={() => registarNota(e.turma_estudante_id, nota)}
                      disabled={salvando === e.turma_estudante_id}
                      style={{
                        padding: "12px 0",
                        background: isSelected ? theme.primary : theme.btnNormalBg,
                        color: isSelected ? "white" : theme.text,
                        border: "none",
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: 16,
                        cursor: "pointer",
                        transition: "all 0.1s",
                        opacity: (salvando === e.turma_estudante_id && isSelected) ? 0.7 : 1,
                      }}
                      onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = darkMode ? "#3a3a3a" : "#e0e0e0" }}
                      onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = theme.btnNormalBg }}
                    >
                      {salvando === e.turma_estudante_id && isSelected ? "..." : nota}
                    </button>
                  )
                })}
              </div>

            </div>
          ))}
        </div>

        {estudantesFiltrados.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, background: theme.cardBg }}>
            <p style={{ color: theme.textMuted, fontSize: 18 }}>Nenhum estudante encontrado.</p>
          </div>
        )}

      </div>
    </div>
  );
}
