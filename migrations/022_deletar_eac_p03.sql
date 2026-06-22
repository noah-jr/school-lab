-- ============================================================
-- MIGRAÇÃO 022 — Deletar eac-p03 (terceiro relatório)
-- ============================================================

DELETE FROM designacoes WHERE parte_id = 'eac-p03';
DELETE FROM programa_partes WHERE programa_id = 'eac-standard' AND id = 'eac-p03';
