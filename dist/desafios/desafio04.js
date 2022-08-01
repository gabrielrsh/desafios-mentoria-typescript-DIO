"use strict";
// A ideia dessa atividade é criar um aplicativo que: 
//    - Busca filmes
//    - Apresenta uma lista com os resultados pesquisados
//    - Permite a criação de listas de filmes e a posterior adição de filmes nela
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Todas as requisições necessárias para as atividades acima já estão prontas, mas a implementação delas ficou pela metade (não vou dar tudo de graça).
// Atenção para o listener do botão login-button que devolve o sessionID do usuário
// É necessário fazer um cadastro no https://www.themoviedb.org/ e seguir a documentação do site para entender como gera uma API key https://developers.themoviedb.org/3/getting-started/introduction
var apiKey = 'd7198fc36e4e5404427d6748f108ca4b';
let requestToken;
let username;
let password;
let sessionId;
let listId;
let nomeLista;
let descricao = "";
let movieId;
let loginButton = document.getElementById('login-button');
let searchButton = document.getElementById('search-button');
let searchContainer = document.getElementById('search-container');
let inputSearch = document.getElementById('search');
let containerLista = document.getElementById('container-lista');
let createListButton = document.getElementById('btn-criar-lista');
let addMovieButton = document.getElementById('btn-add-filme');
addMovieButton === null || addMovieButton === void 0 ? void 0 : addMovieButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    yield adicionarFilmeNaLista(movieId, listId);
}));
createListButton === null || createListButton === void 0 ? void 0 : createListButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    yield criarLista(nomeLista, descricao);
}));
loginButton === null || loginButton === void 0 ? void 0 : loginButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    yield criarRequestToken();
    yield logar();
    yield criarSessao();
}));
searchButton === null || searchButton === void 0 ? void 0 : searchButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    let lista = document.getElementById("lista");
    if (lista) {
        lista.outerHTML = "";
    }
    let query = inputSearch === null || inputSearch === void 0 ? void 0 : inputSearch.value;
    let resultadoBusca = yield procurarFilme(query);
    console.log();
    let ul = document.createElement('ul');
    ul.id = "lista";
    for (const item of resultadoBusca.results) {
        let li = document.createElement('li');
        li.appendChild(document.createTextNode(item.original_title + " - ID:" + item.id));
        ul.appendChild(li);
    }
    console.log(resultadoBusca.results);
    searchContainer === null || searchContainer === void 0 ? void 0 : searchContainer.appendChild(ul);
}));
function preencherSenha() {
    let inputPassword = document.getElementById('senha');
    password = inputPassword.value;
    validateLoginButton();
}
function preencherLogin() {
    let inputUsername = document.getElementById('login');
    username = inputUsername.value;
    validateLoginButton();
}
function preencherApi() {
    let inputApiKey = document.getElementById('api-key');
    apiKey = inputApiKey.value;
    validateLoginButton();
}
function validateLoginButton() {
    if (password && username && apiKey) {
        loginButton.disabled = false;
    }
    else {
        loginButton.disabled = true;
    }
}
function validateCreateListButton() {
    if (nomeLista)
        createListButton.disabled = false;
    else
        createListButton.disabled = true;
}
function validateAddMovie() {
    if (listId && movieId)
        addMovieButton.disabled = false;
    else
        addMovieButton.disabled = true;
}
function exibeCriaLista() {
    containerLista.style.visibility = 'visible';
    let p = document.createElement('p');
    p.innerHTML = `Logado como: ${username}`;
    containerLista.before(p);
}
function preencherNomeLista() {
    let inputNomeLista = document.getElementById('nome-lista');
    nomeLista = inputNomeLista.value;
    validateCreateListButton();
}
function preencherDescricao() {
    let inputDescricao = document.getElementById('descricao');
    descricao = inputDescricao.value;
}
function preencherIdLista() {
    let inputIdLista = document.getElementById('id-lista');
    listId = inputIdLista.value;
    validateAddMovie();
}
function preencherIdFilme() {
    let inputIdFilme = document.getElementById('id-filme');
    movieId = inputIdFilme.value;
    validateAddMovie();
}
class HttpClient {
    static get({ url = "", method = "", body = {} }) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let request = new XMLHttpRequest();
                request.open(method, url, true);
                request.onload = () => {
                    if (request.status >= 200 && request.status < 300) {
                        resolve(JSON.parse(request.responseText));
                    }
                    else {
                        reject({
                            status: request.status,
                            statusText: request.statusText
                        });
                    }
                };
                request.onerror = () => {
                    reject({
                        status: request.status,
                        statusText: request.statusText
                    });
                };
                let contexto = "";
                if (body) {
                    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    contexto = JSON.stringify(body);
                }
                request.send(contexto);
            });
        });
    }
}
function procurarFilme(query) {
    return __awaiter(this, void 0, void 0, function* () {
        query = encodeURI(query);
        console.log(query);
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`,
            method: "GET"
        });
        return result;
    });
}
function adicionarFilme(filmeId) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${apiKey}&language=en-US`,
            method: "GET"
        });
        console.log(result);
    });
}
function criarRequestToken() {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKey}`,
            method: "GET"
        });
        requestToken = result.request_token;
    });
}
function logar() {
    return __awaiter(this, void 0, void 0, function* () {
        yield HttpClient.get({
            url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${apiKey}`,
            method: "POST",
            body: {
                username: `${username}`,
                password: `${password}`,
                request_token: `${requestToken}`
            }
        });
    });
}
function criarSessao() {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
            method: "GET"
        });
        sessionId = result.session_id;
        if (result.success)
            exibeCriaLista();
    });
}
function criarLista(nomeDaLista, descricao) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/list?api_key=${apiKey}&session_id=${sessionId}`,
            method: "POST",
            body: {
                name: nomeDaLista,
                description: descricao,
                language: "pt-br"
            }
        });
        console.log(result);
    });
}
function adicionarFilmeNaLista(filmeId, listaId) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
            method: "POST",
            body: {
                media_id: filmeId
            }
        });
        console.log(result);
    });
}
function pegarLista() {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/list/${listId}?api_key=${apiKey}`,
            method: "GET"
        });
        console.log(result);
    });
}
