"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, Users, ClipboardList,
  FileText, Settings, ChevronRight, LogOut, Sun, Moon, Shield,
  Search, Bell, MessageSquare, User, Menu, Info
} from "lucide-react";
import { useUiStore } from "@/store";
import { useEffect, useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Logo } from "@/components/ui/Logo";

const navItems = [
  { label: "Painel de Controlo", href: "/dashboard", icon: LayoutDashboard },
  { label: "Turmas", href: "/turmas", icon: BookOpen },
  { label: "Estudantes", href: "/estudantes", icon: Users },
  { label: "Designações", href: "/designacoes", icon: ClipboardList },
  { label: "Relatórios", href: "/relatorios", icon: FileText },
];

const secondaryItems = [
  { label: "Caixa de Entrada", href: "/mensagens", icon: MessageSquare },
  { label: "Utilizadores (RBAC)", href: "/utilizadores", icon: Shield },
  { label: "Programas", href: "/programas", icon: BookOpen },
  { label: "Sobre o Sistema", href: "/sobre", icon: Info },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

function GlobalSearch() {
  const [q, setQ] = useState("");
  const [aberto, setAberto] = useState(false);
  const [resultados, setResultados] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const buscar = useCallback(async (texto: string) => {
    if (texto.trim().length < 2) {
      setResultados(null);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`/pesquisa?q=${encodeURIComponent(texto)}`);
      setResultados(data.data);
    } catch {
      setResultados(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQ(val);
    setAberto(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => buscar(val), 350);
  };

  const navegar = (href: string) => {
    router.push(href);
    setQ("");
    setAberto(false);
    setResultados(null);
  };

  // Fechar ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const temResultados = resultados &&
    (resultados.estudantes?.length > 0 || resultados.turmas?.length > 0 || resultados.utilizadores?.length > 0);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", background: "var(--bg-elevated)", borderRadius: 99, padding: "6px 12px", border: `1px solid ${aberto ? "var(--accent)" : "var(--border)"}`, transition: "border-color 0.2s" }}>
        <Search size={14} color="var(--text-faint)" />
        <input
          type="text"
          value={q}
          onChange={handleChange}
          onFocus={() => { if (q.length >= 2) setAberto(true); }}
          placeholder="Pesquisa global..."
          style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, marginLeft: 8, width: 180, color: "var(--text)" }}
        />
        {loading && <span style={{ marginLeft: 4, fontSize: 10, color: "var(--text-faint)" }}>...</span>}
      </div>

      {aberto && q.length >= 2 && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 340, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, boxShadow: "0 10px 30px rgba(0,0,0,0.15)", zIndex: 999, overflow: "hidden" }}>
          {!temResultados && !loading ? (
            <div style={{ padding: "20px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Nenhum resultado encontrado.</div>
          ) : (
            <>
              {resultados?.estudantes?.length > 0 && (
                <div>
                  <div style={{ padding: "8px 12px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-faint)", background: "var(--bg-elevated)", letterSpacing: 1 }}>Estudantes</div>
                  {resultados.estudantes.map((e: any) => (
                    <button key={e.id} onClick={() => navegar(`/estudantes/${e.id}`)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left", transition: "background 0.15s" }} onMouseOver={ev => (ev.currentTarget.style.background = "var(--bg-elevated)")} onMouseOut={ev => (ev.currentTarget.style.background = "transparent")}>
                      <Users size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{e.nome}</div>
                        <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{e.papel_ministerial === "anciao" ? "Ancião" : "Servo Ministerial"}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {resultados?.turmas?.length > 0 && (
                <div style={{ borderTop: resultados?.estudantes?.length > 0 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ padding: "8px 12px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-faint)", background: "var(--bg-elevated)", letterSpacing: 1 }}>Turmas</div>
                  {resultados.turmas.map((t: any) => (
                    <button key={t.id} onClick={() => navegar(`/turmas/${t.id}`)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left", transition: "background 0.15s" }} onMouseOver={ev => (ev.currentTarget.style.background = "var(--bg-elevated)")} onMouseOut={ev => (ev.currentTarget.style.background = "transparent")}>
                      <BookOpen size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{t.nome || `${t.numero_turma}ª Turma`}</div>
                        <div style={{ fontSize: 11, color: "var(--text-faint)" }}><span style={{ textTransform: "capitalize" }}>{t.status}</span></div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {resultados?.utilizadores?.length > 0 && (
                <div style={{ borderTop: "1px solid var(--border)" }}>
                  <div style={{ padding: "8px 12px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-faint)", background: "var(--bg-elevated)", letterSpacing: 1 }}>Utilizadores</div>
                  {resultados.utilizadores.map((u: any) => (
                    <button key={u.id} onClick={() => navegar(`/utilizadores`)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left", transition: "background 0.15s" }} onMouseOver={ev => (ev.currentTarget.style.background = "var(--bg-elevated)")} onMouseOut={ev => (ev.currentTarget.style.background = "transparent")}>
                      <User size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{u.nome}</div>
                        <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{u.papel} • {u.email || "—"}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ papel }: { papel?: string }) {
  const pathname = usePathname();
  const sidebarAberta = useUiStore((s) => s.sidebarAberta);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const setSidebarAberta = useUiStore((s) => s.setSidebarAberta);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  // Controlar fecho automático em mobile ao carregar/mudar página
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth <= 768) {
        setSidebarAberta(false);
      }
    }
  }, [pathname, setSidebarAberta]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarAberta && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setSidebarAberta(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.3)",
            backdropFilter: "blur(2px)",
            zIndex: 45,
          }}
        />
      )}

      <aside className={`sidebar ${sidebarAberta ? "open" : "collapsed"}`}>
        {/* Logo */}
        <div 
          className="sidebar-logo" 
          style={{ 
            paddingLeft: sidebarAberta ? '16px' : '0px', 
            justifyContent: sidebarAberta ? 'flex-start' : 'center',
            transition: 'padding var(--t-base)'
          }}
        >
          <Logo size="md" showText={sidebarAberta} subtitle="Gestão de Turmas" />
        </div>

        {/* Navegação principal */}
        <nav className="sidebar-nav">
          {sidebarAberta && <span className="nav-section-label">Principal</span>}
          {navItems.filter(i => papel !== "secretaria" || ["Dashboard", "Turmas", "Estudantes"].includes(i.label)).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive(item.href) ? "active" : ""}`}
                title={!sidebarAberta ? item.label : undefined}
                style={{ justifyContent: sidebarAberta ? "flex-start" : "center" }}
              >
                <Icon className="nav-icon" size={16} />
                {sidebarAberta && <span>{item.label}</span>}
              </Link>
            );
          })}

          <div className="divider" style={{ margin: "12px 0" }} />
          {papel !== "secretaria" && (
            <>
              {sidebarAberta && <span className="nav-section-label">Sistema</span>}
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${isActive(item.href) ? "active" : ""}`}
                    title={!sidebarAberta ? item.label : undefined}
                    style={{ justifyContent: sidebarAberta ? "flex-start" : "center" }}
                  >
                    <Icon className="nav-icon" size={16} />
                    {sidebarAberta && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button 
            onClick={handleLogout} 
            className="nav-item" 
            style={{ width: "100%", border: "none", background: "none", cursor: "pointer", justifyContent: sidebarAberta ? "flex-start" : "center" }}
            title={!sidebarAberta ? "Terminar Sessão" : undefined}
          >
            <LogOut className="nav-icon text-danger" size={16} />
            {sidebarAberta && <span className="text-danger">Terminar Sessão</span>}
          </button>
          
          <button 
            onClick={toggleTheme} 
            className="nav-item" 
            style={{ width: "100%", border: "none", background: "none", cursor: "pointer", marginTop: "8px", justifyContent: sidebarAberta ? "flex-start" : "center" }}
            title={!sidebarAberta ? (theme === "light" ? "Modo Escuro" : "Modo Claro") : undefined}
          >
            {theme === "light" ? <Moon className="nav-icon" size={16} /> : <Sun className="nav-icon" size={16} />}
            {sidebarAberta && <span>{theme === "light" ? "Modo Escuro" : "Modo Claro"}</span>}
          </button>

          {sidebarAberta && (
            <div className="text-xs text-faint" style={{ padding: "4px 10px", marginTop: 12 }}>
              v0.1.0 — EAC Angola
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export function PageHeader({
  title,
  breadcrumb,
  actions,
}: {
  title: string;
  breadcrumb?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}) {
  const [showProfile, setShowProfile] = useState(false);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  const { data: notificacoesReq } = useQuery({
    queryKey: ["notificacoes"],
    queryFn: async () => {
      const res = await api.get("/notificacoes");
      return res.data.data;
    },
    refetchInterval: 30000 // A cada 30 segundos
  });

  const naoLidas = notificacoesReq?.filter((n: any) => !n.lida).length || 0;

  return (
    <header className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button 
          onClick={toggleSidebar} 
          className="btn-hamburger" 
          aria-label="Toggle Sidebar"
          style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            cursor: "pointer", 
            color: "var(--text-muted)", 
            padding: "6px", 
            borderRadius: "var(--radius)",
            transition: "background var(--t-fast)" 
          }}
          onMouseOver={e => e.currentTarget.style.background = "var(--bg-elevated)"}
          onMouseOut={e => e.currentTarget.style.background = "transparent"}
        >
          <Menu size={18} />
        </button>

        <div>
          {breadcrumb && breadcrumb.length > 0 && (
            <div className="flex items-center gap-2" style={{ marginBottom: 2 }}>
              {breadcrumb.map((item, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <ChevronRight size={12} className="text-faint" />}
                  {item.href ? (
                    <Link href={item.href} className="text-xs text-muted" style={{ transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color="var(--text)"} onMouseOut={e => e.currentTarget.style.color="var(--text-muted)"}>
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-xs text-faint">{item.label}</span>
                  )}
                </span>
              ))}
            </div>
          )}
          <h1 className="page-header-title" style={{ margin: 0 }}>{title}</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Pesquisa Global */}
        <GlobalSearch />

        {/* Mensagens */}
        <Link href="/mensagens" style={{ position: "relative", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
          <MessageSquare size={18} />
        </Link>

        {/* Notificações */}
        <Link href="/notificacoes" style={{ position: "relative", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
          <Bell size={18} />
          {naoLidas > 0 && (
            <span style={{ position: "absolute", top: -4, right: -4, background: "var(--danger)", color: "#fff", fontSize: 9, width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontWeight: "bold" }}>
              {naoLidas}
            </span>
          )}
        </Link>

        {/* Ações Específicas da Página */}
        {actions && <div className="flex items-center gap-2" style={{ borderLeft: "1px solid var(--border)", paddingLeft: 16, marginLeft: 8 }}>{actions}</div>}

        {/* Perfil do Utilizador */}
        <div style={{ position: "relative", marginLeft: 8, borderLeft: "1px solid var(--border)", paddingLeft: 16 }}>
          <button 
            onClick={() => setShowProfile(!showProfile)}
            style={{ background: "var(--accent)", border: "none", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}
          >
            <User size={16} />
          </button>
          
          {showProfile && (
            <div style={{ position: "absolute", top: 40, right: 0, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 0", width: 220, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", zIndex: 100 }}>
              <div style={{ padding: "8px 16px 12px", borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Sessão Activa</div>
              </div>
              <Link href="/perfil" onClick={() => setShowProfile(false)} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text)", padding: "8px 16px", textDecoration: "none", transition: "background 0.15s" }} onMouseOver={e => e.currentTarget.style.background = "var(--bg-elevated)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                <User size={14} />O Meu Perfil
              </Link>
              <Link href="/logs" onClick={() => setShowProfile(false)} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-muted)", padding: "8px 16px", textDecoration: "none", transition: "background 0.15s" }} onMouseOver={e => e.currentTarget.style.background = "var(--bg-elevated)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                <Shield size={14} />Logs do Sistema
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
