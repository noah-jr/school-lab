import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  papel: string;
  precisa_mudar_senha: boolean;
}

export function useAuth() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data.data as AuthUser;
    },
    staleTime: Infinity,
  });
}
