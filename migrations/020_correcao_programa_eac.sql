-- ============================================================
-- MIGRAÇÃO 020 — Retificações no programa EAC
-- ============================================================

-- 1. Corrigir o erro ortográfico "APRNDA" para "APRENDA"
UPDATE programa_partes 
SET titulo = 'APRENDA COM JEOVÁ - Relatório' 
WHERE programa_id = 'eac-standard' 
  AND titulo = 'APRNDA COM JEOVÁ - Relatório';

-- 2. Corrigir o número da designação do Apêndice A7 de 4 para 3
-- Conforme pedido pelo utilizador, a designação 3 tem várias partes (A7) de A até E
UPDATE programa_partes
SET numero = 3
WHERE programa_id = 'eac-standard'
  AND id IN ('eac-p04a', 'eac-p04b', 'eac-p04c', 'eac-p04d', 'eac-p04e');

-- 3. Apagar o terceiro relatório de "Aprenda com Jeová" (eac-p03), deixando apenas 2 relatórios (nº 1 e nº 2)
DELETE FROM designacoes WHERE parte_id = 'eac-p03';
DELETE FROM programa_partes WHERE programa_id = 'eac-standard' AND id = 'eac-p03';
