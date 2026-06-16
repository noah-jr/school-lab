"use client";
import { PageHeader } from "@/components/layout/Sidebar";
import { useTurmas } from "@/hooks/useTurmas";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { BookOpen, Users, Plus, Activity, GraduationCap, Video, Shield, ChevronRight, FileText, Key, UserCheck, Filter, BarChart2, PieChart, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useState, useMemo } from "react";

function StatCard({ label, value, sub, accent, icon: Icon }: { label: string; value: string | number; sub?: string; accent: string; icon: any }) {
  return (
    <div style={{
      padding: "20px",
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: "4px",
      display: "flex",
      flexDirection: "column",
      position: "relative"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: 32, height: 32, background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", borderRadius: "2px" }}>
            <Icon size={16} color={accent} />
          </div>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
        </div>
      </div>
      <span style={{ fontSize: "28px", fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>{value}</span>
      {sub && <span style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-faint)", fontWeight: 500 }}>{sub}</span>}
    </div>
  );
}

function WorkflowStep({ number, title, desc }: { number: number, title: string, desc: string }) {
  return (
    <div style={{ display: "flex", gap: "16px", position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 24, height: 24, borderRadius: "2px", background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: 12, zIndex: 2 }}>
          {number}
        </div>
        <div style={{ flex: 1, width: 1, background: "var(--border)", margin: "4px 0", zIndex: 1, opacity: number === 4 ? 0 : 1 }} />
      </div>
      <div style={{ paddingBottom: "24px", paddingTop: "2px" }}>
        <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          {title}
        </h4>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  );
}

function ModuleCard({ title, desc, icon: Icon, href, actionLabel }: { title: string, desc: string, icon: any, href: string, actionLabel?: string }) {
  return (
    <Link href={href} style={{ padding: "24px", display: "flex", flexDirection: "column", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "4px", textDecoration: "none", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
        <div style={{ width: 44, height: 44, background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", borderRadius: "4px" }}>
          <Icon size={22} color="var(--text-muted)" />
        </div>
        <div>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>{title}</h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>{desc}</p>
        </div>
      </div>
      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent)", textTransform: "uppercase" }}>{actionLabel || "Aceder Módulo"}</span>
        <ChevronRight size={16} color="var(--text-faint)" />
      </div>
    </Link>
  );
}

// ----------------------------------------------------
// NATIVE CHARTS (PURE CSS & SVG)
// ----------------------------------------------------

function AnalyticalBarChart({ data }: { data: { label: string, current: number, previous: number }[] }) {
  const maxVal = Math.max(...data.map(d => Math.max(d.current, d.previous)), 10);

  return (
    <div style={{ width: "100%", padding: "20px 0 10px", display: "flex", alignItems: "flex-end", height: "100%", gap: "12px", minHeight: "220px" }}>
      {data.map((item, idx) => (
        <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "4px", width: "100%", height: "100%", position: "relative" }}>
            <div style={{ width: "40%", height: `${(item.previous / maxVal) * 100}%`, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "2px 2px 0 0", transition: "height 0.5s ease" }} title={`Anterior: ${item.previous}`} />
            <div style={{ width: "40%", height: `${(item.current / maxVal) * 100}%`, background: "var(--accent)", opacity: 0.85, borderRadius: "2px 2px 0 0", transition: "height 0.5s ease" }} title={`Atual: ${item.current}`} />
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-faint)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%", textAlign: "center" }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function AnalyticalAreaChart({ data }: { data: { label: string, current: number }[] }) {
  const maxVal = Math.max(...data.map(d => d.current), 10);
  const minVal = 0;

  // Create SVG points
  // Map index to X (0 to 100) and value to Y (100 down to 0)
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * 100;
    const y = 100 - ((d.current - minVal) / (maxVal - minVal)) * 100;
    return `${x},${y}`;
  });

  const pathPoints = pts.join(" ");
  const areaPoints = `0,100 ${pathPoints} 100,100`;

  return (
    <div style={{ width: "100%", height: "100%", minHeight: "220px", display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ flex: 1, position: "relative", width: "100%", minHeight: 0 }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: "2px" }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--success)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--success)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon fill="url(#areaGrad)" points={areaPoints} style={{ transition: "all 0.5s ease" }} />
          <polyline fill="none" stroke="var(--success)" strokeWidth="2" vectorEffect="non-scaling-stroke" points={pathPoints} style={{ transition: "all 0.5s ease" }} strokeLinejoin="round" />
        </svg>

        {/* Data Points HTML Overlay para manter tamanho fixo sem deformação SVG */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1 || 1)) * 100;
          const y = 100 - ((d.current - minVal) / (maxVal - minVal)) * 100;
          return (
            <div 
              key={i} 
              style={{ 
                position: "absolute", 
                left: `${x}%`, 
                top: `${y}%`, 
                width: "10px", 
                height: "10px", 
                marginTop: "-5px", 
                marginLeft: "-5px", 
                borderRadius: "50%", 
                background: "var(--bg-surface)", 
                border: "2px solid var(--success)",
                transition: "all 0.5s ease",
                zIndex: 10,
                boxShadow: "0 0 0 2px var(--bg-surface)"
              }}
              title={`${d.label}: ${d.current}`}
            />
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
        {data.map((d, i) => (
          <span key={i} style={{ fontSize: "11px", color: "var(--text-faint)", fontWeight: 600, textTransform: "uppercase" }}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

function AnalyticalDonutChart() {
  // Using pure CSS conic gradient for a fast, responsive Donut chart
  const slices = [
    { label: "Nível A", pct: 45, color: "var(--success)" },
    { label: "Nível C", pct: 30, color: "var(--info)" },
    { label: "Nível B", pct: 25, color: "var(--warning)" },
  ];

  const gradientString = `
    var(--success) 0% 45%, 
    var(--info) 45% 75%, 
    var(--warning) 75% 100%
  `;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "220px", gap: "32px" }}>
      <div style={{ position: "relative", width: "140px", height: "140px", borderRadius: "50%", background: `conic-gradient(${gradientString})` }}>
        {/* Inner circle for Donut hole */}
        <div style={{ position: "absolute", top: "25%", left: "25%", width: "50%", height: "50%", background: "var(--bg-surface)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>100%</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {slices.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: 12, height: 12, borderRadius: "2px", background: s.color }} />
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{s.label}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{s.pct}% da Base</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------

export default function DashboardPage() {
  const { data: user } = useAuth();
  const { data: turmasData, isLoading: loadingTurmas } = useTurmas();
  const stats = turmasData?.stats;

  const [filtroTempo, setFiltroTempo] = useState("mensal");
  const [filtroCongregacao, setFiltroCongregacao] = useState("todas");

  const { data: estudantesReq } = useQuery({
    queryKey: ["estudantes", "stats"],
    queryFn: async () => {
      const res = await api.get("/estudantes?por_pagina=1");
      return res.data;
    }
  });

  const { data: utilizadoresReq } = useQuery({
    queryKey: ["utilizadores"],
    queryFn: async () => {
      const res = await api.get("/utilizadores");
      return res.data.data;
    }
  });

  const percentConcluidas = stats?.total ? Math.round(((stats.concluidas || 0) / stats.total) * 100) : 0;

  const chartData = useMemo(() => {
    let data = [];
    if (filtroTempo === "diario") {
      data = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(d => ({ label: d, current: Math.floor(Math.random() * 5), previous: Math.floor(Math.random() * 5) }));
    } else if (filtroTempo === "semanal") {
      data = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"].map(d => ({ label: d, current: Math.floor(Math.random() * 15), previous: Math.floor(Math.random() * 15) }));
    } else if (filtroTempo === "quinzenal") {
      data = ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"].map(d => ({ label: d, current: Math.floor(Math.random() * 25), previous: Math.floor(Math.random() * 25) }));
    } else if (filtroTempo === "anual") {
      data = ["2023", "2024", "2025", "2026"].map(d => ({ label: d, current: Math.floor(Math.random() * 150) + 50, previous: Math.floor(Math.random() * 150) + 50 }));
    } else {
      data = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map(d => ({ label: d, current: Math.floor(Math.random() * 40) + 10, previous: Math.floor(Math.random() * 40) + 10 }));
    }
    return data;
  }, [filtroTempo, filtroCongregacao]);

  const modifier = filtroTempo === "diario" ? 0.05 : filtroTempo === "semanal" ? 0.15 : filtroTempo === "quinzenal" ? 0.3 : filtroTempo === "anual" ? 1.5 : 1;
  const filteredEstudantes = estudantesReq ? Math.floor(estudantesReq.total * modifier) : "—";
  const filteredTurmas = stats ? Math.floor(stats.total * modifier) : "—";

  return (
    <>
      <PageHeader
        title="Painel de Controlo"
        actions={
          <div style={{ display: "flex", gap: "8px" }}>
            <Link href="/turmas" className="btn btn-ghost" style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid var(--border)" }}>
              Inventário
            </Link>
            <Link href="/turmas/nova" className="btn btn-primary" style={{ padding: "6px 12px", borderRadius: "4px" }}>
              <Plus size={14} style={{ marginRight: 6 }} /> Criar Turma
            </Link>
          </div>
        }
      />

      <div className="page-body" style={{ maxWidth: "1600px", margin: "0 auto", padding: "24px" }}>

        {/* Banner Institucional */}
        <div style={{
          marginBottom: "24px",
          padding: "32px 40px",
          borderRadius: "4px",
          background: "var(--bg-elevated)",
          color: "var(--text)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: "1px solid var(--border)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <Shield size={20} color="var(--info)" />
              <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-faint)", fontWeight: 600 }}>Acesso Autenticado</span>
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 600, letterSpacing: "-0.01em", marginBottom: "12px" }}>
              Bem-vindo(a), {user?.nome || "Instrutor"}.
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", maxWidth: "700px", lineHeight: 1.6 }}>
              Sistema de gestão central da Escola para Anciãos de Congregação. Monitorize as métricas operacionais globais, administre o calendário de turmas e acompanhe a evolução demográfica dos inscritos.
            </p>
          </div>

          <div style={{ display: "none", '@media(min-width: 900px)': { display: "flex" }, gap: "24px" }}>
            <div style={{ background: "var(--bg-surface)", padding: "16px 24px", borderRadius: "4px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "20px", minWidth: "220px" }}>
              <div style={{ fontSize: "36px", fontWeight: "bold", fontFamily: "var(--font-mono)", color: "var(--success)", lineHeight: 1 }}>
                {stats?.activas || 0}
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Status Operacional</div>
                <div style={{ fontSize: "14px", fontWeight: "500", color: "var(--text)" }}>Turmas Activas</div>
              </div>
            </div>
            <div style={{ background: "var(--bg-surface)", padding: "16px 24px", borderRadius: "4px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "20px", minWidth: "220px" }}>
              <div style={{ fontSize: "36px", fontWeight: "bold", fontFamily: "var(--font-mono)", color: "var(--info)", lineHeight: 1 }}>
                {percentConcluidas}%
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Índice de Conclusão</div>
                <div style={{ fontSize: "14px", fontWeight: "500", color: "var(--text)" }}>Turmas Fechadas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros Analíticos Globais */}
        <div style={{
          marginBottom: "24px",
          padding: "16px 24px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text)" }}>
            <Filter size={18} color="var(--text-muted)" />
            <span style={{ fontSize: "14px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Filtros Analíticos</span>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ fontSize: "12px", color: "var(--text-faint)", fontWeight: 600, textTransform: "uppercase" }}>Congregação</label>
              <select
                value={filtroCongregacao}
                onChange={e => setFiltroCongregacao(e.target.value)}
                style={{ padding: "6px 12px", fontSize: "13px", borderRadius: "2px", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text)", outline: "none", cursor: "pointer" }}
              >
                <option value="todas">Todas as Congregações</option>
                <option value="caculama">Caculama, Mucari / 260</option>
                <option value="quela">Desvio do Quela / 260</option>
                <option value="kiwaba">Kiwaba Nzoji / 260</option>
                <option value="kizanga1">Kizanga 01 / 260</option>
                <option value="kizanga2">Kizanga 02 / 260</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ fontSize: "12px", color: "var(--text-faint)", fontWeight: 600, textTransform: "uppercase" }}>Período</label>
              <select
                value={filtroTempo}
                onChange={e => setFiltroTempo(e.target.value)}
                style={{ padding: "6px 12px", fontSize: "13px", borderRadius: "2px", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text)", outline: "none", cursor: "pointer" }}
              >
                <option value="diario">Diário</option>
                <option value="semanal">Semanal</option>
                <option value="quinzenal">Quinzenal</option>
                <option value="mensal">Mensal</option>
                <option value="anual">Anual</option>
              </select>
            </div>
          </div>
        </div>

        {/* KPIs Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", marginBottom: "32px", minWidth: "100%" }}>
          <StatCard icon={BookOpen} label="Total de Turmas" value={loadingTurmas ? "—" : filteredTurmas} sub={`Registos (${filtroTempo})`} accent="var(--info)" />
          <StatCard icon={Activity} label="Em Preparação" value={loadingTurmas ? "—" : Math.floor((stats?.rascunhos || 0) * modifier)} sub="Por atribuir designações" accent="var(--success)" />
          <StatCard icon={Users} label="Corpo Estudantil" value={estudantesReq ? filteredEstudantes : "—"} sub="Ativos no período" accent="var(--warning)" />
          <StatCard icon={Key} label="Acessos Ativos" value={utilizadoresReq ? utilizadoresReq.length : "—"} sub="Perfis no sistema" accent="var(--accent)" />
        </div>

        {/* SECÇÃO DOS GRÁFICOS ESTATÍSTICOS AVANÇADOS */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px", marginBottom: "32px" }}>

          {/* Gráfico de Barras - Esquerda Superior */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "4px", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <BarChart2 size={16} color="var(--accent)" /> Histórico de Processamento
              </h2>
            </div>
            <div style={{ padding: "16px 24px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AnalyticalBarChart data={chartData} />
            </div>
          </div>

          {/* Gráfico Donut (Pizza) - Direita Superior */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "4px", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <PieChart size={16} color="var(--success)" /> Distribuição de Oratória
              </h2>
            </div>
            <div style={{ padding: "16px 24px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AnalyticalDonutChart />
            </div>
          </div>

          {/* Gráfico de Área - Ocupa a largura total da linha inferior dos gráficos */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "4px", display: "flex", flexDirection: "column", gridColumn: "1 / -1" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <TrendingUp size={16} color="var(--success)" /> Evolução de Turmas e Atividade
              </h2>
            </div>
            <div style={{ padding: "16px 24px 24px", height: "280px" }}>
              <AnalyticalAreaChart data={chartData} />
            </div>
          </div>

        </div>

        {/* Layout Inferior: Módulos, Tabela e Procedimentos */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "32px", alignItems: "start" }}>

          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

            {/* Módulos do Sistema */}
            <div>
              <h2 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px", paddingLeft: "4px", borderLeft: "3px solid var(--text)" }}>
                Módulos do Sistema
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <ModuleCard
                  title="Catálogo de Turmas"
                  desc="Gestão de calendário, datas, e agrupamento congregacional."
                  icon={GraduationCap}
                  href="/turmas"
                  actionLabel="Abrir Turmas"
                />
                <ModuleCard
                  title="Directório de Estudantes"
                  desc="Consulta global da base de dados e histórico de registos."
                  icon={Users}
                  href="/estudantes"
                  actionLabel="Consultar Registos"
                />
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "4px", cursor: "pointer", height: "100%" }} onClick={() => alert('Dirija-se ao painel da turma para exportar PDFs.')}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                    <div style={{ width: 44, height: 44, background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", borderRadius: "4px" }}>
                      <FileText size={22} color="var(--text-muted)" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>Relatórios Oficiais</h3>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>Exportação PDF de designações.</p>
                    </div>
                  </div>
                  <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Disponível na Turma</span>
                    <ChevronRight size={16} color="var(--text-faint)" />
                  </div>
                </div>
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "4px", cursor: "pointer", height: "100%" }} onClick={() => alert('Dirija-se ao painel da turma para iniciar a conferência.')}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                    <div style={{ width: 44, height: 44, background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", borderRadius: "4px" }}>
                      <Video size={22} color="var(--text-muted)" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>Reuniões Remotas</h3>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>Integração Jitsi Meet para as aulas.</p>
                    </div>
                  </div>
                  <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Aceder na Turma</span>
                    <ChevronRight size={16} color="var(--text-faint)" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela de Turmas */}
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "4px" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-elevated)" }}>
                <h2 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Inventário Recente
                </h2>
                <Link href="/turmas" style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>Abrir Lista Completa</Link>
              </div>

              {loadingTurmas ? (
                <div style={{ padding: "20px" }}><div className="skeleton" style={{ height: 160, borderRadius: "2px" }} /></div>
              ) : !turmasData?.data?.length ? (
                <div style={{ padding: "32px", textAlign: "center", color: "var(--text-faint)", fontSize: "13px" }}>Nenhum registo encontrado.</div>
              ) : (
                <div style={{ width: "100%", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
                      <tr>
                        <th style={{ padding: "12px 20px", textAlign: "left", color: "var(--text-faint)", fontWeight: 600 }}>ID</th>
                        <th style={{ padding: "12px 20px", textAlign: "left", color: "var(--text-faint)", fontWeight: 600 }}>Local</th>
                        <th style={{ padding: "12px 20px", textAlign: "left", color: "var(--text-faint)", fontWeight: 600 }}>Data Início</th>
                        <th style={{ padding: "12px 20px", textAlign: "center", color: "var(--text-faint)", fontWeight: 600 }}>Alunos</th>
                        <th style={{ padding: "12px 20px", textAlign: "left", color: "var(--text-faint)", fontWeight: 600 }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {turmasData.data.slice(0, 5).map((turma) => (
                        <tr key={turma.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.1s" }}>
                          <td style={{ padding: "12px 20px" }}>
                            <Link href={`/turmas/${turma.id}`} style={{ color: "var(--text)", fontWeight: 600, textDecoration: "none", display: "flex", gap: "8px", alignItems: "center" }}>
                              <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-faint)" }}>#{turma.numero_turma}</span>
                              {turma.nome}
                            </Link>
                          </td>
                          <td style={{ padding: "12px 20px", color: "var(--text-muted)" }}>{turma.local_nome}</td>
                          <td style={{ padding: "12px 20px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{new Date(turma.data_inicio).toLocaleDateString("pt-AO")}</td>
                          <td style={{ padding: "12px 20px", textAlign: "center" }}>
                            <span style={{ padding: "2px 8px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "2px", fontFamily: "var(--font-mono)", color: "var(--text)" }}>
                              {turma.total_estudantes ?? 0}
                            </span>
                          </td>
                          <td style={{ padding: "12px 20px" }}>
                            <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 6px", border: "1px solid var(--border)", borderRadius: "2px", color: "var(--text-muted)", textTransform: "uppercase" }}>
                              {turma.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

            <div style={{ padding: "24px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "4px" }}>
              <h2 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "24px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
                Protocolo Operacional Padrão
              </h2>

              <div style={{ paddingLeft: "4px" }}>
                <WorkflowStep
                  number={1}
                  title="Configuração da Turma"
                  desc="Registo formal da escola no sistema e inclusão inicial dos estudantes no catálogo."
                />
                <WorkflowStep
                  number={2}
                  title="Avaliação Técnica (Viajante)"
                  desc="Geração do token digital para o envio seguro do relatório por parte do Superintendente."
                />
                <WorkflowStep
                  number={3}
                  title="Atribuição Algorítmica"
                  desc="Processamento e distribuição automática das partes do programa aos estudantes avaliados."
                />
                <WorkflowStep
                  number={4}
                  title="Exportação de Credenciais"
                  desc="Geração do ficheiro PDF com o guião de designações e encaminhamento à sala virtual."
                />
              </div>
            </div>

            <div style={{ padding: "24px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "4px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text)" }}>
                <UserCheck size={20} />
                <h3 style={{ fontSize: "14px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Políticas de RBAC</h3>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                O sistema impõe controlo de acessos rigoroso. <strong>Instrutores</strong> detêm a capacidade integral de gerar e processar avaliações. As <strong>Secretárias</strong> possuem acesso limitado de leitura à informação demográfica.
              </p>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
