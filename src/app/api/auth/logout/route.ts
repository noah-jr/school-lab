import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ mensagem: "Logout com sucesso" });
  response.cookies.set("eac_session", "", { maxAge: 0, path: "/" });
  return response;
}
