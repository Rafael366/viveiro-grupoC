/* ================================================================
   VIVEIRO — app.js
   MVP da equipe V-C
   ================================================================ */

(() => {
  "use strict";

  /* ================================================================
     CONFIGURAÇÃO
     ================================================================ */

  const CHAVE_STORAGE = "viveiro_vc_dados";

  let estado = {
    dados: null,
    pessoaAtual: null,

    abaAtual: "mural",

    busca: "",
    curso: "",
    ordenacao: "recentes",

    ideiaSelecionada: null,
    pessoaSelecionada: null,

    interessados: {},
    notificacoes: [],

    gruposParticipantes: {}
  };


  /* ================================================================
     UTILITÁRIOS
     ================================================================ */

  const $ = (seletor) => document.querySelector(seletor);

  function escapeHTML(valor) {
    return String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizar(valor) {
    return String(valor ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function gerarId(lista) {
    if (!lista.length) return 1;

    return Math.max(...lista.map(item => Number(item.id) || 0)) + 1;
  }

  function pessoaPorId(id) {
    return estado.dados.pessoas.find(p => Number(p.id) === Number(id));
  }

  function ideiaPorId(id) {
    return estado.dados.ideias.find(i => Number(i.id) === Number(id));
  }

  function grupoPorId(id) {
    return estado.dados.grupos.find(g => Number(g.id) === Number(id));
  }

  function formatarData(data) {
    if (!data) return "";

    const partes = String(data).split("-");

    if (partes.length !== 3) {
      return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  function salvar() {
    try {
      const pacote = {
        dados: estado.dados,
        interessados: estado.interessados,
        notificacoes: estado.notificacoes,
        gruposParticipantes: estado.gruposParticipantes,
        pessoaAtual: estado.pessoaAtual
      };

      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(pacote));
    } catch (erro) {
      console.error("Não foi possível salvar os dados:", erro);
    }
  }


  /* ================================================================
     CARREGAMENTO
     ================================================================ */

  function carregar() {
    let salvo = null;

    try {
      salvo = localStorage.getItem(CHAVE_STORAGE);
    } catch (erro) {
      console.warn("LocalStorage indisponível.");
    }

    if (salvo) {
      try {
        const pacote = JSON.parse(salvo);

        if (pacote && pacote.dados) {
          estado.dados = pacote.dados;
          estado.interessados = pacote.interessados || {};
          estado.notificacoes = pacote.notificacoes || [];
          estado.gruposParticipantes = pacote.gruposParticipantes || {};
          estado.pessoaAtual = pacote.pessoaAtual || null;

          garantirEstrutura();

          return;
        }
      } catch (erro) {
        console.warn("Dados salvos inválidos. Usando dados iniciais.");
      }
    }

    estado.dados = JSON.parse(JSON.stringify(DADOS));
    estado.interessados = {};
    estado.notificacoes = [];
    estado.gruposParticipantes = {};

    if (estado.dados.pessoas.length > 0) {
      estado.pessoaAtual = estado.dados.pessoas[0].id;
    }

    garantirEstrutura();
    salvar();
  }


  function garantirEstrutura() {
    if (!Array.isArray(estado.dados.pessoas)) {
      estado.dados.pessoas = [];
    }

    if (!Array.isArray(estado.dados.ideias)) {
      estado.dados.ideias = [];
    }

    if (!Array.isArray(estado.dados.grupos)) {
      estado.dados.grupos = [];
    }

    estado.dados.ideias.forEach(ideia => {
      if (!Array.isArray(ideia.tags)) {
        ideia.tags = [];
      }

      if (typeof ideia.apoios !== "number") {
        ideia.apoios = 0;
      }
    });
  }


  /* ================================================================
     INICIALIZAÇÃO
     ================================================================ */

  function iniciar() {
    carregar();
    configurarEventos();
    preencherPessoas();
    preencherCursos();
    atualizarTudo();
  }


  /* ================================================================
     EVENTOS
     ================================================================ */

  function configurarEventos() {

    $("#quem").addEventListener("change", (evento) => {
      estado.pessoaAtual = Number(evento.target.value);

      estado.ideiaSelecionada = null;
      estado.pessoaSelecionada = null;

      salvar();
      atualizarTudo();
    });


    $("#aba-mural").addEventListener("click", () => {
      abrirAba("mural");
    });

    $("#aba-grupos").addEventListener("click", () => {
      abrirAba("grupos");
    });

    $("#aba-relatorios").addEventListener("click", () => {
      abrirAba("relatorios");
    });

    $("#aba-notificacoes").addEventListener("click", () => {
      abrirAba("notificacoes");
    });


    $("#busca").addEventListener("input", (evento) => {
      estado.busca = evento.target.value;
      renderizarMural();
    });


    $("#filtro-curso").addEventListener("change", (evento) => {
      estado.curso = evento.target.value;
      renderizarMural();
    });


    $("#ordenacao").addEventListener("change", (evento) => {
      estado.ordenacao = evento.target.value;
      renderizarMural();
    });


    $("#form-ideia").addEventListener("submit", publicarIdeia);


    $("#btn-exportar").addEventListener("click", exportarDados);

    $("#btn-importar").addEventListener("click", () => {
      $("#arquivo-importar").click();
    });

    $("#arquivo-importar").addEventListener("change", importarDados);


    $("#marcar-notificacoes").addEventListener(
      "click",
      marcarTodasComoLidas
    );


    $("#voltar-pessoa").addEventListener("click", () => {
      estado.pessoaSelecionada = null;
      abrirAba("mural");
    });


    $("#voltar-detalhe").addEventListener("click", () => {
      estado.ideiaSelecionada = null;
      abrirAba("mural");
    });


    /* Delegação de eventos para elementos criados dinamicamente */

    $("#cartoes").addEventListener("click", tratarCliqueMural);

    $("#lista-grupos").addEventListener("click", tratarCliqueGrupos);

    $("#lista-notificacoes").addEventListener(
      "click",
      tratarCliqueNotificacao
    );

    $("#perfil-conteudo").addEventListener(
      "click",
      tratarCliquePerfil
    );

    $("#detalhe-conteudo").addEventListener(
      "click",
      tratarCliqueDetalhe
    );
  }


  /* ================================================================
     ABAS / NAVEGAÇÃO
     ================================================================ */

  function abrirAba(nome) {
    estado.abaAtual = nome;

    estado.ideiaSelecionada = null;
    estado.pessoaSelecionada = null;

    const secoes = [
      "mural",
      "grupos",
      "relatorios",
      "notificacoes",
      "pessoa",
      "detalhe"
    ];

    secoes.forEach(id => {
      const elemento = document.getElementById(id);

      if (elemento) {
        elemento.classList.add("escondido");
      }
    });

    const secao = document.getElementById(nome);

    if (secao) {
      secao.classList.remove("escondido");
    }

    document.querySelectorAll(".aba").forEach(aba => {
      aba.classList.remove("ativa");
    });

    const aba = document.getElementById(`aba-${nome}`);

    if (aba) {
      aba.classList.add("ativa");
    }

    if (nome === "mural") {
      renderizarMural();
    }

    if (nome === "grupos") {
      renderizarGrupos();
    }

    if (nome === "relatorios") {
      renderizarRelatorio();
    }

    if (nome === "notificacoes") {
      renderizarNotificacoes();
    }
  }


  function abrirPerfil(id) {
    const pessoa = pessoaPorId(id);

    if (!pessoa) return;

    estado.pessoaSelecionada = pessoa.id;

    [
      "mural",
      "grupos",
      "relatorios",
      "notificacoes",
      "detalhe"
    ].forEach(idSecao => {
      document.getElementById(idSecao)?.classList.add("escondido");
    });

    $("#pessoa").classList.remove("escondido");

    document.querySelectorAll(".aba").forEach(aba => {
      aba.classList.remove("ativa");
    });

    renderizarPerfil(pessoa);
  }


  function abrirDetalhe(id) {
    const ideia = ideiaPorId(id);

    if (!ideia) return;

    estado.ideiaSelecionada = ideia.id;

    [
      "mural",
      "grupos",
      "relatorios",
      "notificacoes",
      "pessoa"
    ].forEach(idSecao => {
      document.getElementById(idSecao)?.classList.add("escondido");
    });

    $("#detalhe").classList.remove("escondido");

    document.querySelectorAll(".aba").forEach(aba => {
      aba.classList.remove("ativa");
    });

    renderizarDetalhe(ideia);
  }


  /* ================================================================
     PESSOAS / CURSOS
     ================================================================ */

  function preencherPessoas() {
    const select = $("#quem");

    select.innerHTML = estado.dados.pessoas
      .map(pessoa => `
        <option value="${pessoa.id}">
          ${escapeHTML(pessoa.nome)}
        </option>
      `)
      .join("");

    select.value = String(estado.pessoaAtual);
  }


  function preencherCursos() {
    const select = $("#filtro-curso");

    const cursos = [
      ...new Set(
        estado.dados.pessoas
          .map(pessoa => pessoa.curso)
          .filter(Boolean)
      )
    ].sort();

    select.innerHTML = `
      <option value="">Todos os cursos</option>
      ${cursos
        .map(curso => `
          <option value="${escapeHTML(curso)}">
            ${escapeHTML(curso)}
          </option>
        `)
        .join("")}
    `;

    select.value = estado.curso;
  }


  function pessoaAtual() {
    return pessoaPorId(estado.pessoaAtual);
  }


  /* ================================================================
     MURAL
     ================================================================ */

  function renderizarMural() {
    const container = $("#cartoes");

    let ideias = [...estado.dados.ideias];

    const busca = normalizar(estado.busca);

    if (busca) {
      ideias = ideias.filter(ideia => {

        const autor = pessoaPorId(ideia.autor);

        const texto = [
          ideia.titulo,
          ideia.resumo,
          ...(ideia.tags || []),
          autor?.nome || "",
          autor?.curso || ""
        ]
          .map(normalizar)
          .join(" ");

        return texto.includes(busca);
      });
    }


    if (estado.curso) {
      ideias = ideias.filter(ideia => {
        const autor = pessoaPorId(ideia.autor);

        return autor && autor.curso === estado.curso;
      });
    }


    ideias.sort((a, b) => {

      if (estado.ordenacao === "antigas") {
        return String(a.data).localeCompare(String(b.data));
      }

      if (estado.ordenacao === "interessados") {
        return quantidadeInteressados(b) - quantidadeInteressados(a);
      }

      if (estado.ordenacao === "paradas") {
        return String(a.data).localeCompare(String(b.data));
      }

      return String(b.data).localeCompare(String(a.data));
    });


    $("#contagem").textContent =
      `${ideias.length} ideia${ideias.length === 1 ? "" : "s"}`;


    renderizarFiltroAtivo();


    if (!ideias.length) {
      container.innerHTML = `
        <div class="mensagem-vazia">
          Nenhuma ideia encontrada.
        </div>
      `;

      return;
    }


    container.innerHTML = ideias
      .map(renderizarCartao)
      .join("");
  }


  function renderizarCartao(ideia) {
    const autor = pessoaPorId(ideia.autor);

    const interesses = quantidadeInteressados(ideia);

    const atual = Number(estado.pessoaAtual);

    const demonstrouInteresse =
      listaInteressados(ideia).includes(atual);

    const podeExcluir =
      Number(ideia.autor) === atual;


    const estadoIdeia = descobrirEstado(ideia);

    const parada = ideiaEstaParada(ideia);


    return `
      <article class="cartao">

        <span class="badge-estado ${estadoIdeia.classe}">
          ${estadoIdeia.nome}
        </span>

        ${parada
          ? `<span class="badge-parada">parada</span>`
          : ""
        }

        <h3>
          ${escapeHTML(ideia.titulo)}
        </h3>

        <div class="autoria">
          por
          <button
            class="autor-link"
            data-acao="perfil"
            data-id="${ideia.autor}"
          >
            ${escapeHTML(autor?.nome || "Pessoa desconhecida")}
          </button>
          · ${escapeHTML(autor?.curso || "")}
          · ${formatarData(ideia.data)}
        </div>


        <p class="resumo">
          ${escapeHTML(ideia.resumo)}
        </p>


        <div class="tags">
          ${(ideia.tags || [])
            .map(tag => `
              <span
                class="etiqueta"
                data-acao="tag"
                data-tag="${escapeHTML(tag)}"
              >
                ${escapeHTML(tag)}
              </span>
            `)
            .join("")}
        </div>


        <div class="rodape">

          <button
            class="interesse ${demonstrouInteresse ? "ativo" : ""}"
            data-acao="interesse"
            data-id="${ideia.id}"
          >
            ${demonstrouInteresse
              ? "✓ Tenho interesse"
              : "Tenho interesse"
            }
          </button>


          <button
            class="apoiar"
            data-acao="apoiar"
            data-id="${ideia.id}"
          >
            Apoiar
          </button>


          <span class="apoios">
            ${ideia.apoios || 0} apoio${ideia.apoios === 1 ? "" : "s"}
          </span>


          ${interesses > 0
            ? `
              <button
                class="botao-secundario"
                data-acao="detalhe"
                data-id="${ideia.id}"
              >
                ${interesses} interessado${interesses === 1 ? "" : "s"}
              </button>
            `
            : ""
          }


          <button
            class="botao-secundario"
            data-acao="detalhe"
            data-id="${ideia.id}"
          >
            Ver ideia
          </button>


          ${podeExcluir
            ? `
              <button
                class="excluir"
                data-acao="excluir"
                data-id="${ideia.id}"
              >
                Excluir
              </button>
            `
            : ""
          }

        </div>

      </article>
    `;
  }


  function renderizarFiltroAtivo() {
    const elemento = $("#filtro-ativo");

    const filtros = [];

    if (estado.busca) {
      filtros.push(
        `buscando por "${escapeHTML(estado.busca)}"`
      );
    }

    if (estado.curso) {
      filtros.push(
        `curso: ${escapeHTML(estado.curso)}`
      );
    }


    if (!filtros.length) {
      elemento.innerHTML = "";
      return;
    }


    elemento.innerHTML = `
      ${filtros.join(" · ")}
      <button
        class="botao-secundario"
        data-acao="limpar-filtros"
      >
        Limpar
      </button>
    `;
  }


  /* ================================================================
     ESTADOS DAS IDEIAS
     ================================================================ */

  function descobrirEstado(ideia) {
    const data = new Date(`${ideia.data}T12:00:00`);
    const hoje = new Date();

    const dias =
      Math.floor(
        (hoje - data) / (1000 * 60 * 60 * 24)
      );


    if (dias >= 45) {
      return {
        nome: "semente",
        classe: "estado-semente"
      };
    }

    if ((ideia.apoios || 0) >= 8) {
      return {
        nome: "proposta",
        classe: "estado-proposta"
      };
    }

    return {
      nome: "germinando",
      classe: "estado-germinando"
    };
  }


  function ideiaEstaParada(ideia) {
    const data = new Date(`${ideia.data}T12:00:00`);
    const hoje = new Date();

    const dias =
      Math.floor(
        (hoje - data) / (1000 * 60 * 60 * 24)
      );

    return dias >= 30 && (ideia.apoios || 0) < 3;
  }


  /* ================================================================
     INTERESSE
     ================================================================ */

  function chaveInteressados(ideiaId) {
    return String(ideiaId);
  }


  function listaInteressados(ideia) {
    return estado.interessados[chaveInteressados(ideia.id)] || [];
  }


  function quantidadeInteressados(ideia) {
    return listaInteressados(ideia).length;
  }


  function alternarInteresse(id) {
    const ideia = ideiaPorId(id);

    if (!ideia) return;

    const pessoa = pessoaAtual();

    if (!pessoa) return;

    const chave = chaveInteressados(id);

    if (!estado.interessados[chave]) {
      estado.interessados[chave] = [];
    }

    const lista = estado.interessados[chave];

    const posicao = lista.indexOf(pessoa.id);


    if (posicao >= 0) {
      lista.splice(posicao, 1);

    } else {
      lista.push(pessoa.id);

      criarNotificacao(
        ideia.autor,
        `${pessoa.nome} demonstrou interesse na ideia "${ideia.titulo}".`,
        ideia.id
      );
    }

    salvar();

    renderizarMural();

    if (estado.ideiaSelecionada === ideia.id) {
      renderizarDetalhe(ideia);
    }

    atualizarContadorNotificacoes();
  }


  /* ================================================================
     APOIO
     ================================================================ */

  function apoiarIdeia(id) {
    const ideia = ideiaPorId(id);

    if (!ideia) return;

    ideia.apoios = Number(ideia.apoios || 0) + 1;

    const pessoa = pessoaAtual();

    if (pessoa && Number(ideia.autor) !== Number(pessoa.id)) {
      criarNotificacao(
        ideia.autor,
        `${pessoa.nome} apoiou sua ideia "${ideia.titulo}".`,
        ideia.id
      );
    }

    salvar();

    renderizarMural();

    if (estado.ideiaSelecionada === ideia.id) {
      renderizarDetalhe(ideia);
    }

    atualizarContadorNotificacoes();
  }


  /* ================================================================
     PUBLICAÇÃO
     ================================================================ */

  function publicarIdeia(evento) {
    evento.preventDefault();

    const titulo = $("#titulo").value.trim();
    const resumo = $("#resumo").value.trim();
    const tagsTexto = $("#tags").value.trim();

    const erro = $("#erro-formulario");

    erro.textContent = "";


    if (!titulo) {
      erro.textContent = "Informe um título para a ideia.";
      $("#titulo").focus();
      return;
    }


    if (titulo.length < 5) {
      erro.textContent = "O título precisa ter pelo menos 5 caracteres.";
      $("#titulo").focus();
      return;
    }


    if (!resumo) {
      erro.textContent = "Escreva um resumo da ideia.";
      $("#resumo").focus();
      return;
    }


    const tags = tagsTexto
      .split(",")
      .map(tag => tag.trim().toLowerCase())
      .filter(Boolean)
      .filter(
        (tag, indice, lista) =>
          lista.indexOf(tag) === indice
      );


    const novaIdeia = {
      id: gerarId(estado.dados.ideias),
      titulo,
      resumo,
      autor: Number(estado.pessoaAtual),
      tags,
      data: obterDataHoje(),
      apoios: 0
    };


    estado.dados.ideias.push(novaIdeia);

    $("#form-ideia").reset();

    erro.textContent = "";

    salvar();

    renderizarMural();

    adicionarMensagemDados(
      "Ideia publicada com sucesso."
    );
  }


  function obterDataHoje() {
    const hoje = new Date();

    const ano = hoje.getFullYear();

    const mes = String(
      hoje.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
      hoje.getDate()
    ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  }


  /* ================================================================
     EXCLUSÃO
     ================================================================ */

  function excluirIdeia(id) {
    const ideia = ideiaPorId(id);

    if (!ideia) return;

    if (Number(ideia.autor) !== Number(estado.pessoaAtual)) {
      alert("Somente o autor pode excluir esta ideia.");
      return;
    }


    const confirmou = confirm(
      `Excluir a ideia "${ideia.titulo}"?`
    );

    if (!confirmou) return;


    estado.dados.ideias =
      estado.dados.ideias.filter(
        item => Number(item.id) !== Number(id)
      );


    delete estado.interessados[chaveInteressados(id)];

    salvar();

    renderizarMural();

    if (estado.ideiaSelecionada === Number(id)) {
      estado.ideiaSelecionada = null;
      abrirAba("mural");
    }
  }


  /* ================================================================
     GRUPOS
     ================================================================ */

  function renderizarGrupos() {
    const pessoa = pessoaAtual();

    const meusGrupos = estado.dados.grupos.filter(grupo =>
      grupo.membros.includes(Number(pessoa?.id))
    );


    $("#meus-grupos").innerHTML = `
      <strong>
        ${pessoa ? escapeHTML(pessoa.nome) : ""}
      </strong>

      <div>
        Você participa de
        <strong>${meusGrupos.length}</strong>
        grupo${meusGrupos.length === 1 ? "" : "s"}.
      </div>
    `;


    $("#lista-grupos").innerHTML =
      estado.dados.grupos.map(grupo => {

        const participando =
          grupo.membros.includes(Number(pessoa?.id));

        const nomes = grupo.membros
          .map(id => pessoaPorId(id)?.nome)
          .filter(Boolean);


        return `
          <li>

            <span class="nome">
              ${escapeHTML(grupo.nome)}
            </span>

            <span class="quantos">
              ${grupo.membros.length}
              membro${grupo.membros.length === 1 ? "" : "s"}
            </span>

            <p class="descricao">
              ${escapeHTML(grupo.descricao)}
            </p>

            <div class="membros">
              <strong>Membros:</strong>
              ${nomes
                .slice(0, 6)
                .map(escapeHTML)
                .join(", ")}

              ${nomes.length > 6
                ? ` e mais ${nomes.length - 6}`
                : ""
              }
            </div>

            <div class="grupo-acao">

              <button
                class="botao-secundario"
                data-acao="grupo"
                data-id="${grupo.id}"
              >
                ${participando
                  ? "Sair do grupo"
                  : "Entrar no grupo"
                }
              </button>

            </div>

          </li>
        `;
      }).join("");
  }


  function alternarGrupo(id) {
    const grupo = grupoPorId(id);
    const pessoa = pessoaAtual();

    if (!grupo || !pessoa) return;


    const indice =
      grupo.membros.indexOf(Number(pessoa.id));


    if (indice >= 0) {
      grupo.membros.splice(indice, 1);

      criarNotificacao(
        pessoa.id,
        `Você saiu do grupo "${grupo.nome}".`
      );

    } else {
      grupo.membros.push(Number(pessoa.id));

      criarNotificacao(
        pessoa.id,
        `Você entrou no grupo "${grupo.nome}".`
      );
    }


    salvar();

    renderizarGrupos();

    atualizarContadorNotificacoes();
  }


  /* ================================================================
     PERFIL
     ================================================================ */

  function renderizarPerfil(pessoa) {
    const ideias = estado.dados.ideias.filter(
      ideia => Number(ideia.autor) === Number(pessoa.id)
    );


    $("#perfil-conteudo").innerHTML = `

      <div class="perfil-cabecalho">

        <h2>
          ${escapeHTML(pessoa.nome)}
        </h2>

        <div class="perfil-dados">

          <div class="perfil-item">
            <small>Tipo</small>
            ${escapeHTML(pessoa.tipo)}
          </div>

          <div class="perfil-item">
            <small>Curso</small>
            ${escapeHTML(pessoa.curso)}
          </div>

          <div class="perfil-item">
            <small>Ideias publicadas</small>
            ${ideias.length}
          </div>

          <div class="perfil-item">
            <small>Interesses</small>

            <div class="interesses">
              ${(pessoa.interesses || [])
                .map(interesse => `
                  <span class="interesse-tag">
                    ${escapeHTML(interesse)}
                  </span>
                `)
                .join("")}
            </div>
          </div>

        </div>

      </div>


      <div class="perfil-ideias">

        <h3>
          Ideias de ${escapeHTML(pessoa.nome)}
        </h3>

        ${ideias.length
          ? `
            <ul class="lista-ideias-perfil">
              ${ideias.map(ideia => `
                <li>
                  <button
                    class="link-ideia"
                    data-acao="ideia"
                    data-id="${ideia.id}"
                  >
                    ${escapeHTML(ideia.titulo)}
                  </button>

                  <div>
                    ${escapeHTML(ideia.resumo)}
                  </div>
                </li>
              `).join("")}
            </ul>
          `
          : `
            <div class="mensagem-vazia">
              Esta pessoa ainda não publicou ideias.
            </div>
          `
        }

      </div>
    `;
  }


  /* ================================================================
     DETALHE DA IDEIA
     ================================================================ */

  function renderizarDetalhe(ideia) {
    const autor = pessoaPorId(ideia.autor);
    const pessoa = pessoaAtual();

    const interessados =
      listaInteressados(ideia)
        .map(id => pessoaPorId(id))
        .filter(Boolean);


    const souInteressado =
      interessados.some(
        interessado =>
          Number(interessado.id) === Number(pessoa?.id)
      );


    const souAutor =
      Number(ideia.autor) === Number(pessoa?.id);


    $("#detalhe-conteudo").innerHTML = `

      <span class="badge-estado ${descobrirEstado(ideia).classe}">
        ${descobrirEstado(ideia).nome}
      </span>

      ${ideiaEstaParada(ideia)
        ? `<span class="badge-parada">parada</span>`
        : ""
      }


      <h2>
        ${escapeHTML(ideia.titulo)}
      </h2>


      <div class="autoria">
        por

        <button
          class="autor-link"
          data-acao="perfil"
          data-id="${ideia.autor}"
        >
          ${escapeHTML(autor?.nome || "Pessoa desconhecida")}
        </button>

        · ${escapeHTML(autor?.curso || "")}
        · ${formatarData(ideia.data)}
      </div>


      <p class="detalhe-resumo">
        ${escapeHTML(ideia.resumo)}
      </p>


      <div class="tags">
        ${(ideia.tags || [])
          .map(tag => `
            <span
              class="etiqueta"
              data-acao="tag"
              data-tag="${escapeHTML(tag)}"
            >
              ${escapeHTML(tag)}
            </span>
          `)
          .join("")}
      </div>


      <div class="rodape">

        <button
          class="interesse ${souInteressado ? "ativo" : ""}"
          data-acao="interesse"
          data-id="${ideia.id}"
        >
          ${souInteressado
            ? "✓ Tenho interesse"
            : "Tenho interesse"
          }
        </button>


        <button
          class="apoiar"
          data-acao="apoiar"
          data-id="${ideia.id}"
        >
          Apoiar
        </button>


        <span class="apoios">
          ${ideia.apoios || 0}
          apoio${ideia.apoios === 1 ? "" : "s"}
        </span>

      </div>


      <div class="detalhe-interessados">

        <h3>
          Interessados
        </h3>

        ${interessados.length
          ? `
            <ul>
              ${interessados.map(interessado => `
                <li>
                  <button
                    class="autor-link"
                    data-acao="perfil"
                    data-id="${interessado.id}"
                  >
                    ${escapeHTML(interessado.nome)}
                  </button>
                </li>
              `).join("")}
            </ul>
          `
          : `
            <p>
              Ninguém demonstrou interesse ainda.
            </p>
          `
        }

      </div>


      ${souAutor
        ? `
          <div class="controles-autor">

            <label for="estado-ideia">
              Situação da ideia
            </label>

            <select id="estado-ideia">
              <option value="semente">Semente</option>
              <option value="germinando">Germinando</option>
              <option value="proposta">Proposta</option>
            </select>

            <button
              class="botao-secundario"
              data-acao="excluir-detalhe"
              data-id="${ideia.id}"
            >
              Excluir ideia
            </button>

          </div>
        `
        : ""
      }

    `;


    const selectEstado = $("#estado-ideia");

    if (selectEstado) {
      selectEstado.value =
        descobrirEstado(ideia).nome;
    }
  }


  /* ================================================================
     RELATÓRIO
     ================================================================ */

  function renderizarRelatorio() {
    const cursos = [
      ...new Set(
        estado.dados.pessoas
          .map(pessoa => pessoa.curso)
          .filter(Boolean)
      )
    ].sort();


    let totalIdeias = 0;
    let totalApoios = 0;


    const linhas = cursos.map(curso => {

      const pessoas = estado.dados.pessoas.filter(
        pessoa => pessoa.curso === curso
      );

      const ids = pessoas.map(pessoa => pessoa.id);

      const ideias = estado.dados.ideias.filter(
        ideia => ids.includes(Number(ideia.autor))
      );

      const apoios = ideias.reduce(
        (total, ideia) =>
          total + Number(ideia.apoios || 0),
        0
      );

      const interesses = ideias.reduce(
        (total, ideia) =>
          total + quantidadeInteressados(ideia),
        0
      );


      totalIdeias += ideias.length;
      totalApoios += apoios;


      return `
        <tr>

          <td>
            ${escapeHTML(curso)}
          </td>

          <td>
            ${pessoas.length}
          </td>

          <td>
            ${ideias.length}
          </td>

          <td>
            ${interesses}
          </td>

          <td>
            ${apoios}
          </td>

        </tr>
      `;
    }).join("");


    $("#relatorio-conteudo").innerHTML = `

      <table class="relatorio-tabela">

        <thead>
          <tr>
            <th>Curso</th>
            <th>Pessoas</th>
            <th>Ideias</th>
            <th>Interesses</th>
            <th>Apoios</th>
          </tr>
        </thead>

        <tbody>
          ${linhas}
        </tbody>

      </table>


      <p class="total-relatorio">
        Total: ${totalIdeias} ideias ·
        ${totalApoios} apoios
      </p>

    `;
  }


  /* ================================================================
     NOTIFICAÇÕES
     ================================================================ */

  function criarNotificacao(destinatario, texto, ideiaId = null) {
    estado.notificacoes.unshift({
      id: Date.now() + Math.random(),
      destinatario: Number(destinatario),
      texto,
      ideiaId,
      data: obterDataHora(),
      lida: false
    });
  }


  function obterDataHora() {
    const agora = new Date();

    return agora.toLocaleString(
      "pt-BR",
      {
        dateStyle: "short",
        timeStyle: "short"
      }
    );
  }


  function notificacoesDaPessoa() {
    return estado.notificacoes.filter(
      notificacao =>
        Number(notificacao.destinatario) ===
        Number(estado.pessoaAtual)
    );
  }


  function renderizarNotificacoes() {
    const lista = notificacoesDaPessoa();


    if (!lista.length) {
      $("#lista-notificacoes").innerHTML = `
        <div class="mensagem-vazia">
          Sua caixa de entrada está vazia.
        </div>
      `;

      return;
    }


    $("#lista-notificacoes").innerHTML =
      lista.map(notificacao => `
        <div
          class="notificacao ${notificacao.lida ? "" : "nao-lida"}"
          data-acao="notificacao"
          data-id="${notificacao.id}"
        >

          <div class="notificacao-texto">
            ${escapeHTML(notificacao.texto)}
          </div>

          <div class="notificacao-data">
            ${escapeHTML(notificacao.data)}
          </div>

        </div>
      `).join("");
  }


  function marcarNotificacaoComoLida(id) {
    const notificacao =
      estado.notificacoes.find(
        item => String(item.id) === String(id)
      );

    if (!notificacao) return;

    notificacao.lida = true;

    salvar();

    renderizarNotificacoes();

    atualizarContadorNotificacoes();
  }


  function marcarTodasComoLidas() {
    notificacoesDaPessoa().forEach(
      notificacao => {
        notificacao.lida = true;
      }
    );

    salvar();

    renderizarNotificacoes();

    atualizarContadorNotificacoes();
  }


  function atualizarContadorNotificacoes() {
    const naoLidas =
      notificacoesDaPessoa().filter(
        notificacao => !notificacao.lida
      ).length;


    $("#contador-notificacoes").textContent =
      naoLidas > 0 ? naoLidas : "";
  }


  /* ================================================================
     EXPORTAÇÃO
     ================================================================ */

  function exportarDados() {
    const pacote = {
      codigo: estado.dados.codigo,
      exportadoEm: new Date().toISOString(),
      dados: estado.dados,
      interessados: estado.interessados,
      notificacoes: estado.notificacoes,
      gruposParticipantes: estado.gruposParticipantes,
      pessoaAtual: estado.pessoaAtual
    };


    const conteudo =
      JSON.stringify(pacote, null, 2);

    const blob =
      new Blob(
        [conteudo],
        { type: "application/json" }
      );


    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `viveiro-${estado.dados.codigo || "dados"}.json`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);


    adicionarMensagemDados(
      "Dados exportados com sucesso."
    );
  }


  /* ================================================================
     IMPORTAÇÃO
     ================================================================ */

  function importarDados(evento) {
    const arquivo = evento.target.files[0];

    if (!arquivo) return;


    const leitor = new FileReader();


    leitor.onload = () => {

      try {

        const pacote =
          JSON.parse(leitor.result);


        const novosDados =
          pacote.dados || pacote;


        if (
          !novosDados ||
          !Array.isArray(novosDados.pessoas) ||
          !Array.isArray(novosDados.ideias) ||
          !Array.isArray(novosDados.grupos)
        ) {
          throw new Error(
            "Formato de dados inválido."
          );
        }


        estado.dados = novosDados;

        estado.interessados =
          pacote.interessados || {};

        estado.notificacoes =
          pacote.notificacoes || [];

        estado.gruposParticipantes =
          pacote.gruposParticipantes || {};

        estado.pessoaAtual =
          pacote.pessoaAtual ||
          estado.dados.pessoas[0]?.id ||
          null;


        garantirEstrutura();

        salvar();

        preencherPessoas();

        preencherCursos();

        atualizarTudo();


        adicionarMensagemDados(
          "Dados importados com sucesso."
        );

      } catch (erro) {

        console.error(erro);

        adicionarMensagemDados(
          "Não foi possível importar o arquivo."
        );
      }

      evento.target.value = "";
    };


    leitor.readAsText(arquivo);
  }


  function adicionarMensagemDados(texto) {
    const elemento = $("#mensagem-dados");

    elemento.textContent = texto;

    setTimeout(() => {
      if (elemento.textContent === texto) {
        elemento.textContent = "";
      }
    }, 4000);
  }


  /* ================================================================
     EVENTOS DINÂMICOS — MURAL
     ================================================================ */

  function tratarCliqueMural(evento) {
    const elemento =
      evento.target.closest("[data-acao]");

    if (!elemento) return;


    const acao = elemento.dataset.acao;
    const id = elemento.dataset.id;


    if (acao === "perfil") {
      abrirPerfil(Number(id));
      return;
    }


    if (acao === "detalhe") {
      abrirDetalhe(Number(id));
      return;
    }


    if (acao === "interesse") {
      alternarInteresse(Number(id));
      return;
    }


    if (acao === "apoiar") {
      apoiarIdeia(Number(id));
      return;
    }


    if (acao === "excluir") {
      excluirIdeia(Number(id));
      return;
    }


    if (acao === "tag") {
      estado.busca = elemento.dataset.tag || "";

      $("#busca").value = estado.busca;

      renderizarMural();

      return;
    }


    if (acao === "limpar-filtros") {
      limparFiltros();
    }
  }


  function limparFiltros() {
    estado.busca = "";
    estado.curso = "";

    $("#busca").value = "";
    $("#filtro-curso").value = "";

    renderizarMural();
  }


  /* ================================================================
     EVENTOS DINÂMICOS — GRUPOS
     ================================================================ */

  function tratarCliqueGrupos(evento) {
    const elemento =
      evento.target.closest("[data-acao]");

    if (!elemento) return;


    if (elemento.dataset.acao === "grupo") {
      alternarGrupo(
        Number(elemento.dataset.id)
      );
    }
  }


  /* ================================================================
     EVENTOS DINÂMICOS — NOTIFICAÇÕES
     ================================================================ */

  function tratarCliqueNotificacao(evento) {
    const elemento =
      evento.target.closest("[data-acao]");

    if (!elemento) return;


    if (elemento.dataset.acao !== "notificacao") {
      return;
    }


    const notificacao =
      estado.notificacoes.find(
        item =>
          String(item.id) ===
          String(elemento.dataset.id)
      );


    if (!notificacao) return;


    marcarNotificacaoComoLida(
      notificacao.id
    );


    if (notificacao.ideiaId) {
      const ideia =
        ideiaPorId(notificacao.ideiaId);

      if (ideia) {
        abrirDetalhe(ideia.id);
      }
    }
  }


  /* ================================================================
     EVENTOS DINÂMICOS — PERFIL
     ================================================================ */

  function tratarCliquePerfil(evento) {
    const elemento =
      evento.target.closest("[data-acao]");

    if (!elemento) return;


    if (elemento.dataset.acao === "ideia") {
      abrirDetalhe(
        Number(elemento.dataset.id)
      );
    }
  }


  /* ================================================================
     EVENTOS DINÂMICOS — DETALHE
     ================================================================ */

  function tratarCliqueDetalhe(evento) {
    const elemento =
      evento.target.closest("[data-acao]");

    if (!elemento) return;


    const acao = elemento.dataset.acao;
    const id = Number(elemento.dataset.id);


    if (acao === "perfil") {
      abrirPerfil(id);
      return;
    }


    if (acao === "interesse") {
      alternarInteresse(id);
      return;
    }


    if (acao === "apoiar") {
      apoiarIdeia(id);
      return;
    }


    if (acao === "excluir-detalhe") {
      excluirIdeia(id);
      return;
    }


    if (acao === "tag") {
      estado.busca = elemento.dataset.tag || "";

      $("#busca").value = estado.busca;

      abrirAba("mural");
    }
  }


  /* ================================================================
     ATUALIZAÇÃO GERAL
     ================================================================ */

  function atualizarTudo() {
    preencherPessoas();
    preencherCursos();

    $("#busca").value = estado.busca;
    $("#filtro-curso").value = estado.curso;
    $("#ordenacao").value = estado.ordenacao;

    renderizarMural();
    renderizarGrupos();
    renderizarRelatorio();
    renderizarNotificacoes();

    atualizarContadorNotificacoes();

    $("#base").textContent =
      `base ${estado.dados.codigo || "V-C"}`;
  }


  /* ================================================================
     INICIALIZAÇÃO
     ================================================================ */

  document.addEventListener(
    "DOMContentLoaded",
    iniciar
  );

})();
