const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const parts = [
  // SEGUNDA
  { num: 1, dia: 'segunda', dur: 5, titulo: 'APRNDA COM JEOVÁ - Relatório', tipo: 'relatorio', nivel: 'A/B' },
  { num: 2, dia: 'segunda', dur: 5, titulo: 'APRNDA COM JEOVÁ - Relatório', tipo: 'relatorio', nivel: 'A/B' },
  { num: 3, dia: 'segunda', dur: 5, titulo: 'APRNDA COM JEOVÁ - Relatório', tipo: 'relatorio', nivel: 'A/B' },
  
  // Part 4
  { num: 4, dia: 'segunda', dur: 1, titulo: 'A7 - Comentário (a)', tipo: 'comentario', nivel: 'C' },
  { num: 4, dia: 'segunda', dur: 1, titulo: 'A7 - Comentário (b)', tipo: 'comentario', nivel: 'C' },
  { num: 4, dia: 'segunda', dur: 1, titulo: 'A7 - Comentário (c)', tipo: 'comentario', nivel: 'C' },
  { num: 4, dia: 'segunda', dur: 1, titulo: 'A7 - Comentário (d)', tipo: 'comentario', nivel: 'C' },
  { num: 4, dia: 'segunda', dur: 1, titulo: 'A7 - Comentário (e)', tipo: 'comentario', nivel: 'C' },
  
  { num: 4, dia: 'segunda', dur: 1, titulo: 'Textos Bíblicos - Comentário (a)', tipo: 'comentario', nivel: 'B/C' },
  { num: 4, dia: 'segunda', dur: 1, titulo: 'Textos Bíblicos - Comentário (b)', tipo: 'comentario', nivel: 'B/C' },
  { num: 4, dia: 'segunda', dur: 1, titulo: 'Textos Bíblicos - Comentário (c)', tipo: 'comentario', nivel: 'B/C' },
  { num: 4, dia: 'segunda', dur: 1, titulo: 'Textos Bíblicos - Comentário (d)', tipo: 'comentario', nivel: 'B/C' },
  { num: 4, dia: 'segunda', dur: 1, titulo: 'Textos Bíblicos - Comentário (e)', tipo: 'comentario', nivel: 'B/C' },
  { num: 4, dia: 'segunda', dur: 1, titulo: 'Textos Bíblicos - Comentário (f)', tipo: 'comentario', nivel: 'B/C' },
  
  { num: 5, dia: 'segunda', dur: 5, titulo: 'HOMENS FIÉIS - Relatório', tipo: 'relatorio', nivel: 'A/B' },
  { num: 6, dia: 'segunda', dur: 4, titulo: 'Entrevista (opcional)', tipo: 'entrevista', nivel: 'NULO' },
  
  { num: 7, dia: 'segunda', dur: 5, titulo: 'Workshop 1: Dem (Ancião 1)', tipo: 'demonstracao', nivel: 'A/B', ws: 'w-1' },
  { num: 7, dia: 'segunda', dur: 5, titulo: 'Workshop 1: Dem (Ancião 2)', tipo: 'demonstracao', nivel: 'C', ws: 'w-1' },
  
  { num: 8, dia: 'segunda', dur: 5, titulo: 'Workshop 1: Dem (Sup. Grupo)', tipo: 'demonstracao', nivel: 'A/B', ws: 'w-2' },
  { num: 8, dia: 'segunda', dur: 5, titulo: 'Workshop 1: Dem (Irmão)', tipo: 'demonstracao', nivel: 'C', ws: 'w-2' },
  
  { num: 9, dia: 'segunda', dur: 5, titulo: 'Workshop 1: Dem (Ancião 1)', tipo: 'demonstracao', nivel: 'A/B', ws: 'w-3' },
  { num: 9, dia: 'segunda', dur: 5, titulo: 'Workshop 1: Dem (Ancião 2)', tipo: 'demonstracao', nivel: 'C', ws: 'w-3' },
  { num: 9, dia: 'segunda', dur: 5, titulo: 'Workshop 1: Dem (Ancião 3)', tipo: 'demonstracao', nivel: 'C', ws: 'w-3' },
  
  { num: 10, dia: 'segunda', dur: 5, titulo: 'Workshop 1: Dem (Ancião 1)', tipo: 'demonstracao', nivel: 'A/B', ws: 'w-4' },
  { num: 10, dia: 'segunda', dur: 5, titulo: 'Workshop 1: Dem (Ancião 2)', tipo: 'demonstracao', nivel: 'C', ws: 'w-4' },
  
  { num: 11, dia: 'segunda', dur: 5, titulo: 'Workshop 1: Dem (Sup. Grupo)', tipo: 'demonstracao', nivel: 'A/B', ws: 'w-5' },
  { num: 11, dia: 'segunda', dur: 5, titulo: 'Workshop 1: Dem (Ajudante)', tipo: 'demonstracao', nivel: 'C', ws: 'w-5' },
  
  { num: 12, dia: 'segunda', dur: 5, titulo: 'Workshop 1: Dem (Sup. Circuito)', tipo: 'demonstracao', nivel: 'A/B', ws: 'w-6' },
  { num: 12, dia: 'segunda', dur: 5, titulo: 'Workshop 1: Dem (CCA)', tipo: 'demonstracao', nivel: 'B', ws: 'w-6' },

  // TERCA
  { num: 13, dia: 'terca', dur: 3, titulo: 'TRADUÇÃO NM - Comentário', tipo: 'comentario', nivel: 'B/C' },
  { num: 14, dia: 'terca', dur: 5, titulo: 'TRADUÇÃO NM - Relatório', tipo: 'relatorio', nivel: 'A/B' },
  { num: 15, dia: 'terca', dur: 3, titulo: 'ORGANIZAÇÃO - Comentário', tipo: 'comentario', nivel: 'A/B' },
  
  { num: 16, dia: 'terca', dur: 5, titulo: 'PERSEGUIÇÕES - Dem (Polícia)', tipo: 'demonstracao', nivel: 'A/B' },
  { num: 16, dia: 'terca', dur: 5, titulo: 'PERSEGUIÇÕES - Dem (Irmão)', tipo: 'demonstracao', nivel: 'B/C' },
  
  { num: 17, dia: 'terca', dur: 5, titulo: 'Workshop 2: Dem (Ancião 1)', tipo: 'demonstracao', nivel: 'A/B', ws: 'w-7' },
  { num: 17, dia: 'terca', dur: 5, titulo: 'Workshop 2: Dem (Ancião 2)', tipo: 'demonstracao', nivel: 'C', ws: 'w-7' },
  { num: 17, dia: 'terca', dur: 5, titulo: 'Workshop 2: Dem (Ancião 3)', tipo: 'demonstracao', nivel: 'C', ws: 'w-7' },
  
  { num: 18, dia: 'terca', dur: 5, titulo: 'Workshop 2: Dem (Ancião 1)', tipo: 'demonstracao', nivel: 'A/B', ws: 'w-8' },
  { num: 18, dia: 'terca', dur: 5, titulo: 'Workshop 2: Dem (Ancião 2)', tipo: 'demonstracao', nivel: 'C', ws: 'w-8' },
  { num: 18, dia: 'terca', dur: 5, titulo: 'Workshop 2: Dem (Ancião 3)', tipo: 'demonstracao', nivel: 'C', ws: 'w-8' },
  
  { num: 19, dia: 'terca', dur: 5, titulo: 'Workshop 2: Dem (Ancião 1)', tipo: 'demonstracao', nivel: 'A/B', ws: 'w-9' },
  { num: 19, dia: 'terca', dur: 5, titulo: 'Workshop 2: Dem (Ancião 2)', tipo: 'demonstracao', nivel: 'C', ws: 'w-9' },
  
  { num: 20, dia: 'terca', dur: 1, titulo: 'Workshop 2: Dem (Ancião 1)', tipo: 'demonstracao', nivel: 'A/B', ws: 'w-10' },
  { num: 20, dia: 'terca', dur: 1, titulo: 'Workshop 2: Dem (Ancião 2)', tipo: 'demonstracao', nivel: 'C', ws: 'w-10' },

  // QUARTA
  { num: 21, dia: 'quarta', dur: 2, titulo: 'Comentário (Amor)', tipo: 'comentario', nivel: 'A/B' },
  { num: 22, dia: 'quarta', dur: 5, titulo: 'Demonstração (Ancião)', tipo: 'demonstracao', nivel: 'A/B' },
  { num: 22, dia: 'quarta', dur: 5, titulo: 'Demonstração (Pioneiro novo)', tipo: 'demonstracao', nivel: 'C' },
  { num: 23, dia: 'quarta', dur: 2, titulo: 'Comentário (Alegria)', tipo: 'comentario', nivel: 'B/C' },
  { num: 24, dia: 'quarta', dur: 2, titulo: 'Comentário (Paz)', tipo: 'comentario', nivel: 'B/C' },
  { num: 25, dia: 'quarta', dur: 2, titulo: 'Comentário (Paciência)', tipo: 'comentario', nivel: 'B/C' },
  { num: 26, dia: 'quarta', dur: 2, titulo: 'Comentário (Bondade)', tipo: 'comentario', nivel: 'B/C' },
  { num: 27, dia: 'quarta', dur: 2, titulo: 'Comentário (Benignidade)', tipo: 'comentario', nivel: 'B/C' },
  { num: 28, dia: 'quarta', dur: 2, titulo: 'Comentário (Fé)', tipo: 'comentario', nivel: 'B/C' },
  { num: 29, dia: 'quarta', dur: 2, titulo: 'Comentário (Brandura)', tipo: 'comentario', nivel: 'B/C' },
  { num: 30, dia: 'quarta', dur: 2, titulo: 'Comentário (Autodomínio)', tipo: 'comentario', nivel: 'B/C' },
  
  { num: 31, dia: 'quarta', dur: 4, titulo: 'Demonstração (Ancião 1)', tipo: 'demonstracao', nivel: 'A/B' },
  { num: 31, dia: 'quarta', dur: 4, titulo: 'Demonstração (Ancião 2)', tipo: 'demonstracao', nivel: 'C' },
  
  { num: 32, dia: 'quarta', dur: 4, titulo: 'Workshop 3: Dem (Ancião)', tipo: 'demonstracao', nivel: 'A/B', ws: 'w-11' },
  { num: 32, dia: 'quarta', dur: 4, titulo: 'Workshop 3: Dem (Jovem)', tipo: 'demonstracao', nivel: 'C', ws: 'w-11' },
  
  { num: 33, dia: 'quarta', dur: 4, titulo: 'Workshop 3: Dem (Ancião)', tipo: 'demonstracao', nivel: 'A/B', ws: 'w-12' },
  { num: 33, dia: 'quarta', dur: 4, titulo: 'Workshop 3: Dem (Jovem Adulto)', tipo: 'demonstracao', nivel: 'C', ws: 'w-12' },
  
  { num: 34, dia: 'quarta', dur: 6, titulo: 'Workshop 3: Dem (Ancião 1)', tipo: 'demonstracao', nivel: 'A/B', ws: 'w-13' },
  { num: 34, dia: 'quarta', dur: 6, titulo: 'Workshop 3: Dem (Ancião 2)', tipo: 'demonstracao', nivel: 'B/C', ws: 'w-13' },
  { num: 34, dia: 'quarta', dur: 6, titulo: 'Workshop 3: Dem (Servo Ministerial)', tipo: 'demonstracao', nivel: 'C', ws: 'w-13' },
  
  { num: 35, dia: 'quarta', dur: 6, titulo: 'Workshop 3: Dem (Ancião 1)', tipo: 'demonstracao', nivel: 'A/B', ws: 'w-14' },
  { num: 35, dia: 'quarta', dur: 6, titulo: 'Workshop 3: Dem (Ancião 2)', tipo: 'demonstracao', nivel: 'B/C', ws: 'w-14' },
  { num: 35, dia: 'quarta', dur: 6, titulo: 'Workshop 3: Dem (Ancião 3)', tipo: 'demonstracao', nivel: 'B/C', ws: 'w-14' },
  { num: 35, dia: 'quarta', dur: 6, titulo: 'Workshop 3: Dem (Ancião 4)', tipo: 'demonstracao', nivel: 'C', ws: 'w-14' },

  { num: 36, dia: 'quarta', dur: 5, titulo: 'Workshop 3: Dem (CCA)', tipo: 'demonstracao', nivel: 'A/B', ws: 'w-15' },
  { num: 36, dia: 'quarta', dur: 5, titulo: 'Workshop 3: Dem (SEC)', tipo: 'demonstracao', nivel: 'B/C', ws: 'w-15' },
  { num: 36, dia: 'quarta', dur: 5, titulo: 'Workshop 3: Dem (SS)', tipo: 'demonstracao', nivel: 'C', ws: 'w-15' },

  // QUINTA
  { num: 37, dia: 'quinta', dur: 4, titulo: 'Entrevista (Opcional)', tipo: 'entrevista', nivel: 'NULO' },
  
  { num: 38, dia: 'quinta', dur: 2, titulo: 'Comentário - a', tipo: 'comentario', nivel: 'A/B/C' },
  { num: 38, dia: 'quinta', dur: 2, titulo: 'Comentário - b', tipo: 'comentario', nivel: 'A/B/C' },
  { num: 38, dia: 'quinta', dur: 2, titulo: 'Comentário - c', tipo: 'comentario', nivel: 'A/B/C' },
  { num: 38, dia: 'quinta', dur: 2, titulo: 'Comentário - d', tipo: 'comentario', nivel: 'A/B/C' },
  { num: 38, dia: 'quinta', dur: 2, titulo: 'Comentário - e', tipo: 'comentario', nivel: 'A/B/C' },
  
  { num: 39, dia: 'quinta', dur: 5, titulo: 'Discurso: A pregação dá glória', tipo: 'discurso', nivel: 'A/B' },
  { num: 39, dia: 'quinta', dur: 5, titulo: 'Discurso: Amamos a Jeová', tipo: 'discurso', nivel: 'A/B' },
  { num: 39, dia: 'quinta', dur: 5, titulo: 'Discurso: Avisar as pessoas', tipo: 'discurso', nivel: 'A/B' },
  { num: 39, dia: 'quinta', dur: 5, titulo: 'Discurso: Amamos as pessoas', tipo: 'discurso', nivel: 'A/B' },
  
  { num: 40, dia: 'quinta', dur: 5, titulo: 'SERMÃO DO MONTE - Relatório', tipo: 'relatorio', nivel: 'A/B' },
  { num: 41, dia: 'quinta', dur: 3, titulo: 'SERMÃO DO MONTE - Comentário', tipo: 'comentario', nivel: 'A/B' },
  { num: 42, dia: 'quinta', dur: 3, titulo: 'SERMÃO DO MONTE - Comentário', tipo: 'comentario', nivel: 'B' },
  
  { num: 43, dia: 'quinta', dur: 5, titulo: 'SERMÃO DO MONTE - Dem (Ancião)', tipo: 'demonstracao', nivel: 'A/B' },
  { num: 43, dia: 'quinta', dur: 5, titulo: 'SERMÃO DO MONTE - Dem (Servo)', tipo: 'demonstracao', nivel: 'C' },
  
  { num: 44, dia: 'quinta', dur: 3, titulo: 'SERMÃO DO MONTE - Comentário', tipo: 'comentario', nivel: 'B' },
  { num: 45, dia: 'quinta', dur: 3, titulo: 'SERMÃO DO MONTE - Comentário', tipo: 'comentario', nivel: 'B' },
  { num: 46, dia: 'quinta', dur: 3, titulo: 'SERMÃO DO MONTE - Comentário', tipo: 'comentario', nivel: 'C' }
];

let sql = `-- ============================================================
-- MIGRAÇÃO 009 — Inserir dados do Programa EAC Standard
-- ============================================================

PRAGMA foreign_keys=off;
BEGIN TRANSACTION;

-- Permitir múltiplas entradas com o mesmo número (removendo constraint de unicidade)
DROP INDEX IF EXISTS idx_partes_programa_num;
CREATE INDEX idx_partes_programa_num ON programa_partes(programa_id, numero);

-- Apagar se já existir para ser idempotente
DELETE FROM programa_partes WHERE programa_id = 'eac-standard';
DELETE FROM programas WHERE id = 'eac-standard';

INSERT INTO programas (id, nome, descricao, activo) 
VALUES ('eac-standard', 'Escola para Anciãos de Congregação (EAC)', 'Programa Oficial de 5 Dias com demonstrações divididas por registo.', 1);
`;

let index = 10;
for (const p of parts) {
  const id = uuidv4();
  const ws = p.ws ? `'${p.ws}'` : 'NULL';
  sql += `
INSERT INTO programa_partes (id, programa_id, numero, dia_semana, duracao_minutos, titulo, tipo, nivel_requerido, workshop_grupo, ordem)
VALUES ('${id}', 'eac-standard', ${p.num}, '${p.dia}', ${p.dur}, '${p.titulo.replace(/'/g, "''")}', '${p.tipo}', '${p.nivel}', ${ws}, ${index});`;
  index += 10;
}

sql += `

COMMIT;
PRAGMA foreign_keys=on;
`;

fs.writeFileSync(path.join(__dirname, '../../migrations/009_programa_eac_dados.sql'), sql);
console.log("Migração gerada com sucesso!");
