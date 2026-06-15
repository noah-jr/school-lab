"use client";
import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/Toast";

export function GlobalNotifications() {
  const toast = useToast();
  const lastCheckRef = useRef<string>(new Date().toISOString());

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkNotifications = async () => {
      try {
        const res = await fetch(`/api/notificacoes?desde=${encodeURIComponent(lastCheckRef.current)}`);
        if (res.ok) {
          const { data } = await res.json();
          if (data && data.length > 0) {
            // Atualiza o lastCheck para a data do último log + 1 milissegundo para não repetir
            const ultimo = data[data.length - 1].criado_em;
            lastCheckRef.current = new Date(new Date(ultimo).getTime() + 1).toISOString();

            // Mostra toast para cada mudança
            for (const notif of data) {
              const status = notif.dados.status;
              if (status === "confirmada") {
                toast.sucesso(`${notif.estudante} confirmou a ${notif.parte}.`);
              } else if (status === "cancelada") {
                toast.erro(`${notif.estudante} recusou a ${notif.parte}!`);
              }
            }
          }
        }
      } catch (err) {
        // Silenciar erros de rede para não poluir a consola
      } finally {
        timeoutId = setTimeout(checkNotifications, 5000); // Poll a cada 5s
      }
    };

    // Iniciar polling
    timeoutId = setTimeout(checkNotifications, 5000);

    return () => clearTimeout(timeoutId);
  }, [toast]);

  return null; // Este componente não renderiza nada visível
}
