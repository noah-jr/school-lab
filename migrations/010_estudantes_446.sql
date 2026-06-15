-- ============================================================
-- MIGRAÇÃO 010 — Inserir 446ª Turma e os 31 Estudantes
-- ============================================================

PRAGMA foreign_keys=off;

-- Circuitos
INSERT OR IGNORE INTO circuitos (id, codigo, nome) VALUES ('circ-206', '206', 'Circuito 206');
INSERT OR IGNORE INTO circuitos (id, codigo, nome) VALUES ('circ-205', '205', 'Circuito 205');

-- Congregações
INSERT OR IGNORE INTO congregacoes (id, nome, circuito_id) VALUES 
('cong-avi11', 'Aviários 11, Cazenga', 'circ-206'),
('cong-avi07', 'Aviários 07, Cazenga', 'circ-206'),
('cong-avi03', 'Aviários 03, Cazenga', 'circ-206'),
('cong-avi08', 'Aviários 08, Cazenga', 'circ-206'),
('cong-avi15', 'Aviários 15, Cazenga', 'circ-206'),
('cong-avi04', 'Aviários 04, Cazenga', 'circ-206'),
('cong-avi13', 'Aviários 13, Cazenga', 'circ-206'),
('cong-avi02', 'Aviários 02, Cazenga', 'circ-206'),
('cong-nqa', 'Nova Quinta Avenida, Cazenga', 'circ-205'),
('cong-avi06', 'Aviários 06, Cazenga', 'circ-206'),
('cong-avi10', 'Aviários 10, Cazenga', 'circ-206'),
('cong-avi12', 'Aviários 12, Cazenga', 'circ-206'),
('cong-avi09', 'Aviários 09, Cazenga', 'circ-206'),
('cong-avi01', 'Aviários 01, Cazenga', 'circ-206');

-- Turma
INSERT OR IGNORE INTO turmas (id, numero_turma, nome, local_nome, local_cidade, data_inicio, data_fim, programa_id, status)
VALUES ('turma-446', 446, '446ª Turma EAC', 'Aviários 01', 'Cazenga, LUA', '2024-01-08', '2024-01-12', 'eac-standard', 'activa');

-- Estudantes
INSERT OR IGNORE INTO estudantes (id, nome, telefone_principal, telefone_alternativo, congregacao_id) VALUES
('est-1', 'Abreu, Luís Fernando', '+244 912160859', '+244 922830151', 'cong-avi11'),
('est-2', 'Álvaro, Rui', '+244 939554133', NULL, 'cong-avi07'),
('est-3', 'Cabuqui, Alberto', '+244 944628554', '+244 912909417', 'cong-avi03'),
('est-4', 'Cadete, Luís', '+244 927 318 370', NULL, 'cong-avi08'),
('est-5', 'Cameão, João', '+244 912663359', '+244 940651155', 'cong-avi15'),
('est-6', 'Carvalho, José', '+244 924519743', '+244 916791228', 'cong-avi04'),
('est-7', 'Costa, Jorge', '+244 912160859', '+244 922830151', 'cong-avi11'),
('est-8', 'Diogo, Adao', '+244 934598747', NULL, 'cong-avi13'),
('est-9', 'Ernesto, João', '+244 914050858', NULL, 'cong-avi02'),
('est-10', 'Fernandes, Miguel', '923 - 941.511', NULL, 'cong-nqa'),
('est-11', 'Francisco, Damião', '+244 924519743', '+244 916791228', 'cong-avi04'),
('est-12', 'Gabriel, Augusto Tomás', '+244 924 754 918', '+244 915971780', 'cong-avi06'),
('est-13', 'João, Gaspar', '+244 924 754 918', '+244 915971780', 'cong-avi06'),
('est-14', 'João, José', '+244 912663359', '+244 940651155', 'cong-avi15'),
('est-15', 'João, Mateus', '+244 934598747', NULL, 'cong-avi13'),
('est-16', 'Kituxi, Santos', '+244 925 650 179', '+244 931757572', 'cong-avi10'),
('est-17', 'Machado, Raimundo', '+244 927 318 370', NULL, 'cong-avi08'),
('est-18', 'Mangange, Avelino', '+244 912160859', '+244 922830151', 'cong-avi11'),
('est-19', 'Manuel, António', '+244 932 748 664', '+244 951004120', 'cong-avi12'),
('est-20', 'Manuel, Elias António', '+244 931717292', '+244 912324374', 'cong-avi09'),
('est-21', 'Manuel, Júlio', '+244 944628554', '+244 912909417', 'cong-avi03'),
('est-22', 'Manuel, Luis', '+244 944628554', '+244 912909417', 'cong-avi03'),
('est-23', 'Mateus, Angelino', '+244 912160859', '+244 922830151', 'cong-avi11'),
('est-24', 'Moisés, Celestino', '+244 924519743', '+244 916791228', 'cong-avi04'),
('est-25', 'Neto, Mateus', '+244 925 650 179', '+244 931757572', 'cong-avi10'),
('est-26', 'Paulo, Tuzolana', '+244 939554133', NULL, 'cong-avi07'),
('est-27', 'Pedro, Mateus', '+244 9462259950', '+244 912322487', 'cong-avi01'),
('est-28', 'Sendo, Benjamim', '+244 925 650 179', '+244 931757572', 'cong-avi10'),
('est-29', 'Serrote, Nascimento', '+244 924 754 918', '+244 915971780', 'cong-avi06'),
('est-30', 'Viega, Espirito Santo da Costa', '+244 934598747', NULL, 'cong-avi13'),
('est-31', 'Vunge, Marcelino', '+244 912663359', '+244 940651155', 'cong-avi15');

-- Turma_Estudantes (Atribuindo tokens seguros de acesso único)
INSERT OR IGNORE INTO turma_estudantes (id, turma_id, estudante_id, numero_lista, idade, anos_batismo, cca_nome, cca_email, token_acesso) VALUES
('te-1', 'turma-446', 'est-1', 1, 52.3, 30.9, 'Costa, Jorge', '13DJorge@jwpub.org', lower(hex(randomblob(16)))),
('te-2', 'turma-446', 'est-2', 2, 38.1, 22.7, 'Paulo, Tuzolana', 'PauloT5@jwpub.org', lower(hex(randomblob(16)))),
('te-3', 'turma-446', 'est-3', 3, 38.3, 20.3, 'Manuel, Júlio', 'JulioManuel56@jwpub.org', lower(hex(randomblob(16)))),
('te-4', 'turma-446', 'est-4', 4, 38, 19.5, 'Cadete, Luís', '4CadeteL@jwpub.org', lower(hex(randomblob(16)))),
('te-5', 'turma-446', 'est-5', 5, 66.9, 40.2, 'João, José', 'JoseJoao@jwpub.org', lower(hex(randomblob(16)))),
('te-6', 'turma-446', 'est-6', 6, 69.1, 25.5, 'Moisés, Celestino', 'CMoises11@jwpub.org', lower(hex(randomblob(16)))),
('te-7', 'turma-446', 'est-7', 7, 39.1, 23.4, 'Costa, Jorge', '13DJorge@jwpub.org', lower(hex(randomblob(16)))),
('te-8', 'turma-446', 'est-8', 8, 51.5, 10.2, 'Bernardo, Júlio', 'BJulio23@jwpub.org', lower(hex(randomblob(16)))),
('te-9', 'turma-446', 'est-9', 9, 68.9, 44.9, 'Ernesto, Alfredo', 'AlfredoE51@jwpub.org', lower(hex(randomblob(16)))),
('te-10', 'turma-446', 'est-10', 10, 44.7, 22.6, 'Pedronho, Alipio', 'AlipioPedronho@jwpub.org', lower(hex(randomblob(16)))),
('te-11', 'turma-446', 'est-11', 11, 41.2, 25.1, 'Moisés, Celestino', 'CMoises11@jwpub.org', lower(hex(randomblob(16)))),
('te-12', 'turma-446', 'est-12', 12, 39.7, 20.3, 'Gabriel, Augusto Tomás', 'GabrielAugusto3@jwpub.org', lower(hex(randomblob(16)))),
('te-13', 'turma-446', 'est-13', 13, 31.3, 7.3, 'Gabriel, Augusto Tomás', 'GabrielAugusto3@jwpub.org', lower(hex(randomblob(16)))),
('te-14', 'turma-446', 'est-14', 14, 45.7, 30.3, 'João, José', 'JoseJoao@jwpub.org', lower(hex(randomblob(16)))),
('te-15', 'turma-446', 'est-15', 15, 39.1, 10.2, 'Bernardo, Júlio', 'BJulio23@jwpub.org', lower(hex(randomblob(16)))),
('te-16', 'turma-446', 'est-16', 16, 35.3, 13.7, 'Neto, Mateus', 'MateusNeto64@jwpub.org', lower(hex(randomblob(16)))),
('te-17', 'turma-446', 'est-17', 17, 43, 18.4, 'Cadete, Luís', '4CadeteL@jwpub.org', lower(hex(randomblob(16)))),
('te-18', 'turma-446', 'est-18', 18, 34.2, 14.7, 'Costa, Jorge', '13DJorge@jwpub.org', lower(hex(randomblob(16)))),
('te-19', 'turma-446', 'est-19', 19, 58.3, 22.3, 'Hebo, Ezequiel', 'EzequielH7@jwpub.org', lower(hex(randomblob(16)))),
('te-20', 'turma-446', 'est-20', 20, 52.3, 32.9, 'Manuel, Elias António', 'EliasM7@jwpub.org', lower(hex(randomblob(16)))),
('te-21', 'turma-446', 'est-21', 21, 41.9, 23.3, 'Manuel, Júlio', 'JulioManuel56@jwpub.org', lower(hex(randomblob(16)))),
('te-22', 'turma-446', 'est-22', 22, 27.7, 11.8, 'Manuel, Júlio', 'JulioManuel56@jwpub.org', lower(hex(randomblob(16)))),
('te-23', 'turma-446', 'est-23', 23, 26.7, 7.8, 'Costa, Jorge', '13DJorge@jwpub.org', lower(hex(randomblob(16)))),
('te-24', 'turma-446', 'est-24', 24, 41.4, 24.4, 'Moisés, Celestino', 'CMoises11@jwpub.org', lower(hex(randomblob(16)))),
('te-25', 'turma-446', 'est-25', 25, 54.6, 20.3, 'Neto, Mateus', 'MateusNeto64@jwpub.org', lower(hex(randomblob(16)))),
('te-26', 'turma-446', 'est-26', 26, 57.1, 29.4, 'Paulo, Tuzolana', 'PauloT5@jwpub.org', lower(hex(randomblob(16)))),
('te-27', 'turma-446', 'est-27', 27, 65.6, 39.7, 'Pedro, Mateus', 'MateusPedro1@jwpub.org', lower(hex(randomblob(16)))),
('te-28', 'turma-446', 'est-28', 28, 75.4, 51.7, 'Neto, Mateus', 'MateusNeto64@jwpub.org', lower(hex(randomblob(16)))),
('te-29', 'turma-446', 'est-29', 29, 68.9, 46.7, 'Gabriel, Augusto Tomás', 'GabrielAugusto3@jwpub.org', lower(hex(randomblob(16)))),
('te-30', 'turma-446', 'est-30', 30, 33.3, 17.1, 'Bernardo, Júlio', 'BJulio23@jwpub.org', lower(hex(randomblob(16)))),
('te-31', 'turma-446', 'est-31', 31, 45.1, 22, 'João, José', 'JoseJoao@jwpub.org', lower(hex(randomblob(16))));

PRAGMA foreign_keys=on;
