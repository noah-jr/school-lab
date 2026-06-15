-- 004_uploads.sql
-- Adiciona a tabela de uploads para suportar ficheiros locais (ex: importação excel)

CREATE TABLE IF NOT EXISTS uploads (
    id TEXT PRIMARY KEY,
    turma_id TEXT,
    nome_original TEXT NOT NULL,
    nome_ficheiro TEXT NOT NULL,
    caminho TEXT NOT NULL,
    tipo_mime TEXT NOT NULL,
    tamanho_bytes INTEGER NOT NULL,
    tipo_upload TEXT NOT NULL,
    processado INTEGER DEFAULT 0,
    criado_em TEXT NOT NULL,
    FOREIGN KEY(turma_id) REFERENCES turmas(id) ON DELETE SET NULL
);
