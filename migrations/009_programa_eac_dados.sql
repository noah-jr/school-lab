-- ============================================================
-- MIGRAÇÃO 009 — Inserir dados do Programa EAC Standard
-- ============================================================

PRAGMA foreign_keys=off;

-- Permitir múltiplas entradas com o mesmo número (removendo constraint de unicidade se existir)
DROP INDEX IF EXISTS idx_partes_programa_num;
CREATE INDEX IF NOT EXISTS idx_partes_programa_num ON programa_partes(programa_id, numero);

-- Apagar se já existir para ser idempotente
DELETE FROM programa_partes WHERE programa_id = 'eac-standard';
DELETE FROM programas WHERE id = 'eac-standard';

INSERT INTO programas (id, nome, descricao, activo) 
VALUES ('eac-standard', 'Escola para Anciãos de Congregação (EAC)', 'Programa Oficial de 5 Dias com demonstrações divididas por registo.', 1);

INSERT INTO programa_partes (id, programa_id, numero, dia_semana, duracao_minutos, titulo, tipo, nivel_requerido, workshop_grupo, ordem) VALUES
('eac-p01', 'eac-standard', 1, 'segunda', 5, 'APRNDA COM JEOVÁ - Relatório', 'relatorio', 'A/B', NULL, 10),
('eac-p02', 'eac-standard', 2, 'segunda', 5, 'APRNDA COM JEOVÁ - Relatório', 'relatorio', 'A/B', NULL, 20),
('eac-p03', 'eac-standard', 3, 'segunda', 5, 'APRNDA COM JEOVÁ - Relatório', 'relatorio', 'A/B', NULL, 30),
('eac-p04a', 'eac-standard', 4, 'segunda', 1, 'A7 - Comentário (a)', 'comentario', 'C', NULL, 40),
('eac-p04b', 'eac-standard', 4, 'segunda', 1, 'A7 - Comentário (b)', 'comentario', 'C', NULL, 50),
('eac-p04c', 'eac-standard', 4, 'segunda', 1, 'A7 - Comentário (c)', 'comentario', 'C', NULL, 60),
('eac-p04d', 'eac-standard', 4, 'segunda', 1, 'A7 - Comentário (d)', 'comentario', 'C', NULL, 70),
('eac-p04e', 'eac-standard', 4, 'segunda', 1, 'A7 - Comentário (e)', 'comentario', 'C', NULL, 80),
('eac-p04f', 'eac-standard', 4, 'segunda', 1, 'Textos - Comentário (a)', 'comentario', 'B/C', NULL, 90),
('eac-p04g', 'eac-standard', 4, 'segunda', 1, 'Textos - Comentário (b)', 'comentario', 'B/C', NULL, 100),
('eac-p04h', 'eac-standard', 4, 'segunda', 1, 'Textos - Comentário (c)', 'comentario', 'B/C', NULL, 110),
('eac-p04i', 'eac-standard', 4, 'segunda', 1, 'Textos - Comentário (d)', 'comentario', 'B/C', NULL, 120),
('eac-p04j', 'eac-standard', 4, 'segunda', 1, 'Textos - Comentário (e)', 'comentario', 'B/C', NULL, 130),
('eac-p04k', 'eac-standard', 4, 'segunda', 1, 'Textos - Comentário (f)', 'comentario', 'B/C', NULL, 140),
('eac-p05', 'eac-standard', 5, 'segunda', 5, 'HOMENS FIÉIS - Relatório', 'relatorio', 'A/B', NULL, 150),
('eac-p06', 'eac-standard', 6, 'segunda', 4, 'Entrevista (opcional)', 'entrevista', 'NULO', NULL, 160),
('eac-p07a', 'eac-standard', 7, 'segunda', 5, 'Workshop 1: Dem (Ancião 1)', 'demonstracao', 'A/B', 'w-1', 170),
('eac-p07b', 'eac-standard', 7, 'segunda', 5, 'Workshop 1: Dem (Ancião 2)', 'demonstracao', 'C', 'w-1', 180),
('eac-p08a', 'eac-standard', 8, 'segunda', 5, 'Workshop 1: Dem (Sup. Grupo)', 'demonstracao', 'A/B', 'w-2', 190),
('eac-p08b', 'eac-standard', 8, 'segunda', 5, 'Workshop 1: Dem (Irmão)', 'demonstracao', 'C', 'w-2', 200),
('eac-p09a', 'eac-standard', 9, 'segunda', 5, 'Workshop 1: Dem (Ancião 1)', 'demonstracao', 'A/B', 'w-3', 210),
('eac-p09b', 'eac-standard', 9, 'segunda', 5, 'Workshop 1: Dem (Ancião 2)', 'demonstracao', 'C', 'w-3', 220),
('eac-p09c', 'eac-standard', 9, 'segunda', 5, 'Workshop 1: Dem (Ancião 3)', 'demonstracao', 'C', 'w-3', 230),
('eac-p10a', 'eac-standard', 10, 'segunda', 5, 'Workshop 1: Dem (Ancião 1)', 'demonstracao', 'A/B', 'w-4', 240),
('eac-p10b', 'eac-standard', 10, 'segunda', 5, 'Workshop 1: Dem (Ancião 2)', 'demonstracao', 'C', 'w-4', 250),
('eac-p11a', 'eac-standard', 11, 'segunda', 5, 'Workshop 1: Dem (Sup. Grupo)', 'demonstracao', 'A/B', 'w-5', 260),
('eac-p11b', 'eac-standard', 11, 'segunda', 5, 'Workshop 1: Dem (Ajudante)', 'demonstracao', 'C', 'w-5', 270),
('eac-p12a', 'eac-standard', 12, 'segunda', 5, 'Workshop 1: Dem (Sup. Circuito)', 'demonstracao', 'A/B', 'w-6', 280),
('eac-p12b', 'eac-standard', 12, 'segunda', 5, 'Workshop 1: Dem (CCA)', 'demonstracao', 'B', 'w-6', 290),

('eac-p13', 'eac-standard', 13, 'terca', 3, 'TRADUÇÃO NM - Comentário', 'comentario', 'B/C', NULL, 300),
('eac-p14', 'eac-standard', 14, 'terca', 5, 'TRADUÇÃO NM - Relatório', 'relatorio', 'A/B', NULL, 310),
('eac-p15', 'eac-standard', 15, 'terca', 3, 'ORGANIZAÇÃO - Comentário', 'comentario', 'A/B', NULL, 320),
('eac-p16a', 'eac-standard', 16, 'terca', 5, 'PERSEGUIÇÕES - Dem (Polícia)', 'demonstracao', 'A/B', NULL, 330),
('eac-p16b', 'eac-standard', 16, 'terca', 5, 'PERSEGUIÇÕES - Dem (Irmão)', 'demonstracao', 'B/C', NULL, 340),
('eac-p17a', 'eac-standard', 17, 'terca', 5, 'Workshop 2: Dem (Ancião 1)', 'demonstracao', 'A/B', 'w-7', 350),
('eac-p17b', 'eac-standard', 17, 'terca', 5, 'Workshop 2: Dem (Ancião 2)', 'demonstracao', 'C', 'w-7', 360),
('eac-p17c', 'eac-standard', 17, 'terca', 5, 'Workshop 2: Dem (Ancião 3)', 'demonstracao', 'C', 'w-7', 370),
('eac-p18a', 'eac-standard', 18, 'terca', 5, 'Workshop 2: Dem (Ancião 1)', 'demonstracao', 'A/B', 'w-8', 380),
('eac-p18b', 'eac-standard', 18, 'terca', 5, 'Workshop 2: Dem (Ancião 2)', 'demonstracao', 'C', 'w-8', 390),
('eac-p18c', 'eac-standard', 18, 'terca', 5, 'Workshop 2: Dem (Ancião 3)', 'demonstracao', 'C', 'w-8', 400),
('eac-p19a', 'eac-standard', 19, 'terca', 5, 'Workshop 2: Dem (Ancião 1)', 'demonstracao', 'A/B', 'w-9', 410),
('eac-p19b', 'eac-standard', 19, 'terca', 5, 'Workshop 2: Dem (Ancião 2)', 'demonstracao', 'C', 'w-9', 420),
('eac-p20a', 'eac-standard', 20, 'terca', 1, 'Workshop 2: Dem (Ancião 1)', 'demonstracao', 'A/B', 'w-10', 430),
('eac-p20b', 'eac-standard', 20, 'terca', 1, 'Workshop 2: Dem (Ancião 2)', 'demonstracao', 'C', 'w-10', 440),

('eac-p21', 'eac-standard', 21, 'quarta', 2, 'Comentário (Amor)', 'comentario', 'A/B', NULL, 450),
('eac-p22a', 'eac-standard', 22, 'quarta', 5, 'Demonstração (Ancião)', 'demonstracao', 'A/B', NULL, 460),
('eac-p22b', 'eac-standard', 22, 'quarta', 5, 'Demonstração (Pioneiro)', 'demonstracao', 'C', NULL, 470),
('eac-p23', 'eac-standard', 23, 'quarta', 2, 'Comentário (Alegria)', 'comentario', 'B/C', NULL, 480),
('eac-p24', 'eac-standard', 24, 'quarta', 2, 'Comentário (Paz)', 'comentario', 'B/C', NULL, 490),
('eac-p25', 'eac-standard', 25, 'quarta', 2, 'Comentário (Paciência)', 'comentario', 'B/C', NULL, 500),
('eac-p26', 'eac-standard', 26, 'quarta', 2, 'Comentário (Bondade)', 'comentario', 'B/C', NULL, 510),
('eac-p27', 'eac-standard', 27, 'quarta', 2, 'Comentário (Benignidade)', 'comentario', 'B/C', NULL, 520),
('eac-p28', 'eac-standard', 28, 'quarta', 2, 'Comentário (Fé)', 'comentario', 'B/C', NULL, 530),
('eac-p29', 'eac-standard', 29, 'quarta', 2, 'Comentário (Brandura)', 'comentario', 'B/C', NULL, 540),
('eac-p30', 'eac-standard', 30, 'quarta', 2, 'Comentário (Autodomínio)', 'comentario', 'B/C', NULL, 550),
('eac-p31a', 'eac-standard', 31, 'quarta', 4, 'Demonstração (Ancião 1)', 'demonstracao', 'A/B', NULL, 560),
('eac-p31b', 'eac-standard', 31, 'quarta', 4, 'Demonstração (Ancião 2)', 'demonstracao', 'C', NULL, 570),
('eac-p32a', 'eac-standard', 32, 'quarta', 4, 'Workshop 3: Dem (Ancião)', 'demonstracao', 'A/B', 'w-11', 580),
('eac-p32b', 'eac-standard', 32, 'quarta', 4, 'Workshop 3: Dem (Jovem)', 'demonstracao', 'C', 'w-11', 590),
('eac-p33a', 'eac-standard', 33, 'quarta', 4, 'Workshop 3: Dem (Ancião)', 'demonstracao', 'A/B', 'w-12', 600),
('eac-p33b', 'eac-standard', 33, 'quarta', 4, 'Workshop 3: Dem (Jovem Adulto)', 'demonstracao', 'C', 'w-12', 610),
('eac-p34a', 'eac-standard', 34, 'quarta', 6, 'Workshop 3: Dem (Ancião 1)', 'demonstracao', 'A/B', 'w-13', 620),
('eac-p34b', 'eac-standard', 34, 'quarta', 6, 'Workshop 3: Dem (Ancião 2)', 'demonstracao', 'B/C', 'w-13', 630),
('eac-p34c', 'eac-standard', 34, 'quarta', 6, 'Workshop 3: Dem (Servo)', 'demonstracao', 'C', 'w-13', 640),
('eac-p35a', 'eac-standard', 35, 'quarta', 6, 'Workshop 3: Dem (Ancião 1)', 'demonstracao', 'A/B', 'w-14', 650),
('eac-p35b', 'eac-standard', 35, 'quarta', 6, 'Workshop 3: Dem (Ancião 2)', 'demonstracao', 'B/C', 'w-14', 660),
('eac-p35c', 'eac-standard', 35, 'quarta', 6, 'Workshop 3: Dem (Ancião 3)', 'demonstracao', 'B/C', 'w-14', 670),
('eac-p35d', 'eac-standard', 35, 'quarta', 6, 'Workshop 3: Dem (Ancião 4)', 'demonstracao', 'C', 'w-14', 680),
('eac-p36a', 'eac-standard', 36, 'quarta', 5, 'Workshop 3: Dem (CCA)', 'demonstracao', 'A/B', 'w-15', 690),
('eac-p36b', 'eac-standard', 36, 'quarta', 5, 'Workshop 3: Dem (SEC)', 'demonstracao', 'B/C', 'w-15', 700),
('eac-p36c', 'eac-standard', 36, 'quarta', 5, 'Workshop 3: Dem (SS)', 'demonstracao', 'C', 'w-15', 710),

('eac-p37', 'eac-standard', 37, 'quinta', 4, 'Entrevista (Opcional)', 'entrevista', 'NULO', NULL, 720),
('eac-p38a', 'eac-standard', 38, 'quinta', 2, 'Comentário a', 'comentario', 'A/B/C', NULL, 730),
('eac-p38b', 'eac-standard', 38, 'quinta', 2, 'Comentário b', 'comentario', 'A/B/C', NULL, 740),
('eac-p38c', 'eac-standard', 38, 'quinta', 2, 'Comentário c', 'comentario', 'A/B/C', NULL, 750),
('eac-p38d', 'eac-standard', 38, 'quinta', 2, 'Comentário d', 'comentario', 'A/B/C', NULL, 760),
('eac-p38e', 'eac-standard', 38, 'quinta', 2, 'Comentário e', 'comentario', 'A/B/C', NULL, 770),
('eac-p39a', 'eac-standard', 39, 'quinta', 5, 'Discurso: Glória', 'discurso', 'A/B', NULL, 780),
('eac-p39b', 'eac-standard', 39, 'quinta', 5, 'Discurso: Jeová', 'discurso', 'A/B', NULL, 790),
('eac-p39c', 'eac-standard', 39, 'quinta', 5, 'Discurso: Avisar', 'discurso', 'A/B', NULL, 800),
('eac-p39d', 'eac-standard', 39, 'quinta', 5, 'Discurso: Amar', 'discurso', 'A/B', NULL, 810),
('eac-p40', 'eac-standard', 40, 'quinta', 5, 'SERMÃO DO MONTE - Relatório', 'relatorio', 'A/B', NULL, 820),
('eac-p41', 'eac-standard', 41, 'quinta', 3, 'SERMÃO DO MONTE - Comentário', 'comentario', 'A/B', NULL, 830),
('eac-p42', 'eac-standard', 42, 'quinta', 3, 'SERMÃO DO MONTE - Comentário', 'comentario', 'B', NULL, 840),
('eac-p43a', 'eac-standard', 43, 'quinta', 5, 'SERMÃO DO MONTE - Dem (Ancião)', 'demonstracao', 'A/B', NULL, 850),
('eac-p43b', 'eac-standard', 43, 'quinta', 5, 'SERMÃO DO MONTE - Dem (Servo)', 'demonstracao', 'C', NULL, 860),
('eac-p44', 'eac-standard', 44, 'quinta', 3, 'SERMÃO DO MONTE - Comentário', 'comentario', 'B', NULL, 870),
('eac-p45', 'eac-standard', 45, 'quinta', 3, 'SERMÃO DO MONTE - Comentário', 'comentario', 'B', NULL, 880),
('eac-p46', 'eac-standard', 46, 'quinta', 3, 'SERMÃO DO MONTE - Comentário', 'comentario', 'C', NULL, 890);

PRAGMA foreign_keys=on;
