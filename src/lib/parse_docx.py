import sys
import zipfile
import xml.etree.ElementTree as ET
import json
import re

def parse_docx_table(file_path):
    try:
        doc = zipfile.ZipFile(file_path)
        xml_content = doc.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        
        # Namespaces
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        estudantes = []
        
        # Encontrar todas as tabelas
        for table in tree.findall('.//w:tbl', ns):
            # Encontrar todas as linhas da tabela
            rows = table.findall('.//w:tr', ns)
            for row in rows:
                cells = row.findall('.//w:tc', ns)
                row_text = []
                for cell in cells:
                    # Extrair texto de cada célula
                    texts = cell.findall('.//w:t', ns)
                    cell_text = ''.join(t.text for t in texts if t.text)
                    row_text.append(cell_text.strip())
                
                # Heurística para identificar uma linha de estudante
                # A primeira coluna deve ser um número, a segunda o nome
                if len(row_text) >= 7 and row_text[0].isdigit():
                    try:
                        numero = int(row_text[0])
                        nome = row_text[1]
                        idade = row_text[2]
                        batismo = row_text[3]
                        congregacao = row_text[4]
                        cca_email = row_text[5]
                        telefone = row_text[6]
                        
                        estudantes.append({
                            "numero_lista": numero,
                            "nome": nome,
                            "idade": idade,
                            "anos_batismo": batismo,
                            "congregacao": congregacao,
                            "cca_email": cca_email,
                            "telefone": telefone
                        })
                    except Exception as e:
                        continue
                        
        print(json.dumps(estudantes))
        return
    except Exception as e:
        print(json.dumps({"erro": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"erro": "Nenhum ficheiro fornecido"}))
        sys.exit(1)
    parse_docx_table(sys.argv[1])
