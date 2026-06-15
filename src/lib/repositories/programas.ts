import getDb from "@/lib/db";

export interface Programa {
  id: string;
  nome: string;
  descricao: string | null;
  activo: number;
  criado_em: string;
}

export interface ProgramaParte {
  id: string;
  programa_id: string;
  numero: number;
  dia_semana: string;
  hora_inicio: string | null;
  duracao_minutos: number | null;
  titulo: string;
  tipo: string;
  nivel_requerido: string;
  workshop_grupo: string | null;
  observacoes: string | null;
  ordem: number;
}

export function listarProgramas(): Programa[] {
  const db = getDb();
  return db.prepare("SELECT * FROM programas ORDER BY criado_em DESC").all() as Programa[];
}

export function listarPartes(programaId: string): ProgramaParte[] {
  const db = getDb();
  return db.prepare("SELECT * FROM programa_partes WHERE programa_id = ? ORDER BY numero ASC").all(programaId) as ProgramaParte[];
}
