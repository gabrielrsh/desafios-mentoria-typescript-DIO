// A ideia dessa atividade é criar um aplicativo que: 
//    - Busca filmes
//    - Apresenta uma lista com os resultados pesquisados
//    - Permite a criação de listas de filmes e a posterior adição de filmes nela

// Todas as requisições necessárias para as atividades acima já estão prontas, mas a implementação delas ficou pela metade (não vou dar tudo de graça).
// Atenção para o listener do botão login-button que devolve o sessionID do usuário
// É necessário fazer um cadastro no https://www.themoviedb.org/ e seguir a documentação do site para entender como gera uma API key https://developers.themoviedb.org/3/getting-started/introduction

var apiKey = 'd7198fc36e4e5404427d6748f108ca4b';
let requestToken: string;
let username: string;
let password: string;
let sessionId: string;
let listId: string;
let nomeLista: string;
let descricao: string = "";
let movieId: string;

let loginButton = document.getElementById('login-button') as HTMLButtonElement;
let searchButton = document.getElementById('search-button') as HTMLButtonElement;
let searchContainer = document.getElementById('search-container');
let inputSearch = document.getElementById('search') as HTMLInputElement;
let containerLista = document.getElementById('container-lista') as HTMLDivElement;
let createListButton = document.getElementById('btn-criar-lista') as HTMLButtonElement;
let addMovieButton = document.getElementById('btn-add-filme') as HTMLButtonElement;

interface Filme {
    adult: boolean;
    backdrop_path: string;
    genre_ids: Array<Number>;
    id: number;
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
}

interface ListaFilme {
  page:number;
  results: Array<Filme>;
  total_pages: number;
  total_results: number;
}

interface ResponseRequestToken {
  success: boolean;
  expires_at: string;
  request_token: string;
}

interface ResponseSessionID {
  session_id: string;
  success: boolean;
}

addMovieButton?.addEventListener('click', async () => {
  await adicionarFilmeNaLista(movieId, listId);
})

createListButton?.addEventListener('click', async () => {
  await criarLista(nomeLista, descricao);
})

loginButton?.addEventListener('click', async () => {
  await criarRequestToken();
  await logar();
  await criarSessao();
})

searchButton?.addEventListener('click', async () => {
  let lista = document.getElementById("lista");
  if (lista) {
    lista.outerHTML = "";
  }
  let query = inputSearch?.value;
  let resultadoBusca:ListaFilme = await procurarFilme(query);
  
  console.log();
  let ul = document.createElement('ul');
  ul.id = "lista"

  for (const item of resultadoBusca.results) {
        let li = document.createElement('li');
        li.appendChild(document.createTextNode(item.original_title+" - ID:"+item.id))
        ul.appendChild(li)
  }
  
  console.log(resultadoBusca.results);
  searchContainer?.appendChild(ul);
})

function preencherSenha() {
  let inputPassword = document.getElementById('senha') as HTMLInputElement;
  password = inputPassword.value;
  validateLoginButton();
}

function preencherLogin() {
  let inputUsername = document.getElementById('login') as HTMLInputElement;  
  username = inputUsername.value;
  validateLoginButton();
}

function preencherApi() {
  let inputApiKey = document.getElementById('api-key') as HTMLInputElement;
  apiKey = inputApiKey.value;
  validateLoginButton();
}

function validateLoginButton() {
  if (password && username && apiKey) {
    loginButton.disabled = false;
  } else {
    loginButton.disabled = true;
  }
}

function validateCreateListButton(){
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
  let inputNomeLista = document.getElementById('nome-lista') as HTMLInputElement;  
  nomeLista = inputNomeLista.value;
  validateCreateListButton();
}

function preencherDescricao() {
  let inputDescricao = document.getElementById('descricao') as HTMLInputElement;
  descricao = inputDescricao.value;
}

function preencherIdLista() {
  let inputIdLista = document.getElementById('id-lista') as HTMLInputElement;  
  listId = inputIdLista.value;
  validateAddMovie();
}

function preencherIdFilme() {
  let inputIdFilme = document.getElementById('id-filme') as HTMLInputElement;  
  movieId = inputIdFilme.value;
  validateAddMovie();
}

class HttpClient {
  static async get({url="", method="", body = {} }) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open(method, url, true);

      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          resolve(JSON.parse(request.responseText));
        } else {
          reject({
            status: request.status,
            statusText: request.statusText
          })
        }
      }
      request.onerror = () => {
        reject({
          status: request.status,
          statusText: request.statusText
        })
      }
      let contexto:string = "";
      if (body) {
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        contexto = JSON.stringify(body);
      }
      request.send(contexto);
    })
  }
}

async function procurarFilme(query:string):Promise<ListaFilme> {
  query = encodeURI(query)
  console.log(query)
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`,
    method: "GET"
  }) as ListaFilme;
  
  return result;
}

async function adicionarFilme(filmeId:string) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${apiKey}&language=en-US`,
    method: "GET"
  })
  console.log(result);
}

async function criarRequestToken () {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKey}`,
    method: "GET"
  }) as ResponseRequestToken;
  requestToken = result.request_token
}

async function logar() {
  await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${apiKey}`,
    method: "POST",
    body: {
      username: `${username}`,
      password: `${password}`,
      request_token: `${requestToken}`
    }
  })
}

async function criarSessao() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
    method: "GET"
  }) as ResponseSessionID;

  sessionId = result.session_id;
  if(result.success)
    exibeCriaLista();
}

async function criarLista(nomeDaLista:string, descricao:string) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body: {
      name: nomeDaLista,
      description: descricao,
      language: "pt-br"
    }
  })
  console.log(result);
}

async function adicionarFilmeNaLista(filmeId:string, listaId:string) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body: {
      media_id: filmeId
    }
  })
  console.log(result);
}

async function pegarLista() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listId}?api_key=${apiKey}`,
    method: "GET"
  })
  console.log(result);
}