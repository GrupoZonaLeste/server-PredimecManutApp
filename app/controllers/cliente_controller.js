import { 
  getAllClientes,
  getOneCliente, 
  postCliente,
  updateCliente,
  deleteCliente 
} from '../db/queries/cliente.js'

let novoCliente = {
  "nome": "Cliente ZZZZZZ",
  "data_criacao": "2025-04-29T02:36:24.868Z"
}

let clienteAtualizado = {
  "id": 6,
  "nome": "Cliente Atualizado"
}

function haveSameKeys(obj1, obj2){
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every(key => keys2.includes(key));
}

class ClienteController {
  async create(req, res){
    try{
      const novoCliente = req.body
      const id = await postCliente(novoCliente)
      if(id){
        return res.status(201).json({ message: 'Cliente criado com sucesso', id: id})
      } else {
        return res.status(400).json({ message: 'Erro ao criar Cliente'})
      }
    } catch(error){
      console.error(error);
      if(error.code === "CLI002"){
        return res.status(400).json({ message: 'Erro: Objeto para POST de cliente está incorreto'})
      } else {
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }
    }
  }

  async getOne(req, res){
    try{
      const id = req.params.id
      const response = await getOneCliente(id)
      if(response.rowCount !== 0){
        return res.status(200).json(response.rows[0])
      } else {
        return res.status(404).json({ message: 'Erro ao buscar cliente: cliente não existe'})
      }
    } catch(error){
      console.error(error);
      if(error.code == "CLI001"){
        return res.status(404).json({ message: 'Erro ao buscar cliente: cliente não existe'})
      } else {
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }
    }
  }

  async getAll(req, res){
    try{
      const listaClientes = await getAllClientes()
      return res.status(200).json(listaClientes)
    } catch(error){
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async update(req, res){
    try{
      const clienteAtualizado = req.body
      const response = await updateCliente(clienteAtualizado)

      if(response.rowCount !== 0 ){
        return res.status(200).json({ message: 'Cliente atualizado com sucesso!'})
      } else {
        return res.status(404).json({ message: 'Erro ao atualizar cliente: cliente não existe' })
      }
    } catch(error){
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async delete(req, res){
    try{
      const id = req.params.id
      const response = await deleteCliente(id)

      if(response.rowCount !== 0){
        return res.status(200).json({ message: 'Cliente deletado com sucesso'})
      } else {
        return res.status(404).json({ message: 'Erro ao deletar cliente: cliente não existe'})
      }
    } catch(error){
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

export default new ClienteController()