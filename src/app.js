/* Viveiro app.js
   Implementação das histórias V-01 até V-05.
*/

var estado = {
  pessoa: null,
  busca: "",
  tag: null,
  curso: "",
  aba: "mural",
  perfil: null
};


/* ================================================================
   DADOS
   ================================================================ */

function pessoaPorId(id) {
  for (var i = 0; i < DADOS.pessoas.length; i++) {
    if (DADOS.pessoas[i].id === Number(id)) {
      return DADOS.pessoas[i];
    }
  }

  return null;
}


function nomeDe(id) {
  var p = pessoaPorId(id);
  return p ? p.nome : "(desconhecido)";
}


function ideiaPorId(id) {
  for (var i = 0; i < DADOS.ideias.length; i++) {
    if (DADOS.ideias[i].id === Number(id)) {
      return DADOS.ideias[i];
    }
  }

  return null;
}


/* ================================================================
   PERSISTÊNCIA
   ================================================================ */

var CHAVE_IDEIAS = "viveiro_ideias_VC";
var CHAVE_INTERESSES = "viveiro_interesses_VC";


function carregarDadosSalvos() {

  try {

    var ideiasSalvas = localStorage.getItem(CHAVE_IDEIAS);

    if (ideiasSalvas) {
      var ideias = JSON.parse(ideiasSalvas);

      if (Array.isArray(ideias)) {
        DADOS.ideias = ideias;
      }
    }

  } catch (erro) {
    console.warn("Não foi possível carregar as ideias salvas.", erro);
  }


  /*
   * Garante que todas as ideias possuam a lista de interessados.
   */
  for (var i = 0; i < DADOS.ideias.length; i++) {

    if (!Array.isArray(DADOS.ideias[i].interessados)) {
      DADOS.ideias[i].interessados = [];
    }

  }
}


function salvarIdeias() {

  try {
    localStorage.setItem(
      CHAVE_IDEIAS,
      JSON.stringify(DADOS.ideias)
    );
  } catch (erro) {
    console.warn("Não foi possível salvar as ideias.", erro);
  }
}


/* ================================================================
   UTILITÁRIOS
   ================================================================ */

function normalizar(texto) {

  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

}


function dataBonita(iso) {

  if (!iso) return "";

  var partes = iso.split("-");

  if (partes.length !== 3) {
    return iso;
  }

  return partes[2] + "/" + partes[1] + "/" + partes[0];
}


function proximoIdDeIdeia() {

  var maior = 0;

  for (var i = 0; i < DADOS.ideias.length; i++) {

    if (DADOS.ideias[i].id > maior) {
      maior = DADOS.ideias[i].id;
    }

  }

  return maior + 1;
}


function cursoDaIdeia(ideia) {

  var autor = pessoaPorId(ideia.autor);

  return autor ? autor.curso : "";
}


/* ================================================================
   FILTRAGEM
   ================================================================ */

function ideiasVisiveis() {

  var resultado = [];

  var textoBusca = normalizar(estado.busca);

  for (var i = 0; i < DADOS.ideias.length; i++) {

    var ideia = DADOS.ideias[i];

    /* ------------------------- busca ------------------------- */

    var casaTexto = true;

    if (textoBusca !== "") {

      var textoCompleto = [
        ideia.titulo,
        ideia.resumo,
        ideia.tags.join(" ")
      ].join(" ");

      casaTexto =
        normalizar(textoCompleto).indexOf(textoBusca) >= 0;
    }


    /* -------------------------- tag --------------------------- */

    var casaTag = true;

    if (estado.tag !== null) {

      casaTag =
        ideia.tags.indexOf(estado.tag) >= 0;
    }


    /* ------------------------- curso -------------------------- */

    var casaCurso = true;

    if (estado.curso !== "") {

      casaCurso =
        cursoDaIdeia(ideia) === estado.curso;
    }


    if (casaTexto && casaTag && casaCurso) {
      resultado.push(ideia);
    }

  }

  return resultado;
}


/* ================================================================
   DESENHO PRINCIPAL
   ================================================================ */

function desenhar() {

  desenharSeletorDePessoas();
  desenharFiltroDeCursos();
  desenharMural();
  desenharGrupos();

  document.getElementById("base").textContent =
    "base " + DADOS.codigo;

}


/* ================================================================
   SELETOR DE PESSOA
   ================================================================ */

function desenharSeletorDePessoas() {

  var alvo = document.getElementById("quem");

  if (alvo.options.length === 0) {

    for (var i = 0; i < DADOS.pessoas.length; i++) {

      var p = DADOS.pessoas[i];

      var opcao = document.createElement("option");

      opcao.value = p.id;

      opcao.textContent =
        p.nome + " (" + p.curso + ")";

      alvo.appendChild(opcao);
    }

  }

  alvo.value = estado.pessoa;
}


/* ================================================================
   FILTRO DE CURSOS
   ================================================================ */

function desenharFiltroDeCursos() {

  var alvo = document.getElementById("filtro-curso");

  if (alvo.options.length > 1) {
    alvo.value = estado.curso;
    return;
  }


  var cursos = [];

  for (var i = 0; i < DADOS.pessoas.length; i++) {

    var curso = DADOS.pessoas[i].curso;

    if (cursos.indexOf(curso) === -1) {
      cursos.push(curso);
    }

  }

  cursos.sort();


  for (var j = 0; j < cursos.length; j++) {

    var opcao = document.createElement("option");

    opcao.value = cursos[j];
    opcao.textContent = cursos[j];

    alvo.appendChild(opcao);
  }

  alvo.value = estado.curso;
}


/* ================================================================
   MURAL
   ================================================================ */

function desenharMural() {

  var lista = ideiasVisiveis();

  var alvo = document.getElementById("cartoes");

  alvo.innerHTML = "";


  if (lista.length === 0) {

    var vazio = document.createElement("p");

    vazio.className = "sem-resultados";


    if (estado.busca !== "") {

      vazio.textContent =
        "Nenhuma ideia encontrada para esta busca";

    } else if (estado.curso !== "") {

      vazio.textContent =
        "Nenhuma ideia cadastrada para este curso";

    } else {

      vazio.textContent =
        "Nenhuma ideia encontrada para os filtros selecionados";

    }


    alvo.appendChild(vazio);

  } else {

    for (var i = 0; i < lista.length; i++) {

      alvo.appendChild(
        montarCartao(lista[i])
      );

    }

  }


  document.getElementById("contagem").textContent =
    lista.length + " de " + DADOS.ideias.length + " ideias";


  desenharFiltrosAtivos();
}


/* ================================================================
   FILTROS ATIVOS
   ================================================================ */

function desenharFiltrosAtivos() {

  var aviso =
    document.getElementById("filtro-ativo");

  aviso.innerHTML = "";

  var possuiFiltro = false;


  if (estado.tag !== null) {

    possuiFiltro = true;

    var textoTag =
      document.createTextNode(
        "etiqueta: " + estado.tag
      );

    aviso.appendChild(textoTag);

  }


  if (estado.curso !== "") {

    if (possuiFiltro) {
      aviso.appendChild(
        document.createTextNode(" • ")
      );
    }

    possuiFiltro = true;

    aviso.appendChild(
      document.createTextNode(
        "curso: " + estado.curso
      )
    );

  }


  if (estado.tag !== null) {

    var limparTag =
      document.createElement("button");

    limparTag.textContent =
      "Limpar tag";

    limparTag.onclick = function () {

      estado.tag = null;

      desenharMural();

    };

    aviso.appendChild(limparTag);

  }


  if (estado.curso !== "") {

    var limparCurso =
      document.createElement("button");

    limparCurso.textContent =
      "Limpar curso";

    limparCurso.onclick = function () {

      estado.curso = "";

      document.getElementById("filtro-curso").value = "";

      desenharMural();

    };

    aviso.appendChild(limparCurso);

  }

}


/* ================================================================
   CARTÃO
   ================================================================ */

function montarCartao(ideia) {

  var cartao =
    document.createElement("div");

  cartao.className = "cartao";


  /* ------------------------- título -------------------------- */

  var titulo =
    document.createElement("h3");

  titulo.textContent =
    ideia.titulo;

  cartao.appendChild(titulo);


  /* ------------------------- autoria -------------------------- */

  var autoria =
    document.createElement("div");

  autoria.className =
    "autoria";


  var autor =
    document.createElement("button");

  autor.className =
    "autor-link";

  autor.textContent =
    nomeDe(ideia.autor);

  autor.onclick =
    function () {
      abrirPerfil(ideia.autor);
    };


  autoria.appendChild(
    document.createTextNode("por ")
  );

  autoria.appendChild(autor);

  autoria.appendChild(
    document.createTextNode(
      " • " + dataBonita(ideia.data)
    )
  );


  cartao.appendChild(autoria);


  /* ------------------------- resumo --------------------------- */

  var resumo =
    document.createElement("p");

  resumo.className =
    "resumo";

  resumo.textContent =
    ideia.resumo;

  cartao.appendChild(resumo);


  /* --------------------------- tags --------------------------- */

  var tags =
    document.createElement("div");

  tags.className =
    "tags";


  for (var i = 0; i < ideia.tags.length; i++) {

    var etiqueta =
      document.createElement("span");

    etiqueta.className =
      "etiqueta";

    if (estado.tag === ideia.tags[i]) {
      etiqueta.className += " selecionada";
    }

    etiqueta.textContent =
      ideia.tags[i];

    etiqueta.onclick =
      criarCliqueDeTag(ideia.tags[i]);


    tags.appendChild(etiqueta);
  }


  cartao.appendChild(tags);


  /* ------------------------- rodapé -------------------------- */

  var rodape =
    document.createElement("div");

  rodape.className =
    "rodape";


  var botao =
    document.createElement("button");

  botao.className =
    "interesse";


  var interessados =
    Array.isArray(ideia.interessados)
      ? ideia.interessados
      : [];


  var interessado =
    interessados.indexOf(estado.pessoa) >= 0;


  if (interessado) {

    botao.className += " ativo";

    botao.textContent =
      "Cancelar interesse";

  } else {

    botao.textContent =
      "Tenho interesse em participar";

  }


  botao.onclick =
    criarCliqueDeInteresse(ideia.id);


  rodape.appendChild(botao);


  var contador =
    document.createElement("span");

  contador.className =
    "apoios";

  contador.textContent =
    interessados.length +
    (
      interessados.length === 1
        ? " interessado"
        : " interessados"
    );


  rodape.appendChild(contador);

  cartao.appendChild(rodape);


  return cartao;
}


/* ================================================================
   TAGS
   ================================================================ */

function criarCliqueDeTag(tag) {

  return function () {

    /*
     * Clicar novamente na mesma tag remove o filtro.
     */
    if (estado.tag === tag) {
      estado.tag = null;
    } else {
      estado.tag = tag;
    }

    desenharMural();
  };
}


/* ================================================================
   INTERESSE EM PARTICIPAR — V-05
   ================================================================ */

function criarCliqueDeInteresse(idIdeia) {

  return function () {

    var ideia =
      ideiaPorId(idIdeia);

    if (!ideia) {
      return;
    }


    if (!Array.isArray(ideia.interessados)) {
      ideia.interessados = [];
    }


    var posicao =
      ideia.interessados.indexOf(
        estado.pessoa
      );


    /*
     * Se a pessoa já está interessada,
     * cancela o interesse.
     */
    if (posicao >= 0) {

      ideia.interessados.splice(
        posicao,
        1
      );

    } else {

      /*
       * Impede duplicidade.
       */
      ideia.interessados.push(
        estado.pessoa
      );

    }


    salvarIdeias();

    /*
     * Atualiza somente o mural.
     * Não altera busca nem filtros.
     */
    desenharMural();
  };
}


/* ================================================================
   PERFIL — V-01
   ================================================================ */

function abrirPerfil(idPessoa) {

  var pessoa =
    pessoaPorId(idPessoa);

  if (!pessoa) {
    return;
  }


  estado.perfil =
    pessoa.id;


  esconderTodasAsPaginas();

  document.getElementById("perfil")
    .className = "";


  desenharPerfil(pessoa);
}


function desenharPerfil(pessoa) {

  var dados =
    document.getElementById("dados-pessoa");

  dados.innerHTML = "";


  var nome =
    document.createElement("h2");

  nome.textContent =
    pessoa.nome;

  dados.appendChild(nome);


  var tipo =
    document.createElement("span");

  tipo.className =
    "tipo-pessoa";

  tipo.textContent =
    pessoa.tipo === "professor"
      ? "Professor"
      : "Aluno";

  dados.appendChild(tipo);


  var curso =
    document.createElement("p");

  curso.className =
    "dado-pessoa";

  curso.innerHTML =
    "<strong>Curso:</strong> " +
    pessoa.curso;

  dados.appendChild(curso);


  var tituloInteresses =
    document.createElement("p");

  tituloInteresses.className =
    "dado-pessoa";

  tituloInteresses.innerHTML =
    "<strong>Interesses de projeto:</strong>";

  dados.appendChild(tituloInteresses);


  var interesses =
    document.createElement("div");

  interesses.className =
    "interesses";


  if (pessoa.interesses.length === 0) {

    interesses.textContent =
      "Nenhum interesse informado.";

  } else {

    for (var i = 0;
         i < pessoa.interesses.length;
         i++) {

      var tag =
        document.createElement("span");

      tag.className =
        "interesse-tag";

      tag.textContent =
        pessoa.interesses[i];

      interesses.appendChild(tag);
    }

  }


  dados.appendChild(interesses);


  desenharIdeiasDaPessoa(pessoa.id);
}


function desenharIdeiasDaPessoa(idPessoa) {

  var alvo =
    document.getElementById(
      "lista-ideias-pessoa"
    );

  alvo.innerHTML = "";


  var ideias =
    [];

  for (var i = 0;
       i < DADOS.ideias.length;
       i++) {

    if (DADOS.ideias[i].autor === idPessoa) {

      ideias.push(
        DADOS.ideias[i]
      );

    }

  }


  if (ideias.length === 0) {

    var vazio =
      document.createElement("div");

    vazio.className =
      "vazio-pessoa";

    vazio.textContent =
      "ainda não publicou ideias";

    alvo.appendChild(vazio);

    return;
  }


  for (var j = 0;
       j < ideias.length;
       j++) {

    var ideia =
      ideias[j];


    var botao =
      document.createElement("button");

    botao.className =
      "ideia-pessoa";

    botao.textContent =
      ideia.titulo;


    var data =
      document.createElement("span");

    data.className =
      "data-ideia";

    data.textContent =
      "publicada em " +
      dataBonita(ideia.data);


    botao.appendChild(data);


    botao.onclick =
      criarCliqueParaAbrirIdeia(
        ideia.id
      );


    alvo.appendChild(botao);
  }
}


function criarCliqueParaAbrirIdeia(idIdeia) {

  return function () {

    /*
     * Ao clicar no título da ideia no perfil,
     * voltamos ao mural e selecionamos a ideia
     * através da busca pelo título.
     */
    var ideia =
      ideiaPorId(idIdeia);

    if (!ideia) {
      return;
    }


    estado.busca =
      ideia.titulo;

    estado.tag =
      null;

    estado.curso =
      "";

    document.getElementById("busca")
      .value = ideia.titulo;

    document.getElementById("filtro-curso")
      .value = "";


    trocarAba("mural");

    desenharMural();
  };
}


/* ================================================================
   PUBLICAR IDEIA — V-03
   ================================================================ */

function publicarIdeia() {

  var titulo =
    document.getElementById(
      "titulo-ideia"
    ).value.trim();


  var resumo =
    document.getElementById(
      "resumo-ideia"
    ).value.trim();


  var tagsTexto =
    document.getElementById(
      "tags-ideia"
    ).value.trim();


  var erro =
    document.getElementById(
      "erro-publicacao"
    );


  erro.textContent = "";


  /*
   * Título obrigatório.
   */
  if (titulo === "") {

    erro.textContent =
      "Informe um título para publicar a ideia.";

    document.getElementById(
      "titulo-ideia"
    ).focus();

    return;
  }


  /*
   * Converte as tags em uma lista.
   */
  var tags = [];

  if (tagsTexto !== "") {

    var partes =
      tagsTexto.split(",");


    for (var i = 0;
         i < partes.length;
         i++) {

      var tag =
        partes[i].trim();


      if (
        tag !== "" &&
        tags.indexOf(tag) === -1
      ) {

        tags.push(tag);
      }

    }

  }


  /*
   * Data atual no formato YYYY-MM-DD.
   */
  var agora =
    new Date();


  var ano =
    agora.getFullYear();


  var mes =
    String(agora.getMonth() + 1)
      .padStart(2, "0");


  var dia =
    String(agora.getDate())
      .padStart(2, "0");


  var data =
    ano + "-" + mes + "-" + dia;


  /*
   * A nova ideia entra no começo da lista.
   */
  var novaIdeia = {

    id: proximoIdDeIdeia(),

    titulo: titulo,

    resumo: resumo,

    autor: estado.pessoa,

    tags: tags,

    data: data,

    apoios: 0,

    interessados: []

  };


  DADOS.ideias.unshift(
    novaIdeia
  );


  salvarIdeias();


  /*
   * Limpa o formulário.
   */
  document.getElementById(
    "form-publicar"
  ).reset();


  /*
   * Remove filtros para garantir que a nova ideia
   * fique visível imediatamente no topo do mural.
   */
  estado.busca = "";
  estado.tag = null;
  estado.curso = "";


  document.getElementById(
    "busca"
  ).value = "";

  document.getElementById(
    "filtro-curso"
  ).value = "";


  trocarAba("mural");

  desenharMural();
}


/* ================================================================
   GRUPOS
   ================================================================ */

function desenharGrupos() {

  var alvo =
    document.getElementById(
      "lista-grupos"
    );

  alvo.innerHTML = "";


  for (var i = 0;
       i < DADOS.grupos.length;
       i++) {

    var g =
      DADOS.grupos[i];


    var item =
      document.createElement("li");


    var quantos =
      document.createElement("span");

    quantos.className =
      "quantos";

    quantos.textContent =
      g.membros.length +
      (
        g.membros.length === 1
          ? " membro"
          : " membros"
      );

    item.appendChild(quantos);


    var nome =
      document.createElement("span");

    nome.className =
      "nome";

    nome.textContent =
      g.nome;

    item.appendChild(nome);


    var descricao =
      document.createElement("p");

    descricao.className =
      "descricao";

    descricao.textContent =
      g.descricao;

    item.appendChild(descricao);


    alvo.appendChild(item);
  }
}


/* ================================================================
   NAVEGAÇÃO
   ================================================================ */

function esconderTodasAsPaginas() {

  document.getElementById("mural")
    .className = "escondido";

  document.getElementById("grupos")
    .className = "escondido";

  document.getElementById("publicar")
    .className = "escondido";

  document.getElementById("perfil")
    .className = "escondido";
}


function trocarAba(qual) {

  estado.aba =
    qual;


  esconderTodasAsPaginas();


  if (qual === "mural") {

    document.getElementById("mural")
      .className = "";

  }


  if (qual === "grupos") {

    document.getElementById("grupos")
      .className = "";

  }


  if (qual === "publicar") {

    document.getElementById("publicar")
      .className = "";

  }


  document.getElementById("aba-mural")
    .className =
      qual === "mural"
        ? "aba ativa"
        : "aba";


  document.getElementById("aba-grupos")
    .className =
      qual === "grupos"
        ? "aba ativa"
        : "aba";


  document.getElementById("aba-publicar")
    .className =
      qual === "publicar"
        ? "aba ativa"
        : "aba";
}


/* ================================================================
   INÍCIO
   ================================================================ */

function iniciar() {

  /*
   * Carrega ideias e interesses persistidos.
   */
  carregarDadosSalvos();


  /*
   * Usuário inicial.
   */
  estado.pessoa =
    DADOS.pessoas[0].id;


  /* --------------------------- busca ------------------------- */

  document.getElementById(
    "busca"
  ).oninput = function (e) {

    estado.busca =
      e.target.value;

    desenharMural();
  };


  /* -------------------------- curso -------------------------- */

  document.getElementById(
    "filtro-curso"
  ).onchange = function (e) {

    estado.curso =
      e.target.value;

    desenharMural();
  };


  /* -------------------------- pessoa ------------------------- */

  document.getElementById(
    "quem"
  ).onchange = function (e) {

    estado.pessoa =
      Number(e.target.value);

    /*
     * A troca do usuário atualiza os botões
     * de interesse imediatamente.
     */
    if (estado.aba === "mural") {
      desenharMural();
    }
  };


  /* --------------------------- abas -------------------------- */

  document.getElementById(
    "aba-mural"
  ).onclick = function () {

    trocarAba("mural");

  };


  document.getElementById(
    "aba-grupos"
  ).onclick = function () {

    trocarAba("grupos");

  };


  document.getElementById(
    "aba-publicar"
  ).onclick = function () {

    trocarAba("publicar");

  };


  /* ------------------------ publicar ------------------------- */

  document.getElementById(
    "form-publicar"
  ).onsubmit = function (e) {

    e.preventDefault();

    publicarIdeia();

  };


  /* -------------------------- voltar ------------------------- */

  document.getElementById(
    "voltar-mural"
  ).onclick = function () {

    estado.perfil = null;

    trocarAba("mural");

    desenharMural();

  };


  /*
   * Primeira renderização.
   */
  desenhar();

}


iniciar();
