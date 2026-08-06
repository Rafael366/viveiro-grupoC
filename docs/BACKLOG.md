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
**para** saber se temos interesses em comum antes de procurá-la.

Pronto quando:
- clicar no nome de usuário do autor, em qualquer cartão, abre a página dessa pessoa;
- a página mostra nome de usuário, tipo (aluno ou professor), curso e interesses;
- a página lista as ideias publicadas por essa usuário, com o título clicável;
- se a usuário não publicou nenhuma ideia, aparece a frase "ainda não publicou ideias" no lugar da lista vazia;
- existe um caminho de volta ao mural sem usar o botão do navegador.

---

### V-02 — Filtro por curso

Implementar filtro por curso na barra lateral do mural.

Pronto quando:
-A barra lateral contém um seletor (dropdown ou lista) com os cursos disponíveis.

-Selecionar um curso exibe imediatamente apenas os cartões vinculados a ele.

-Existe a opção "Todos os cursos" para limpar o filtro e reexibir a lista completa.

-Se o curso selecionado não possuir ideias, exibe a mensagem "Nenhuma ideia cadastrada para este curso".
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

---

### V-04 — Encontrar ideias que combinam comigo

**Como** visitante do mural,
**quero** encontrar rapidamente as ideias que combinam comigo,
**para** não perder tempo.

Pronto quando:
- A busca filtra em tempo real ao digitar no campo de texto.
- A busca inspeciona título, resumo e tags das ideias.
- A busca é insensível a maiúsculas/minúsculas e acentuação (ex: "robotica" encontra "Robótica") (corrigindo o bug B-04).
- Quando nenhum resultado for encontrado, exibe a mensagem "Nenhuma ideia encontrada para esta busca" (corrigindo o bug B-02).
- Apagar o texto da busca restaura a exibição de todas as ideias
---

### V-05 — Entrar e sair de um grupo

**Como** aluno que quer se aproximar de um tema,
**quero** entrar num grupo,
**para** acompanhar o que se discute ali.

Pronto quando:
- a lista de grupos mostra, em cada grupo, se estou dentro ou fora;
- entrar acrescenta o nome de usuário à lista de membros e o contador sobe;
- sair remove meu nome de usuário e o contador desce;
- a lista mostra os nomes de usuários dos membros, não apenas o número;
- trocar a pessoa em "navegando como" muda corretamente o que aparece como "meus grupos".

---

### V-06 — Estados da ideia

**Como** usuário,
**quero** que as ideias tenham estados,
**para** que os estados das ideias fiquem registrados.

Pronto quando:
-  Os cartões exibem um badge visual indicando um dos 3 estados: Semente, Germinando ou Proposta.
- Toda ideia recém-criada inicia obrigatoriamente como Semente.
- O autor da ideia possui um controle para alterar o estado no cartão ou na página de detalhes.
- A alteração de estado reflete imediatamente na interface e persiste localmente.

---

### V-07 — Registrar interesse em participar

**Como** aluno que quer entrar num projeto,
**quero** declarar interesse numa ideia,
**para** que quem a propôs saiba que pode me chamar.

Pronto quando:
-Cada cartão possui o botão "Tenho interesse em participar".
-Ao clicar, o nome do usuário selecionado em "navegando como" entra na lista de interessados.
-O sistema impede que a mesma pessoa se registre mais de uma vez na mesma ideia.
-É possível cancelar o interesse; o nome é removido e o contador decrementa.
-O número de apoios/interessados atualiza instantaneamente no cartão sem necessidade de reexibir ou refazer buscas (corrigindo o bug B-05).

### V-08 — Não perder o que foi escrito

**Como** usuário,
**quero** não perder o que escrevi,
**para** não ter que digitar tudo de novo.

Pronto quando:
- os dados forem salvos em `localStorage` usando `JSON.stringify`, e recuperados no carregamento da página.

---

### V-09 — Aviso de novo interessado

**Como** aluno com uma ideia publicada,
**quero** receber um E-mail no computador quando alguém demonstrar interesse,
**para** não perder a chance de formar grupo.

Pronto quando:
- ao registrar interesse, o autor recebe uma notificação no celular em até um minuto;
- a notificação mostra o nome de quem se interessou e o título da ideia;
- tocar na notificação abre a ideia correspondente.

---

## Caixa de entrada

Anotações de conversa. Ninguém escreveu direito ainda.

- **V-10** — ideias paradas
- **V-11** — relatório por curso
- **V-12** — exportar / importar o estado

---

## Defeitos conhecidos

Nenhum destes foi priorizado. Estão aqui para não serem esquecidos.

- **B-01** — depois de clicar numa tag, não há como desfazer o filtro; só recarregando a página.
- **B-02** — quando a busca não encontra nada, o mural fica em branco, sem nenhuma explicação.
- **B-04** — buscar `robotica` não encontra "Robótica"; buscar `Musica` não encontra "música".
- **B-05** — o número de apoios no cartão só muda depois que se refaz a busca.
- **B-06** — título comprido vaza para fora do cartão e atravessa o cartão vizinho.
- correção:
- **B-01** -Adicionar botão "Limpar tag" ou permitir desmarcar a tag clicando novamente nela.
- **B-02** -Exibir mensagem Empty State amigável informando ausência de dados.
- **B-04** -Aplicar normalização de strings (remover acentos e converter para lowercase) na busca.
- **B-05** -Forçar re-renderização do componente do cartão ao alterar estado de interesse.
- **B-06** -Aplicar regra CSS (word-break: break-word ou text-overflow: ellipsis).
