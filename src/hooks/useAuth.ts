import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export function useAuth() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data.data as { id: string; nome: string; email: string; papel: string };
    },
    staleTime: Infinity,
  });
}
