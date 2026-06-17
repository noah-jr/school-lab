import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { criarEstudante, listarEstudantes, adicionarEstudanteATurma } from "@/lib/repositories/estudantes";

const execAsync = promisify(exec);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: turmaId } = await params;
    const body = await req.json();
    const uploadId = body.upload_id;

    if (!uploadId) {
      return NextResponse.json({ erro: "ID do upload não fornecido" }, { status: 400 });
    }

    const db = getDb();
    
    // Obter caminho do ficheiro
    const upload = db.prepare("SELECT * FROM uploads WHERE id = ?").get(uploadId) as any;
    if (!upload) {
      return NextResponse.json({ erro: "Ficheiro não encontrado" }, { status: 404 });
    }

    const caminhoAbsoluto = path.join(process.cwd(), upload.caminho);

    // Executar o script python para extrair a tabela
    const pythonScript = path.join(process.cwd(), "src", "lib", "parse_docx.py");
    const { stdout, stderr } = await execAsync(`python3 "${pythonScript}" "${caminhoAbsoluto}"`);
    
    let estudantesParseados = [];
    try {
      estudantesParseados = JSON.parse(stdout);
      if (estudantesParseados.erro) throw new Error(estudantesParseados.erro);
    } catch (e) {
      console.error("Erro ao fazer parse do stdout:", stdout, stderr);
      return NextResponse.json({ erro: "Falha ao ler o documento DOCX. O ficheiro não está no formato correto." }, { status: 400 });
    }

    if (!estudantesParseados || estudantesParseados.length === 0) {
      return NextResponse.json({ erro: "Nenhum estudante encontrado na tabela do documento." }, { status: 400 });
    }

    // Processar os estudantes encontrados
    let inseridos = 0;
    const todosEstudantesDB = listarEstudantes({ porPagina: 10000 }).dados;

    for (const est of estudantesParseados) {
      // Tentar encontrar o estudante pelo nome (aproximação simples)
      let estudanteDb = todosEstudantesDB.find(e => e.nome.toLowerCase() === est.nome.toLowerCase());
      
      // Se não existir, criar um novo
      if (!estudanteDb) {
        // Tentar obter congregacao
        let congregacaoId = null;
        if (est.congregacao) {
          const cNome = est.congregacao.split(",")[0].trim();
          const congDb = db.prepare("SELECT id FROM congregacoes WHERE nome LIKE ? LIMIT 1").get(`%${cNome}%`) as any;
          if (congDb) congregacaoId = congDb.id;
        }

        estudanteDb = criarEstudante({
          nome: est.nome,
          email_jwpub: est.cca_email,
          telefone_principal: est.telefone,
          congregacao_id: congregacaoId,
          papel_ministerial: "anciao", // Padrão
          fotografia: "",
          activo: 1
        });
      }

      // Adicionar à turma (se já não estiver)
      const jaInscrito = db.prepare("SELECT id FROM turma_estudantes WHERE turma_id = ? AND estudante_id = ?").get(turmaId, estudanteDb.id);
      
      if (!jaInscrito) {
        adicionarEstudanteATurma(turmaId, estudanteDb.id, {
          numero_lista: est.numero_lista,
          idade: est.idade ? parseFloat(est.idade) : undefined,
          anos_batismo: est.anos_batismo ? parseFloat(est.anos_batismo) : undefined,
          cca_email: est.cca_email
        });
        inseridos++;
      }
    }

    // Marcar ficheiro como processado
    db.prepare("UPDATE uploads SET processado = 1 WHERE id = ?").run(uploadId);

    return NextResponse.json({ 
      mensagem: `Importação concluída. ${inseridos} estudantes foram adicionados à turma.`, 
      inseridos 
    }, { status: 200 });

  } catch (err) {
    console.error("[POST /api/turmas/[id]/importar]", err);
    return NextResponse.json({ erro: "Erro ao processar o upload e importação" }, { status: 500 });
  }
}
