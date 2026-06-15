-- ============================================================
-- SEED 001 — Programa padrão EAC (46 partes em 5 dias)
-- ============================================================

INSERT INTO programas (id, nome, descricao) VALUES
  ('prog-eac-standard', 'EAC — Programa Padrão 5 Dias', 'Escola para Anciãos de Congregação — 46 designações distribuídas de Segunda a Sexta');

-- -------------------------------------------------------
-- SEGUNDA-FEIRA
-- -------------------------------------------------------
INSERT INTO programa_partes (id, programa_id, numero, dia_semana, hora_inicio, duracao_minutos, titulo, tipo, nivel_requerido, ordem) VALUES
  ('pp-01','prog-eac-standard',1,'segunda','08:15',5,'Aprenda com Jeová – Relatório','relatorio','A/B',1),
  ('pp-02','prog-eac-standard',2,'segunda','08:15',5,'Aprenda com Jeová – Relatório','relatorio','A/B',2),
  ('pp-03','prog-eac-standard',3,'segunda','08:15',5,'Aprenda com Jeová – Relatório','relatorio','A/B',3),
  ('pp-04','prog-eac-standard',4,'segunda','10:15',1,'Aprenda com Cristo – Comentário (Apêndice A7)','comentario','C',4),
  ('pp-05','prog-eac-standard',5,'segunda','13:00',5,'Aprenda com Homens Fiéis – Relatório','relatorio','A/B',5),
  ('pp-06','prog-eac-standard',6,'segunda','13:00',4,'Aprenda com Homens Fiéis – Entrevista (opcional)','entrevista','NULO',6),
  ('pp-07','prog-eac-standard',7,'segunda','15:05',5,'Workshop 1 – w1: Bons Conselhos e Pastoreio','workshop','A/B',7),
  ('pp-08','prog-eac-standard',8,'segunda','15:05',5,'Workshop 1 – w2: Sup. Grupo / Irmão','workshop','A/B',8),
  ('pp-09','prog-eac-standard',9,'segunda','15:05',5,'Workshop 1 – w3: Reunião do corpo','workshop','A/B',9),
  ('pp-10','prog-eac-standard',10,'segunda','15:05',5,'Workshop 1 – w4: Preparação/Pastoreio','workshop','A/B',10),
  ('pp-11','prog-eac-standard',11,'segunda','15:05',5,'Workshop 1 – w5: Sup. Grupo / Ajudante','workshop','A/B',11),
  ('pp-12','prog-eac-standard',12,'segunda','15:05',5,'Workshop 1 – w6: Sup. Circuito / CCA','workshop','A/B',12);

-- -------------------------------------------------------
-- TERÇA-FEIRA
-- -------------------------------------------------------
INSERT INTO programa_partes (id, programa_id, numero, dia_semana, hora_inicio, duracao_minutos, titulo, tipo, nivel_requerido, ordem) VALUES
  ('pp-13','prog-eac-standard',13,'terca','08:00',3,'Use a Tradução do Novo Mundo – Comentário','comentario','B/C',13),
  ('pp-14','prog-eac-standard',14,'terca','08:00',5,'Use a Tradução do Novo Mundo – Relatório','relatorio','A/B',14),
  ('pp-15','prog-eac-standard',15,'terca','10:05',3,'Organização com Base em Princípios – Comentário','comentario','A/B',15),
  ('pp-16','prog-eac-standard',16,'terca','13:00',5,'Apegue-se à Organização – Demonstração','demonstracao','A/B',16),
  ('pp-17','prog-eac-standard',17,'terca','15:05',5,'Workshop 2 – w7: Promova a União Cristã','workshop','A/B',17),
  ('pp-18','prog-eac-standard',18,'terca','15:05',5,'Workshop 2 – w8: Relatório do S. Circuito','workshop','A/B',18),
  ('pp-19','prog-eac-standard',19,'terca','15:05',5,'Workshop 2 – w9a e w9b','workshop','A/B',19),
  ('pp-20','prog-eac-standard',20,'terca','15:05',1,'Workshop 2 – w10','workshop','A/B',20);

-- -------------------------------------------------------
-- QUARTA-FEIRA
-- -------------------------------------------------------
INSERT INTO programa_partes (id, programa_id, numero, dia_semana, hora_inicio, duracao_minutos, titulo, tipo, nivel_requerido, ordem) VALUES
  ('pp-21','prog-eac-standard',21,'quarta','10:05',2,'Fruto do Espírito Parte 1 – Amor','comentario','A/B',21),
  ('pp-22','prog-eac-standard',22,'quarta','10:05',5,'Fruto do Espírito Parte 1 – Demonstração','demonstracao','A/B',22),
  ('pp-23','prog-eac-standard',23,'quarta','10:05',2,'Fruto do Espírito Parte 1 – Alegria','comentario','B/C',23),
  ('pp-24','prog-eac-standard',24,'quarta','10:05',2,'Fruto do Espírito Parte 1 – Paz','comentario','B/C',24),
  ('pp-25','prog-eac-standard',25,'quarta','10:05',2,'Fruto do Espírito Parte 1 – Paciência','comentario','B/C',25),
  ('pp-26','prog-eac-standard',26,'quarta','10:05',2,'Fruto do Espírito Parte 1 – Bondade','comentario','B/C',26),
  ('pp-27','prog-eac-standard',27,'quarta','13:00',2,'Fruto do Espírito Parte 2 – Benignidade','comentario','B/C',27),
  ('pp-28','prog-eac-standard',28,'quarta','13:00',2,'Fruto do Espírito Parte 2 – Fé','comentario','B/C',28),
  ('pp-29','prog-eac-standard',29,'quarta','13:00',2,'Fruto do Espírito Parte 2 – Brandura','comentario','B/C',29),
  ('pp-30','prog-eac-standard',30,'quarta','13:00',2,'Fruto do Espírito Parte 2 – Autodomínio','comentario','B/C',30),
  ('pp-31','prog-eac-standard',31,'quarta','13:00',4,'Fruto do Espírito Parte 2 – Demonstração Final','demonstracao','A/B',31),
  ('pp-32','prog-eac-standard',32,'quarta','15:05',4,'Workshop 3 – w11: Treine Outros','workshop','A/B',32),
  ('pp-33','prog-eac-standard',33,'quarta','15:05',4,'Workshop 3 – w12: Jovem Adulto','workshop','A/B',33),
  ('pp-34','prog-eac-standard',34,'quarta','15:05',6,'Workshop 3 – w13a/b','workshop','A/B',34),
  ('pp-35','prog-eac-standard',35,'quarta','15:05',6,'Workshop 3 – w14','workshop','A/B',35),
  ('pp-36','prog-eac-standard',36,'quarta','15:05',5,'Workshop 3 – w15: CCA/SEC/SS','workshop','A/B',36);

-- -------------------------------------------------------
-- QUINTA-FEIRA
-- -------------------------------------------------------
INSERT INTO programa_partes (id, programa_id, numero, dia_semana, hora_inicio, duracao_minutos, titulo, tipo, nivel_requerido, ordem) VALUES
  ('pp-37','prog-eac-standard',37,'quinta','08:00',4,'Pregue com Perseverança – Entrevista (Opcional)','entrevista','NULO',37),
  ('pp-38','prog-eac-standard',38,'quinta','08:00',2,'Pregue com Perseverança – Comentário','comentario','A/B/C',38),
  ('pp-39','prog-eac-standard',39,'quinta','08:00',5,'Pregue com Perseverança – Série de Discursos','discurso','A/B',39),
  ('pp-40','prog-eac-standard',40,'quinta','10:05',5,'Sermão do Monte Parte 1 – Relatório','relatorio','A/B',40),
  ('pp-41','prog-eac-standard',41,'quinta','10:05',3,'Sermão do Monte Parte 1 – Comentário','comentario','A/B',41),
  ('pp-42','prog-eac-standard',42,'quinta','10:05',3,'Sermão do Monte Parte 1 – Comentário B','comentario','B',42),
  ('pp-43','prog-eac-standard',43,'quinta','10:05',5,'Sermão do Monte Parte 1 – Demonstração','demonstracao','A/B',43),
  ('pp-44','prog-eac-standard',44,'quinta','13:00',3,'Sermão do Monte Parte 2 – Comentário B','comentario','B',44),
  ('pp-45','prog-eac-standard',45,'quinta','13:00',3,'Sermão do Monte Parte 2 – Comentário B','comentario','B',45),
  ('pp-46','prog-eac-standard',46,'quinta','13:00',3,'Sermão do Monte Parte 2 – Comentário C','comentario','C',46);
