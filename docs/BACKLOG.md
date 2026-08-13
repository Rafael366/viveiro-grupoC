# Backlog do Viveiro

> Documento herdado. Escrito ao longo do 1º semestre de 2026 pela equipe anterior.
> Última alteração: 2026-07-30.
>
> **Aviso de quem escreveu:** algumas destas histórias passaram pela revisão do
> cliente e outras não. Não me lembro quais. Boa sorte. — R.M.

---

## Histórias escritas

### V-01 — Página da pessoa

**Como** aluno que encontrou uma ideia interessante,
**quero** ver a página de quem a publicou,
**para** saber se temos interesses acadêmicos em comum antes de procurá-la.

Pronto quando:
- clicar no nome de usuário do autor, em qualquer cartão, abre a página dessa pessoa;
- a página mostra nome de usuário, tipo (aluno ou professor), curso e interesses de projeto;
- a página lista as ideias publicadas por este(a) usuário(a), com o título clicável;
- se o usuário não publicou nenhuma ideia, aparece a frase "ainda não publicou ideias" no lugar da lista vazia;
- existe um caminho de volta ao mural sem usar o botão do navegador.

---

### V-02 — Filtro por curso

**Como** aluno que quer achar um projeto interessante, 
**quero** ter um filtro na barra lateral, 
**para** encontrar projetos relacionados ao meu curso.

Pronto quando:
- A barra lateral contém um seletor (dropdown ou lista) com os cursos disponíveis.
- Selecionar um curso exibe imediatamente apenas os projetos vinculados a ele.
- Existe a opção "Todos os cursos" para limpar o filtro e reexibir a lista completa.
- Se o curso selecionado não possuir ideias, exibe a mensagem "Nenhuma ideia cadastrada para este curso".

---

### V-03 — Publicar uma ideia

**Como** aluno com uma ideia na cabeça,
**quero** publicá-la sem depender de ninguém,
**para** que ela exista antes de eu esquecer.

Pronto quando:
- existe um formulário com título, resumo e tags;
- ao enviar, a ideia aparece no topo do mural imediatamente, sem recarregar a página;
- a ideia criada traz, como autor, o nome do usuário que está navegando, e a data de criação da ideia;
- título vazio impede o envio e mostra uma mensagem dizendo o que falta;
- a contagem total de ideias exibida no mural aumenta em um.
- O título do cartão deve se ajustar aos limites do componente visual.

---

### V-04 — Encontrar ideias que combinam comigo

**Como** visitante do mural,
**quero** encontrar rapidamente as ideias que combinam comigo,
**para** não perder tempo.

Pronto quando:
- A busca filtra em tempo real ao digitar no campo de texto.
- A busca inspeciona título, resumo e tags das ideias.
- A busca é insensível a maiúsculas/minúsculas e acentuação (ex: "robotica" encontra "Robótica").
- Quando nenhum resultado for encontrado, exibe a mensagem "Nenhuma ideia encontrada para esta busca".
- Apagar o texto da busca restaura a exibição de todas as ideias.
- Exibir botão "Limpar tag" ou permitir desmarcar a tag clicando novamente nela.

---

### V-05 — Entrar e sair de um grupo

**Como** aluno que quer se aproximar de um tema,
**quero** entrar num grupo de estudo/pesquisa,
**para** acompanhar o que se discute ali.

Pronto quando:
- a lista de grupos de estudo/pesquisa mostra, em cada grupo, se estou dentro ou fora;
- entrar acrescenta o nome de usuário à lista de membros e o contador sobe;
- sair remove meu nome de usuário e o contador desce;
- a lista mostra os nomes de usuários dos membros, não apenas o número;
- trocar a pessoa em "navegando como" muda corretamente o que aparece como "meus grupos de projeto".

---

### V-06 — Estados da ideia

**Como** usuário,
**quero** que as ideias tenham estados,
**para** que os estados das ideias fiquem registrados.

Pronto quando:
- Os cartões exibem um badge visual indicando um dos 3 estados: Semente, Germinando ou Proposta.
- Toda ideia recém-criada inicia obrigatoriamente como Semente.
- O autor da ideia possui um controle para alterar o estado no cartão ou na página de detalhes.
- A alteração de estado reflete imediatamente na interface e persiste localmente.
- O título do cartão deve se ajustar aos limites do componente visual.

---

### V-07 — Registrar interesse em participar

**Como** aluno que quer entrar num projeto,
**quero** declarar interesse numa ideia,
**para** que quem a propôs saiba que pode me chamar.

Pronto quando:
- Cada cartão possui o botão "Tenho interesse em participar".
- Ao clicar, o nome do usuário selecionado em "navegando como" entra na lista de interessados.
- O sistema impede que a mesma pessoa se registre mais de uma vez na mesma ideia.
- É possível cancelar o interesse; o nome é removido e o contador decrementa.
- O número de apoios/interessados atualiza instantaneamente no cartão sem necessidade de reexibir ou refazer buscas.

### V-08 — Não perder o que foi escrito

**Como** usuário,
**quero** não perder o que escrevi,
**para** não ter que digitar tudo de novo.

Pronto quando:
- Os dados digitados nos formulários são salvos continuamente como rascunho durante o preenchimento.
- Ao reabrir ou recarregar a página, o estado anterior do sistema e os rascunhos não enviados são restaurados automaticamente.
- O envio bem-sucedido de um formulário limpa o rascunho salvo correspondente.

---

### V-09 — Aviso de novo interessado

**Como** aluno com uma ideia publicada,
**quero** receber um E-mail ou uma notificação in-web quando alguém demonstrar interesse,
**para** não perder a chance de formar grupo.

Pronto quando:
- ao registrar interesse, o autor recebe uma notificação no e-mail ou in-web em até um minuto;
- a notificação mostra o nome de quem se interessou e o título da ideia;
- acessar a notificação abre a ideia correspondente.

---

## Caixa de entrada

V-10 Identificar ideias paradas (Sem engajamento)
**Como** professor ou moderador da plataforma,
**quero** visualizar quais ideias não recebem novos interessados ou atualizações há bastante tempo,
**para** poder dar atenção, orientar ou ajudar a movimentar propostas esquecidas.

Pronto quando:
-Na listagem/mural de ideias, existe uma opção de ordenação ou filtro por "Ideias sem atualização" (ou ordenação por "Mais antigas / Menos interessados").
-É exibido um badge visual discreto (ex: "Sem novos interessados") em ideias que estão no estado Semente e não possuem registros de interesse nas últimas semanas ou desde a criação.
-Permite que o professor identifique rapidamente ideias que precisam de incentivo para não serem perdidas.
V-11 — Relatório de ideias por curso
Como membro da Coordenação de Ensino, Pesquisa e Extensão,

quero visualizar um resumo quantitativo das ideias e interessados agrupados por curso,

para mapear a demanda acadêmica da instituição antes de publicar novos editais.

Pronto quando:

Existe uma aba ou tela dedicada de "Relatórios" / "Visão Geral" acessível na plataforma.

A tela exibe uma tabela ou lista consolidada contendo:

Nome do Curso;

Total de ideias publicadas vinculadas ao curso;

Total de alunos/usuários interessados acumulados nessas ideias.

Se um curso não possuir ideias cadastradas, ele deve ser listado com a contagem zerada (0).

O relatório reflete os dados armazenados localmente em tempo real sem expor dados pessoais reais (respeitando a Norma 1).

V-12 — Exportar e importar o estado da aplicação
**Como** usuário da plataforma (ou equipe de desenvolvimento/testes),

**quero** exportar todos os dados do Viveiro para um arquivo local (JSON) e poder importá-los de volta,

**para** não perder as ideias, grupos e rascunhos criados no navegador e permitir o compartilhamento de dados entre diferentes sessões/computadores.

Pronto quando:

-Existe um botão ou menu "Exportar dados" que faz o download de um arquivo contendo todo o estado atual do sistema (ideias, estados, interessados, grupos e rascunhos).
- Existe um botão "Importar dados" que permite selecionar um arquivo previamente exportado para restaurar ou carregar esse estado na aplicação.
- Caso o arquivo importado seja inválido ou esteja corrompido, o sistema exibe uma mensagem de erro amigável sem quebrar a interface nem apagar os dados atuais.
- A importação substitui/atualiza o estado local do navegador de forma transparente.

---

## Defeitos conhecidos

Nenhum destes foi priorizado. Estão aqui para não serem esquecidos.

- **B-01** — depois de clicar numa tag, não há como desfazer o filtro; só recarregando a página.
- **B-02** — quando a busca não encontra nada, o mural fica em branco, sem nenhuma explicação.
- **B-03** — a data aparece como 2026-03-14 em vez de 14/03/2026.
- **B-04** — buscar `robotica` não encontra "Robótica"; buscar `Musica` não encontra "música".
- **B-05** — o número de apoios no cartão só muda depois que se refaz a busca.
- **B-06** — título comprido vaza para fora do cartão e atravessa o cartão vizinho.
## Defeitos corrigidos
- **C-01** - Adicionar botão "Limpar tag" ou permitir desmarcar a tag clicando novamente nela.
- **C-02** - Exibir mensagem "Nenhuma ideia encontrada para esta busca" informando ausência de dados.
- **C-04** - Aplicar normalização de strings (remover acentos e converter para lowercase) na busca.
- **C-05** - Forçar re-renderização do componente do cartão ao alterar estado de interesse.
- **C-06** - Aplicar regra CSS (word-break: break-word ou text-overflow: ellipsis).
