// -------------------------------------------------------
// TIPOS CENTRAIS DO DOMÍNIO — EAC Sistema de Gestão
// -------------------------------------------------------

export type PapelUtilizador = "admin" | "instrutor" | "viajante" | "secretaria";
export type StatusTurma = "rascunho" | "activa" | "concluida" | "cancelada";
export type NivelOratoria = "A" | "A+" | "A-" | "B" | "B+" | "B-" | "C" | "C+" | "C-";
export type NivelRequerido = "A" | "B" | "C" | "A/B" | "B/C" | "A/B/C" | "NULO";
export type TipoParte = "relatorio" | "comentario" | "demonstracao" | "entrevista" | "discurso" | "video" | "oracao" | "workshop" | "outro";
export type DiaSemana = "segunda" | "terca" | "quarta" | "quinta" | "sexta";
export type StatusDesignacao = "pendente" | "confirmada" | "realizada" | "cancelada";
export type TipoUpload = "lista_estudantes" | "avaliacao_viajante" | "programa" | "outro";

// -------------------------------------------------------
// ENTIDADES
// -------------------------------------------------------

export interface Utilizador {
  id: string;
  nome: string;
  email: string;
  papel: PapelUtilizador;
  activo: number;
  criado_em: string;
  actualizado_em: string;
}

export interface Circuito {
  id: string;
  codigo: string;
  nome: string;
  pais: string;
  activo: number;
  criado_em: string;
}

export interface Congregacao {
  id: string;
  nome: string;
  circuito_id: string;
  circuito?: Circuito;
  activo: number;
  criado_em: string;
}

export interface Estudante {
  id: string;
  nome: string;
  email_jwpub?: string;
  telefone_principal?: string;
  telefone_alternativo?: string;
  congregacao_id?: string;
  congregacao?: Congregacao;
  papel_ministerial: "anciao" | "servo_ministerial";
  fotografia: string;
  activo: number;
  criado_em: string;
  actualizado_em: string;
}

export interface Programa {
  id: string;
  nome: string;
  descricao?: string;
  activo: number;
  criado_em: string;
  partes?: ProgramaParte[];
}

export interface ProgramaParte {
  id: string;
  programa_id: string;
  numero: number;
  dia_semana: DiaSemana;
  hora_inicio?: string;
  duracao_minutos?: number;
  titulo: string;
  tipo: TipoParte;
  nivel_requerido: NivelRequerido;
  workshop_grupo?: string;
  observacoes?: string;
  ordem: number;
}

export interface Turma {
  id: string;
  numero_turma: number;
  nome: string;
  local_nome: string;
  local_cidade?: string;
  pais: string;
  data_inicio: string;
  data_fim: string;
  instrutor_a_nome?: string;
  instrutor_b_nome?: string;
  programa_id?: string;
  status: StatusTurma;
  observacoes?: string;
  criado_por?: string;
  criado_em: string;
  actualizado_em: string;
  restricao_diaria?: number;
  // Calculados

  total_estudantes?: number;
  total_avaliados?: number;
}

export interface TurmaEstudante {
  id: string;
  turma_id: string;
  estudante_id: string;
  numero_lista?: number;
  idade?: number;
  anos_batismo?: number;
  nivel_oratoria?: NivelOratoria;
  cca_nome?: string;
  cca_email?: string;
  avaliado_pelo_viajante: number;
  data_avaliacao?: string;
  observacoes?: string;
  token_acesso?: string;
  criado_em: string;
  actualizado_em: string;
  // Joins e propriedades achatadas da query
  estudante_nome?: string;
  congregacao_nome?: string;
  circuito_codigo?: string;
  papel_ministerial?: string;
  estudante?: Estudante;
  designacoes?: Designacao[];
}

export interface Designacao {
  id: string;
  turma_id: string;
  turma_estudante_id: string;
  parte_id: string;
  dia_semana: DiaSemana;
  status: StatusDesignacao;
  observacoes?: string;
  criado_em: string;
  actualizado_em: string;
  // Joins
  parte?: ProgramaParte;
  estudante?: TurmaEstudante;
}

export interface Upload {
  id: string;
  turma_id?: string;
  nome_original: string;
  nome_ficheiro: string;
  caminho: string;
  tipo_mime: string;
  tamanho_bytes: number;
  tipo_upload: TipoUpload;
  processado: number;
  criado_por?: string;
  criado_em: string;
}

export interface AuditLog {
  id: string;
  tabela: string;
  registo_id: string;
  accao: string;
  dados_antes?: string;
  dados_depois?: string;
  utilizador_id?: string;
  ip_address?: string;
  user_agent?: string;
  criado_em: string;
}

// -------------------------------------------------------
// TIPOS DE RESPOSTA DA API
// -------------------------------------------------------

export interface ApiResponse<T> {
  data?: T;
  erro?: string;
  mensagem?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
}

// -------------------------------------------------------
// PARÂMETROS DE CRIAÇÃO
// -------------------------------------------------------

export type CriarTurmaInput = Omit<Turma, "id" | "criado_em" | "actualizado_em" | "total_estudantes" | "total_avaliados">;
export type CriarEstudanteInput = Omit<Estudante, "id" | "criado_em" | "actualizado_em" | "congregacao">;
export type AdicionarEstudanteTurmaInput = Omit<TurmaEstudante, "id" | "criado_em" | "actualizado_em" | "estudante" | "designacoes">;
