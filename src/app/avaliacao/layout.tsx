import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Avaliação de Estudantes — School-Lab",
  description: "Formulário de avaliação institucional.",
};

export default function AvaliacaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout minimalista — sem sidebar, sem header do app autenticado
  return <>{children}</>;
}
