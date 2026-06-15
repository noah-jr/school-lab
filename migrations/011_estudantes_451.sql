-- ============================================================
-- MIGRAÇÃO 011 — Inserir 451ª Turma (Fev 2026) e 34 Estudantes
-- ============================================================

PRAGMA foreign_keys=off;

-- Circuitos
INSERT OR IGNORE INTO circuitos (id, codigo, nome) VALUES ('circ-260', '260', 'Circuito 260');

-- Congregações
INSERT OR IGNORE INTO congregacoes (id, nome, circuito_id) VALUES 
('cong-caculama', 'Caculama, Mucari', 'circ-260'),
('cong-quela', 'Desvio do Quela', 'circ-260'),
('cong-kiwaba', 'Kiwaba Nzoji', 'circ-260'),
('cong-kiz01', 'Kizanga 01', 'circ-260'),
('cong-kiz02', 'Kizanga 02', 'circ-260'),
('cong-kiz03', 'Kizanga 03', 'circ-260'),
('cong-malnorte', 'Malange Norte', 'circ-260'),
('cong-malrit01', 'Malange Ritondo 01', 'circ-260'),
('cong-malrit02', 'Malange Ritondo 02', 'circ-260'),
('cong-malrit03', 'Malange Ritondo 03', 'circ-260'),
('cong-vilmat01', 'Vila Matilde 01', 'circ-260'),
('cong-vilmat02', 'Vila Matilde 02', 'circ-260'),
('cong-vilmat03', 'Vila Matilde 03', 'circ-260'),
('cong-vilmatne', 'Vila Matilde Nordeste', 'circ-260'),
('cong-songo', 'Songo Siconha', 'circ-260');

-- Turma
INSERT OR IGNORE INTO turmas (id, numero_turma, nome, local_nome, data_inicio, data_fim, programa_id, status)
VALUES ('turma-451', 451, '451ª Turma EAC', 'Zona 01', '2026-02-09', '2026-02-13', 'eac-standard', 'activa');

-- Estudantes
INSERT OR IGNORE INTO estudantes (id, nome, email_jwpub, telefone_principal, congregacao_id) VALUES
('est-451-1', 'João Graça', '1GJoao@jwpub.org', '943 482 026', 'cong-caculama'),
('est-451-2', 'Bizerra Cauísso', 'BCauisso@jwpub.org', '926 303 001', 'cong-quela'),
('est-451-3', 'João Costa', '5JoaodaCosta@jwpub.org', '923 555 118', 'cong-kiwaba'),
('est-451-4', 'Gomes Armindo', 'GomesA38@jwpub.org', '942 329 925', 'cong-kiwaba'),
('est-451-5', 'Milton Domingos', 'MiltonD20@jwpub.org', '925 464 296', 'cong-kiz01'),
('est-451-6', 'Manuel da Cruz', '18DaCruzManuel@jwpub.org', '945 028 514', 'cong-kiz02'),
('est-451-7', 'Ngonga Kanguenza', 'NgongaCanguenza@jwpub.org', '928 105 466', 'cong-kiz02'),
('est-451-8', 'Nobis Muhambano', '1NobisMuhambano@jwpub.org', '933 531 118', 'cong-kiz02'),
('est-451-9', 'Francisco Campos', 'FCampos13@jwpub.org', '940 242 771', 'cong-kiz03'),
('est-451-10', 'Sebastião Dala', 'Dalas4@jwpub.org', '915 147 656', 'cong-kiz03'),
('est-451-11', 'Nelson Ipanga', 'Nelsonipanga32@jwpub.org', '927 275 109', 'cong-kiz03'),
('est-451-12', 'Nelson Quivange Cuxixima', 'NelsonC8@jwpub.org', '923 649 402', 'cong-malnorte'),
('est-451-13', 'Mateus Cruz', 'MateusC2@jwpub.org', '933 661 073', 'cong-malrit01'),
('est-451-14', 'Joaquim Kambala', 'JoaquimKambala@jwpub.org', '933 377 686', 'cong-malrit01'),
('est-451-15', 'João Mendes', 'MendesJ28@jwpub.org', '947 827 614', 'cong-malrit01'),
('est-451-16', 'Custódio Camba', 'CustodioCamba@jwpub.org', '923 518 768', 'cong-malrit02'),
('est-451-17', 'Fernando Sacaia', 'FMacala60@jwpub.org', '921 137 336', 'cong-malrit02'),
('est-451-18', 'Afonso Ribeiro', 'AfonsoR72@jwpub.org', '927 846 676', 'cong-malrit03'),
('est-451-19', 'Francisco Domingos', NULL, '923 323 521', 'cong-malrit03'),
('est-451-20', 'Luvaíno Bernardo', 'BLuvaino@jwpub.org', '924 911 202', 'cong-malrit03'),
('est-451-21', 'Joel Dinís', 'JoelDinis5@jwpub.org', '924 038 599', 'cong-vilmat01'),
('est-451-22', 'Agostinho José', 'AgostinhoJose18@jwpub.org', '921 748 887', 'cong-vilmat01'),
('est-451-23', 'Martinho Magalhães', 'MartinhoMagalhaes24@jwpub.org', '925 441 609', 'cong-vilmat01'),
('est-451-24', 'Ricardo Martins', '8RicardoMartins@jwpub.org', '944 591 366', 'cong-vilmat01'),
('est-451-25', 'João Ngunza', 'JoaoPauloN@jwpub.org', '924 571 660', 'cong-vilmat01'),
('est-451-26', 'David Quipungo', 'QDavid21@jwpub.org', '927 916 040', 'cong-vilmat02'),
('est-451-27', 'Adilson da Costa', 'AdilsonR39@jwpub.org', '923 950 948', 'cong-vilmat02'),
('est-451-28', 'Domingos Massunga', 'MassungaDomingos20@jwpub.org', '928 957 365', 'cong-vilmat02'),
('est-451-29', 'João Massuquina', '57JMassuquina@jwpub.org', '923 325 517', 'cong-vilmat02'),
('est-451-30', 'Pedro António', 'AntonioPedro43@jwpub.org', '927 317 761', 'cong-vilmat03'),
('est-451-31', 'João Morais', 'JMorais52@jwpub.org', '927 728 860', 'cong-vilmat03'),
('est-451-32', 'Joaquim Capangue', NULL, '932 305 794', 'cong-vilmatne'),
('est-451-33', 'Pedro Dias', 'PedroDias@jwpub.org', '921 502 095', 'cong-vilmatne'),
('est-451-34', 'Elifaz Cruz', '2ElifazDaCruz@jwpub.org', '929 003 535', 'cong-songo');

-- Turma_Estudantes (Note-se que o avaliado_pelo_viajante = 1 para quem já tem avaliação!)
INSERT OR IGNORE INTO turma_estudantes (id, turma_id, estudante_id, numero_lista, idade, nivel_oratoria, avaliado_pelo_viajante, token_acesso) VALUES
('te-451-1', 'turma-451', 'est-451-1', 1, 33, 'C+', 1, lower(hex(randomblob(16)))),
('te-451-2', 'turma-451', 'est-451-2', 2, 40, 'C+', 1, lower(hex(randomblob(16)))),
('te-451-3', 'turma-451', 'est-451-3', 3, 30, NULL, 0, lower(hex(randomblob(16)))),
('te-451-4', 'turma-451', 'est-451-4', 4, 28, 'C+', 1, lower(hex(randomblob(16)))),
('te-451-5', 'turma-451', 'est-451-5', 5, 30, 'C+', 1, lower(hex(randomblob(16)))),
('te-451-6', 'turma-451', 'est-451-6', 6, 54, 'C', 1, lower(hex(randomblob(16)))),
('te-451-7', 'turma-451', 'est-451-7', 7, 40, 'C', 1, lower(hex(randomblob(16)))),
('te-451-8', 'turma-451', 'est-451-8', 8, 24, 'C', 1, lower(hex(randomblob(16)))),
('te-451-9', 'turma-451', 'est-451-9', 9, 32, 'C+', 1, lower(hex(randomblob(16)))),
('te-451-10', 'turma-451', 'est-451-10', 10, 64, 'C-', 1, lower(hex(randomblob(16)))),
('te-451-11', 'turma-451', 'est-451-11', 11, 31, 'C', 1, lower(hex(randomblob(16)))),
('te-451-12', 'turma-451', 'est-451-12', 12, 40, 'C', 1, lower(hex(randomblob(16)))),
('te-451-13', 'turma-451', 'est-451-13', 13, 37, 'B', 1, lower(hex(randomblob(16)))),
('te-451-14', 'turma-451', 'est-451-14', 14, 30, 'C+', 1, lower(hex(randomblob(16)))),
('te-451-15', 'turma-451', 'est-451-15', 15, 27, 'C+', 1, lower(hex(randomblob(16)))),
('te-451-16', 'turma-451', 'est-451-16', 16, 38, 'C', 1, lower(hex(randomblob(16)))),
('te-451-17', 'turma-451', 'est-451-17', 17, 34, 'C+', 1, lower(hex(randomblob(16)))),
('te-451-18', 'turma-451', 'est-451-18', 18, 39, 'B', 1, lower(hex(randomblob(16)))),
('te-451-19', 'turma-451', 'est-451-19', 19, 78, 'C', 1, lower(hex(randomblob(16)))),
('te-451-20', 'turma-451', 'est-451-20', 20, 39, 'B', 1, lower(hex(randomblob(16)))),
('te-451-21', 'turma-451', 'est-451-21', 21, 30, 'C+', 1, lower(hex(randomblob(16)))),
('te-451-22', 'turma-451', 'est-451-22', 22, 76, 'C', 1, lower(hex(randomblob(16)))),
('te-451-23', 'turma-451', 'est-451-23', 23, 35, 'B', 1, lower(hex(randomblob(16)))),
('te-451-24', 'turma-451', 'est-451-24', 24, 25, 'B', 1, lower(hex(randomblob(16)))),
('te-451-25', 'turma-451', 'est-451-25', 25, 65, 'C', 1, lower(hex(randomblob(16)))),
('te-451-26', 'turma-451', 'est-451-26', 26, 40, 'B', 1, lower(hex(randomblob(16)))),
('te-451-27', 'turma-451', 'est-451-27', 27, 34, 'C', 1, lower(hex(randomblob(16)))),
('te-451-28', 'turma-451', 'est-451-28', 28, 33, 'C', 1, lower(hex(randomblob(16)))),
('te-451-29', 'turma-451', 'est-451-29', 29, 43, 'C+', 1, lower(hex(randomblob(16)))),
('te-451-30', 'turma-451', 'est-451-30', 30, 25, 'C+', 1, lower(hex(randomblob(16)))),
('te-451-31', 'turma-451', 'est-451-31', 31, 37, 'C', 1, lower(hex(randomblob(16)))),
('te-451-32', 'turma-451', 'est-451-32', 32, 37, 'C', 1, lower(hex(randomblob(16)))),
('te-451-33', 'turma-451', 'est-451-33', 33, 33, 'B', 1, lower(hex(randomblob(16)))),
('te-451-34', 'turma-451', 'est-451-34', 34, 30, 'B', 1, lower(hex(randomblob(16))));

PRAGMA foreign_keys=on;
