import { create } from "zustand";
import type { Turma, Estudante } from "@/lib/types";

// -------------------------------------------------------
// UI STORE — estado global de interface
// -------------------------------------------------------
interface UiStore {
  sidebarAberta: boolean;
  toggleSidebar: () => void;
  setSidebarAberta: (v: boolean) => void;

  modalAberto: string | null;
  abrirModal: (id: string) => void;
  fecharModal: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  sidebarAberta: true,
  toggleSidebar: () => set((s) => ({ sidebarAberta: !s.sidebarAberta })),
  setSidebarAberta: (v) => set({ sidebarAberta: v }),

  modalAberto: null,
  abrirModal: (id) => set({ modalAberto: id }),
  fecharModal: () => set({ modalAberto: null }),
}));

// -------------------------------------------------------
// TURMAS STORE
// -------------------------------------------------------
interface TurmasStore {
  turmaActiva: Turma | null;
  setTurmaActiva: (t: Turma | null) => void;
}

export const useTurmasStore = create<TurmasStore>((set) => ({
  turmaActiva: null,
  setTurmaActiva: (t) => set({ turmaActiva: t }),
}));

// -------------------------------------------------------
// ESTUDANTES STORE
// -------------------------------------------------------
interface EstudantesStore {
  estudanteActivo: Estudante | null;
  setEstudanteActivo: (e: Estudante | null) => void;
  filtroNome: string;
  setFiltroNome: (v: string) => void;
}

export const useEstudantesStore = create<EstudantesStore>((set) => ({
  estudanteActivo: null,
  setEstudanteActivo: (e) => set({ estudanteActivo: e }),
  filtroNome: "",
  setFiltroNome: (v) => set({ filtroNome: v }),
}));
