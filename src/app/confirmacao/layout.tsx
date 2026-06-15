import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "As Minhas Designações — EAC Lab",
  description: "Portal do estudante para confirmação de designações na Escola de Anciãos.",
};

export default function ConfirmacaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
