-- Migração 015: Adicionar flag para forçar alteração de senha
ALTER TABLE utilizadores ADD COLUMN precisa_mudar_senha INTEGER NOT NULL DEFAULT 0;
