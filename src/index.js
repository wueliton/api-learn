const express = require('express'); //Importa plugin Express
const cors = require('cors');
const { uuid, isUuid } = require("uuidv4"); //Complemento para gerar ID único

const app = express(); //Inicia aplicação utilizando o Express

app.use(cors());
app.use(express.json()); //Sempre no inicio da aplicação - Converte o corpo da requisição para json

/**
 * Métodos HTTP:
 * 
 * GET: Buscar informações do back-end
 * POST: Criar uma informação
 * PUT/PATCH: Alterar informação
 * DELETE: Excluir uma informação
 */

 /**
  * Tipos de parâmetros:
  * 
  * Query Params: Filtros e Paginação
  * Route Params: Identificar recursos (Atualizar/Deletar)
  * Request Body: Conteúdo na hora de criar ou editar um recurso (JSON)
  */

  /**
   * Middleware: (São todas as rotas)
   * 
   * Interceptador de requisições que pode interromper totalmente a requisição ou alterar dados da requisição.
   * Utilizado também para validação de dados.
   * Quando desejar executar uma função em uma rota específica ou em todas.
   */

const projects = [];

function logRequests(request, response, next) { //Middleware sempre recebe os dois parametros, o terceiro é opcional
  const { method, url } = request;

  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.time(logLabel); //Mede o tempo de um console até o próximo

  next(); //Chamar próximo middleware, se não for chamada, ela interrompe a leitura do script.

  console.timeEnd(logLabel); //Executa após o próximo método chamado
}

function validateProjectId(request, response, next) {
    const { id } = request.params;

    if(!isUuid(id)) {
      return response.status(400).json({ error: 'Invalid Project ID.' });
    }

    return next();
}

app.use(logRequests);
app.use('/projects/:id', validateProjectId); //Chamar Middleware por rota

app.get('/', (request, response)=> {
  return response.json({ message: 'Hello World' });
});

app.get('/projects', logRequests, (request, response)=> {
  const { title } = request.query;
  
  const results = title
   ? projects.filter(project => project.title.includes(title))
   : projects;

  return response.json(results);
});

app.post('/projects', (request, response)=> {
  const {title, owner} = request.body;

  const project = { id: uuid(), title, owner };

  projects.push(project); //Adicionar item ao array

  return response.json(project);
});

app.put('/projects/:id', validateProjectId, (request, response)=> {
  const {id} = request.params;
  const {title, owner} = request.body;

  const projectIndex =projects.findIndex(project => project.id === id);//Encontra o índice do projeto

  if(projectIndex < 0) {
    return response.status(400).json({ error: 'Project not found.'});
  }

  const project = {
    id,
    title,
    owner,
  };

  projects[projectIndex] = project;

  return response.json(project);
});

app.delete('/projects/:id', validateProjectId, (request, response)=> {
  const {id} = request.params;

  const projectIndex =projects.findIndex(project => project.id === id);//Encontra o índice do projeto

  if(projectIndex < 0) {
    return response.status(400).json({ error: 'Project not found.'});
  }

  projects.splice(projectIndex, 1);

  return response.status(204).send(); //Quando resposta for nula, para validar, utilizar código 204
});

app.listen(3333, () => {
  console.log('😁 Back-end Started')
}); //Porta localhost para acessar Site
