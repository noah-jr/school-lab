import sqlite3

conn = sqlite3.connect("data/escola.db")
cursor = conn.cursor()

print("=== TURMAS ===")
cursor.execute("SELECT id, nome, numero_turma FROM turmas")
for row in cursor.fetchall():
    print(row)

print("=== ESTUDANTES NA TURMA ===")
cursor.execute("SELECT id, turma_id, estudante_id FROM turma_estudantes LIMIT 5")
for row in cursor.fetchall():
    print(row)
conn.close()
