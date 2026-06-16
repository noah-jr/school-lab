"use client";
import { use } from "react";
import { useTurma } from "@/hooks/useTurmas";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/layout/Sidebar";

export default function SalaVirtualPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: turma, isLoading } = useTurma(id);

  if (isLoading) return <div style={{ padding: 40, textAlign: "center" }}>A carregar Sala Virtual...</div>;
  if (!turma) return <div style={{ padding: 40, textAlign: "center" }}>Turma não encontrada.</div>;

  const { data: user } = useAuth();

  // Criamos um nome de sala único e seguro baseado no ID e nome da turma
  const roomName = `EAC-Lab-${turma.numero_turma}-${id.substring(0, 8)}`;
  
  // Parâmetros avançados de segurança e UX para a sala:
  // - prejoinPageEnabled=true (Ecrã de teste antes de entrar)
  // - startWithAudioMuted=true (Mudos por defeito)
  // - userInfo (Preenche logo o nome de quem tem sessão iniciada)
  const userInfo = user ? `&userInfo.displayName=${encodeURIComponent(user.nome)}` : '';
  const jitsiUrl = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=true&config.startWithAudioMuted=true&config.startWithVideoMuted=true&interfaceConfig.SHOW_JITSI_WATERMARK=false${userInfo}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <PageHeader
        title="Sala Virtual & Videoconferência"
        breadcrumb={[
          { label: "Turmas", href: "/turmas" },
          { label: turma.nome, href: `/turmas/${id}` },
          { label: "Sala Virtual" }
        ]}
        actions={
          <div className="text-sm text-muted">
            🎥 Até 50 participantes • 💬 Chat Incluído • 📎 Envio de Ficheiros
          </div>
        }
      />
      
      <div style={{ flex: 1, padding: 16, background: "var(--bg-default)" }}>
        <div style={{ 
          width: "100%", 
          height: "100%", 
          background: "#000", 
          borderRadius: 12, 
          overflow: "hidden",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
        }}>
          <iframe
            src={jitsiUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            style={{ width: "100%", height: "100%", border: 0 }}
          />
        </div>
      </div>
    </div>
  );
}
