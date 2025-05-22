import { query, transaction } from '../connection.js'

let postObjectTemplate = {
  "nome": "",
  "data_criacao": ""
}

let updateObjectTemplate = {
  "id": 0,
  "nome": ""
}

function haveSameKeys(obj1, obj2){
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every(key => keys2.includes(key));
}

export async function getAllClientes(){
  try{
    const res = await query('SELECT id, nome FROM cliente')
    return res.rows
  }catch(err){
    console.error('Erro executando query: ', err)
    throw err
  }
}

export async function getOneCliente(id){

  const cliente_obj = await transaction(async (client) => {
    let querySelectCliente = 'SELECT id, nome, data_criacao FROM cliente WHERE id = $1'
    const res_cliente = await client.query(querySelectCliente, [id])

    let querySelectManutencao = 'SELECT id, data_criacao FROM manutencao WHERE cliente_id = $1'
    const res_manutencao = await client.query(querySelectManutencao, [id])

    if(res_cliente.rows.length > 0){
      return {
        "id": res_cliente.rows[0].id,
        "nome": res_cliente.rows[0].nome,
        "data_criacao": res_cliente.rows[0].data_criacao,
        "manutencoes": res_manutencao.rows
      }
    } else {
      return
    }
    
  })

  if(cliente_obj){
    return cliente_obj
  } else {
    const error = new Error('Erro ao buscar cliente: cliente não existe')
    error.code = 'CLI001'
    throw error;
  }
}

export async function postCliente(clienteObj){

  if(!haveSameKeys(clienteObj, postObjectTemplate)){
    const error = new Error('Erro: Objeto para POST de cliente está incorreto')
    error.code = 'CLI002'
    throw error
  }

  let queryInsertCliente =
    "INSERT INTO cliente(data_criacao, nome) VALUES ($1, $2) RETURNING id";
  let values = [clienteObj.data_criacao, clienteObj.nome]

  try{
    let res = await query(queryInsertCliente, values)
    return res.rows[0].id
  } catch(err) {
    console.error('Erro executando query: ', err)
    throw err
  }
}

export async function updateCliente(clienteObj){
  if(!haveSameKeys(clienteObj, updateObjectTemplate)){
    console.error('Objeto para UPDATE de cliente está incorreto')
    return undefined
  }

  let queryUpdateCliente = 
    "UPDATE cliente SET nome = $1 WHERE id = $2";
  let values = [clienteObj.nome, clienteObj.id]
  
  try{
    let res = await query(queryUpdateCliente, values)
    return res
  } catch(err) {
    console.error('Erro executando query: ', err)
    throw err
  }
}

export async function deleteCliente(id){
  let queryDeleteCliente = 
    "DELETE FROM cliente WHERE id = $1";
  let values = [id]

  try{
    let res = await query(queryDeleteCliente, values)
    return res
  } catch(err){
    console.error('Erro executando query: ', err)
    throw err
  }
}