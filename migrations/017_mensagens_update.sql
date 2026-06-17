-- Adicionar coluna ocultada na tabela mensagens
ALTER TABLE mensagens ADD COLUMN ocultada INTEGER DEFAULT 0;
