import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Avaliação de Estudantes — EAC Lab",
  description: "Formulário de avaliação de oratória para viajantes de circuito.",
};

export default function AvaliacaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout minimalista — sem sidebar, sem header do app autenticado
  return <>{children}</>;
}
