"use client";
import { create } from "zustand";
import { useEffect } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

// -------------------------------------------------------
// Store de Toasts
// -------------------------------------------------------
interface Toast {
  id: string;
  tipo: "success" | "error" | "info";
  mensagem: string;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (tipo: Toast["tipo"], mensagem: string) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (tipo, mensagem) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, tipo, mensagem }] }));
    // Auto-remove após 4s
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// -------------------------------------------------------
// Hook de conveniência
// -------------------------------------------------------
export function useToast() {
  const { addToast } = useToastStore();
  return {
    sucesso: (msg: string) => addToast("success", msg),
    erro: (msg: string) => addToast("error", msg),
    info: (msg: string) => addToast("info", msg),
  };
}

// -------------------------------------------------------
// Componente de renderização de Toasts
// -------------------------------------------------------
const ICON = {
  success: <CheckCircle size={16} color="var(--success)" />,
  error: <XCircle size={16} color="var(--danger)" />,
  info: <Info size={16} color="var(--info)" />,
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.tipo}`}>
          {ICON[t.tipo]}
          <span style={{ flex: 1, fontSize: 13 }}>{t.mensagem}</span>
          <button
            onClick={() => removeToast(t.id)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", padding: 2 }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
