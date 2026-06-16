"use client";
import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/Toast";

export function GlobalNotifications() {
  const toast = useToast();
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const startSSE = () => {
      // Começamos a escutar a partir de agora
      const url = `/api/notificacoes?desde=${encodeURIComponent(new Date().toISOString())}`;
      esRef.current = new EventSource(url);

      esRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          for (const notif of data) {
            const status = notif.dados.status;
            if (status === "confirmada") {
              toast.sucesso(`${notif.estudante} confirmou a ${notif.parte}.`);
            } else if (status === "cancelada") {
              toast.erro(`${notif.estudante} recusou a ${notif.parte}!`);
            }
          }
        } catch (err) {
          console.error("Erro ao ler notificação SSE", err);
        }
      };

      esRef.current.onerror = () => {
        // Se houver erro de ligação, fecha a actual e tenta de novo em 5s
        esRef.current?.close();
        setTimeout(startSSE, 5000);
      };
    };

    startSSE();

    return () => {
      if (esRef.current) {
        esRef.current.close();
      }
    };
  }, [toast]);

  return null; // Este componente não renderiza nada visível
}
