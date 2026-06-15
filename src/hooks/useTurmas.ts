import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Turma, CriarTurmaInput, PaginatedResponse } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";

// -------------------------------------------------------
// QUERY KEYS
// -------------------------------------------------------
export const turmasKeys = {
  all: ["turmas"] as const,
  list: (filtros?: Record<string, unknown>) => ["turmas", "list", filtros] as const,
  detail: (id: string) => ["turmas", "detail", id] as const,
  estudantes: (id: string) => ["turmas", id, "estudantes"] as const,
  designacoes: (id: string) => ["turmas", id, "designacoes"] as const,
};

// -------------------------------------------------------
// HOOKS DE LEITURA
// -------------------------------------------------------
export function useTurmas(filtros?: { status?: string; pagina?: number }) {
  return useQuery({
    queryKey: turmasKeys.list(filtros),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filtros?.status) params.set("status", filtros.status);
      if (filtros?.pagina) params.set("pagina", String(filtros.pagina));
      const { data } = await api.get(`/turmas?${params}`);
      return data as PaginatedResponse<Turma> & { stats: Record<string, number> };
    },
    staleTime: 30_000,
  });
}

export function useTurma(id: string) {
  return useQuery({
    queryKey: turmasKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/turmas/${id}`);
      return data.data as Turma;
    },
    enabled: !!id,
  });
}

export function useTurmaEstudantes(turmaId: string) {
  return useQuery({
    queryKey: turmasKeys.estudantes(turmaId),
    queryFn: async () => {
      const { data } = await api.get(`/turmas/${turmaId}/estudantes`);
      return data.data as import("@/lib/types").TurmaEstudante[];
    },
    enabled: !!turmaId,
    refetchInterval: 5000, // Polling a cada 5s para atualizações em tempo real
  });
}

export function useTurmaDesignacoes(turmaId: string) {
  return useQuery({
    queryKey: turmasKeys.designacoes(turmaId),
    queryFn: async () => {
      const { data } = await api.get(`/turmas/${turmaId}/designacoes`);
      return data.data as import("@/lib/types").Designacao[];
    },
    enabled: !!turmaId,
    refetchInterval: 5000, // Polling a cada 5s para atualizações em tempo real
  });
}

// -------------------------------------------------------
// MUTATIONS
// -------------------------------------------------------
export function useCriarTurma() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: async (input: CriarTurmaInput) => {
      const { data } = await api.post("/turmas", input);
      return data.data as Turma;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: turmasKeys.all });
      toast.sucesso("Turma criada com sucesso!");
    },
    onError: (err: any) => {
      toast.erro(err?.message || "Erro ao criar turma.");
    }
  });
}

export function useActualizarTurma(id: string) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: async (input: Partial<CriarTurmaInput>) => {
      const { data } = await api.patch(`/turmas/${id}`, input);
      return data.data as Turma;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: turmasKeys.detail(id) });
      qc.invalidateQueries({ queryKey: turmasKeys.all });
      toast.sucesso("Turma actualizada com sucesso!");
    },
    onError: (err: any) => {
      toast.erro(err?.message || "Erro ao actualizar turma.");
    }
  });
}

export function useGerarDesignacoes(turmaId: string) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/turmas/${turmaId}/designacoes/gerar`);
      return data;
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["turmas", turmaId, "designacoes"] });
      toast.sucesso(res.mensagem);
    },
    onError: (err: any) => {
      toast.erro(err?.message || "Erro ao gerar designações.");
    }
  });
}

export function useAtribuirDesignacao(turmaId: string) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: async (dados: { turma_estudante_id: string; parte_id: string; dia_semana: string }) => {
      const { data } = await api.put(`/turmas/${turmaId}/designacoes`, dados);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["turmas", turmaId, "designacoes"] });
      toast.sucesso("Designação atribuída com sucesso.");
    },
    onError: (err: any) => {
      toast.erro(err?.message || "Erro ao atribuir designação.");
    }
  });
}
