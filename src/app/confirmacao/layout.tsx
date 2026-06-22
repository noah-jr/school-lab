import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "As Minhas Designações — Escola para Anciãos de Congregação",
  description: "Portal do estudante para confirmação de designações.",
};

export default function ConfirmacaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
