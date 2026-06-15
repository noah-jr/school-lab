"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, Users, ClipboardList,
  FileText, Settings, ChevronRight, LogOut, Sun, Moon
} from "lucide-react";
import { useUiStore } from "@/store";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Turmas", href: "/turmas", icon: BookOpen },
  { label: "Estudantes", href: "/estudantes", icon: Users },
  { label: "Designações", href: "/designacoes", icon: ClipboardList },
  { label: "Relatórios", href: "/relatorios", icon: FileText },
];

const secondaryItems = [
  { label: "Programas", href: "/programas", icon: BookOpen },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

export function Sidebar({ papel }: { papel?: string }) {
  const pathname = usePathname();
  const sidebarAberta = useUiStore((s) => s.sidebarAberta);

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

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <aside className={`sidebar ${sidebarAberta ? "" : "collapsed"}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏫</div>
        <div>
          <div className="sidebar-logo-text">EAC Sistema</div>
          <div className="sidebar-logo-sub">Gestão de Turmas</div>
        </div>
      </div>

      {/* Navegação principal */}
      <nav className="sidebar-nav">
        <span className="nav-section-label">Principal</span>
        {navItems.filter(i => papel !== "secretaria" || ["Dashboard", "Turmas", "Estudantes"].includes(i.label)).map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive(item.href) ? "active" : ""}`}
            >
              <Icon className="nav-icon" size={16} />
              {item.label}
            </Link>
          );
        })}

        <div className="divider" style={{ margin: "12px 0" }} />
        {papel !== "secretaria" && (
          <>
            <span className="nav-section-label">Sistema</span>
            {secondaryItems.map((item) => {
              const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive(item.href) ? "active" : ""}`}
            >
              <Icon className="nav-icon" size={16} />
              {item.label}
            </Link>
          );
        })}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="nav-item" style={{ width: "100%", border: "none", background: "none", cursor: "pointer" }}>
          <LogOut className="nav-icon text-danger" size={16} />
          <span className="text-danger">Terminar Sessão</span>
        </button>
        
        <button onClick={toggleTheme} className="nav-item" style={{ width: "100%", border: "none", background: "none", cursor: "pointer", marginTop: "8px" }}>
          {theme === "light" ? <Moon className="nav-icon" size={16} /> : <Sun className="nav-icon" size={16} />}
          <span>{theme === "light" ? "Modo Escuro" : "Modo Claro"}</span>
        </button>

        <div className="text-xs text-faint" style={{ padding: "4px 10px", marginTop: 12 }}>
          v0.1.0 — EAC Angola
        </div>
      </div>
    </aside>
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
  return (
    <header className="page-header">
      <div>
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="flex items-center gap-2" style={{ marginBottom: 2 }}>
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <ChevronRight size={12} className="text-faint" />}
                {item.href ? (
                  <Link href={item.href} className="text-xs text-muted" style={{ hover: { color: "var(--text)" } }}>
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-xs text-faint">{item.label}</span>
                )}
              </span>
            ))}
          </div>
        )}
        <h1 className="page-header-title">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
