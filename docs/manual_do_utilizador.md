# Manual do Utilizador Completo: School-Lab

Bem-vindo ao manual completo da plataforma **School-Lab** (versão Angola). Este documento detalha todas as operações do sistema, as permissões de acesso, os fluxos automáticos e os passos de manutenção necessários para garantir o correto funcionamento da plataforma.

---

## 1. Introdução e Filosofia do Sistema

O **School-Lab** foi projetado para descentralizar e automatizar a gestão de avaliações de oratória. Ele foi concebido sob a premissa de **Privacidade Máxima por Desenho (Privacy by Design)**:
* **Armazenamento Local:** Todos os dados residem numa base de dados SQLite encriptada no próprio servidor físico da instituição.
* **Telemetria Controlada:** O tráfego e acessos de utilizadores, visitantes e alunos são monitorizados localmente para fins estatísticos e de auditoria, sem partilha de dados com servidores de publicidade ou telemetria externa.

---

## 2. Primeiro Acesso e Gestão de Contas

### 2.1 Credenciais Iniciais e Fluxo de Reset
1. O administrador cria o seu perfil e atribui-lhe uma senha temporária (por padrão, `12345678`).
2. Ao realizar o primeiro login com o seu e-mail e a senha inicial, o sistema reconhece a flag de segurança de senha inicial obrigatória e bloqueia o acesso aos painéis internos.
3. É automaticamente redirecionado para o formulário `/mudar-senha`.
4. Insira a nova senha desejada. A nova senha deve ter no mínimo 8 caracteres e conter letras e números.
5. Após guardar, a sua conta fica ativa e o painel de controlo é desbloqueado.

### 2.2 Troca Periódica de Senha
Pode atualizar as suas credenciais a qualquer altura através do menu **O Meu Perfil** (clicando no avatar no canto superior direito do cabeçalho da página).

---

## 3. Matriz de Permissões (RBAC)

O acesso às funcionalidades é restrito com base nos papéis atribuídos aos utilizadores:

* **Administrador (Admin):** Acesso ilimitado. Inclui gestão de utilizadores, logs de auditoria total, configuração do sistema e ferramentas de backup.
* **Secretaria:** Foco na administração escolar. Pode registar estudantes, criar e gerir turmas, mas não tem acesso à configuração global ou backups.
* **Instrutor:** Foco pedagógico. Pode gerir designações, calendarização de discursos e avaliar estudantes.

---

## 4. Gestão de Turmas (Passo a Passo)

### 4.1 Criar uma Nova Turma
1. No menu principal, clique em **Turmas** e depois em **Nova Turma**.
2. Preencha os seguintes campos:
   * **Nome da Turma:** Identificador da turma (ex: Turma A - 2026).
   * **Número da Turma:** Número sequencial da turma na temporada.
   * **Data de Início e Fim:** Datas que definem o ciclo de aulas e discursos.
   * **Local de Realização:** Nome do auditório ou sala física.
   * **Restrição Diária:** Se ativada, o sistema impede a atribuição de discursos consecutivos na mesma data a oradores que pertençam à mesma congregação.
3. Clique em **Gravar**. A turma é criada no estado `Rascunho`.

### 4.2 Alterar Estado de uma Turma
Na ficha de detalhe da turma, os administradores ou instrutores podem transitar o estado da turma:
* **Rascunho:** Planeamento inicial. Nenhuma notificação é enviada.
* **Ativa:** Ciclo de discursos em progresso. Estudantes conseguem ver as suas atribuições nos portais.
* **Concluída:** Histórico arquivado. Bloqueia alterações futuras nas designações.

---

## 5. Gestão de Estudantes e Upload de Ficheiros

### 5.1 Registo Individual e Ficha de Dados
Para gerir o corpo estudantil, aceda a **Estudantes**. A ficha de cada estudante contém:
* **Dados Pessoais:** Nome, contacto telefónico, endereço de e-mail.
* **Estatuto Ministerial:** Ancião, Servo Ministerial, ou Publicador.
* **Informação Congregacional:** Congregação de origem e Circuito.
* **Data de Batismo:** Usado para cálculo de antiguidade e maturidade pedagógica.

### 5.2 Carregamento de Documentos e Foto
1. **Fotografia:** Na ficha do estudante, clique na caixa da foto para carregar uma imagem em formato JPG ou PNG.
2. **Anexos e Documentos:** Na secção inferior, pode carregar PDFs ou imagens comprovativas. Os ficheiros são guardados localmente na pasta `uploads/` do servidor.

---

## 6. Algoritmo de Designações e Escala de Oradores

### 6.1 Como Funciona a Atribuição Automática
Ao aceder ao separador **Designações** dentro de uma turma, clique em **Gerar Escala Automática**. O sistema executa um algoritmo heurístico que avalia:
1. **Histórico de Oratória:** Estudantes que não discursam há mais tempo recebem prioridade.
2. **Cooperação Logística:** Agrupamento de estudantes da mesma congregação nas mesmas datas para partilha de transporte.
3. **Distribuição Equitativa:** Garante que nenhum estudante acumula múltiplas designações consecutivas enquanto outros aguardam a primeira oportunidade.

---

## 7. Relatórios e Emissão de Documentos PDF

O sistema permite gerar três tipos de relatórios de impressão em formato PDF de alta fidelidade:
1. **Cronograma Mensal:** Uma folha com todos os discursos calendarizados, oradores e temas.
2. **Ficha Individual do Estudante:** Um relatório de uma página com a fotografia do estudante, dados de contacto, histórico de discursos efetuados e notas médias obtidas.
3. **Guia do Viajante (Superintendente):** Um resumo otimizado para que os inspetores e avaliadores externos possam levar em viagem.

---

## 8. Portais de Avaliação Sem Conta

Para garantir que superintendentes de circuito ou avaliadores externos possam submeter notas sem necessidade de registo:
1. O instrutor gera um **Token de Avaliação** nas definições da Turma.
2. O avaliador recebe um link único (Ex: `/avaliacao/token-unico-encriptado`).
3. Ao aceder ao link, o avaliador insere as notas diretamente na grelha e clica em **Submeter Avaliação**. O link expira imediatamente após a submissão.

---

## 9. Caixa de Entrada e Gestão de Feedbacks (`/mensagens`)

A página de **Mensagens Internas** serve para comunicação entre operadores administrativos e recepção de feedbacks:
* **Visualizar Recebidas:** O ecrã padrão exibe as mensagens pendentes.
* **Editar Mensagem:** Se precisar de retificar informações numa mensagem, selecione-a e clique em **Editar**.
* **Ocultar:** Clique em **Ocultar** para retirar a mensagem da vista principal.
* **Eliminar Permanentemente:** Clique em **Eliminar** (com ícone vermelho de lixeira) para remover permanentemente a mensagem da base de dados física.

---

## 10. Administração Avançada: Backups e Recuperação

Esta área é restrita a utilizadores com o papel de **Administrador**.

* **Criar uma Salvaguarda (Backup):** Aceda a **Backups** -> **Criar Cópia de Segurança**. O download do ficheiro inicia-se automaticamente.
* **Restauro de Emergência (Recover):** Aceda a **Backups** -> **Restaurar de Ficheiro**, envie o ficheiro e clique em **Confirmar Restauro**.

---

## 11. Guia de Resolução de Problemas (Troubleshooting)

* **O gráfico da Dashboard não exibe novos acessos:** Certifique-se de que os acessos estão a ser efetuados às páginas públicas.
* **Erro de Conflito de Dependências no npm install:** Atualize as versões do `lucide-react` e `jspdf` no `package.json` para as mais recentes.
* **Mensagem "Dispositivo ou recurso ocupado" ao remover ficheiros:** Pare temporariamente o servidor Next.js, efetue a operação de eliminação, e inicie o servidor novamente.
