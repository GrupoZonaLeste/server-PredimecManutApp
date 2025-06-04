import { query } from '../connection.js'

let postLoginTemplate = {
  "login": "",
  "senha": ""
}

let postObjectTemplate = {
  "data_criacao": "",
  "nome": "",
  "login": "",
  "senha": "",
  "tipo": ""
}

let updateObjectTemplate = {
  "id": 0,
  "nome": "",
  "login": "",
  "senha": "",
  "tipo": ""
}

function haveSameKeys(obj1, obj2){
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every(key => keys2.includes(key));
}

export async function login(loginObj){
  if(!haveSameKeys(loginObj, postLoginTemplate)){
    const error = new Error('Erro: Objeto para POST de login está incorreto')
    error.code = 'FUN003'
    throw error
  }

  let queryConferirCredenciais = 
    `SELECT id, nome, tipo, login, senha FROM funcionario 
    WHERE login = $1 AND senha = $2`
  let values = [loginObj.login, loginObj.senha]

  try{
    const res_conferirCred = await query(queryConferirCredenciais, values)
    return res_conferirCred
  } catch(err){
    console.error('Erro executando query: ', err)
    throw err
  }

}

export async function getAllFuncionario(){
  let querySelectAllFuncionario = 
    "SELECT * FROM funcionario"

  try{
    const res = await query(querySelectAllFuncionario)
    return res.rows
  } catch(err){
    console.error('Erro executando query: ', err)
    throw err
  }
}

export async function getOneFuncionario(id){
  let querySelectCliente = 
    `SELECT * FROM funcionario WHERE id = $1`;

  try{
    const res_selectCliente = await query(querySelectCliente, [id])
    return res_selectCliente
  } catch(err){
    console.error('Erro executando query: ', err)
    throw err
  }
}

export async function postFuncionario(funcionarioObj) {
  
  if(!haveSameKeys(funcionarioObj, postObjectTemplate)){
    const error = new Error('Erro: Objeto para POST de funcionario está incorreto')
    error.code = 'FUN002'
    throw error
  }

  let queryInsertFuncionario =
    `INSERT INTO funcionario(data_criacao, nome, login, senha, tipo) 
      VALUES ($1, $2, $3, $4, $5) RETURNING id`;
  let values = [
    funcionarioObj.data_criacao, 
    funcionarioObj.nome,
    funcionarioObj.login,
    funcionarioObj.senha,
    funcionarioObj.tipo  
  ]

  try{
    let res = await query(queryInsertFuncionario, values)
    return res.rows[0].id
  } catch(err){
    if(err.code === '23505'){
      console.error('Erro excutando query: ', err.detail)
    } else {
      console.error('Erro executando query: ', err)
    }
    throw err
  }
}

export async function updateFuncionario(funcionarioObj) {
  if(!haveSameKeys(funcionarioObj, updateObjectTemplate)){
    console.error('Objeto para UPDATE de funcionario está incorreto')
    return
  }

  let queryUpdateFuncionario = 
    "UPDATE funcionario SET nome = $1, login = $2, senha = $3, tipo = $4 WHERE id = $5";
  let values = [
    funcionarioObj.nome,
    funcionarioObj.login,
    funcionarioObj.senha,
    funcionarioObj.tipo,
    funcionarioObj.id
  ]

  try{
    let res = await query(queryUpdateFuncionario, values)
    return res
  } catch(err) {
    console.error('Erro executando query: ', err)
    throw err
  }
}

export async function deleteFuncionario(id){
  let queryDeleteFuncionario =
    "DELETE FROM funcionario WHERE id = $1"
  let values = [id]

  try{
    let res = await query(queryDeleteFuncionario, values);
    return res
  } catch(err) {
    console.error('Erro executando query: ', err)
    throw err
  }
}