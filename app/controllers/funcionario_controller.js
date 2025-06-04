import {
  login,
  getAllFuncionario,
  getOneFuncionario,
  postFuncionario,
  deleteFuncionario,
  updateFuncionario
} from '../db/queries/funcionario.js'

let novoFuncionario = {
  "data_criacao": "2025-04-29T02:36:24.868Z",
  "nome": "Reryson Santos Andrade",
  "login": "rsa@rsa.com",
  "senha": "12341234",
  "tipo": "funcionario"
}

let funcAtualizado = {
  "id": 3,
  "nome": "Marcos Henrique",
  "login": "m@m.com",
  "senha": "12341234",
  "tipo": "funcionario"
}

class FuncionarioController {
    async login(req, res){
      try{
        const credenciais = req.body
        const response = await login(credenciais)
        return res.status(200).json(response.rows[0])
      } catch(error){
        console.error(error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }
    }

    async create(req, res){
      try{
        const novoFuncionario = req.body
        const id = await postFuncionario(novoFuncionario)
        if(id){
          return res.status(201).json({message: 'Funcionário criado com sucesso', id: id})
        } else {
          return res.status(400).json({message: 'Erro ao criar funcionário'})
        }
      } catch(error){
        console.error(error);
        if(error.code === '23505'){
          return res.status(500).json({ message: 'Violação de chave única: '+error.detail });
        } else if(error.code === 'FUN002'){ 
          return res.status(400).json({ message: 'Erro: Objeto para POST de funcionario está incorreto'})
        } else {
          return res.status(500).json({ message: 'Erro interno do servidor' });
        }
        
      }
    }

    async getOne(req, res){
      try{
        const id = req.params.id
        const response = await getOneFuncionario(id)
        if(response.rowCount !== 0){
          return res.status(200).json(response.rows[0])
        } else {
          return res.status(404).json({ message: 'Erro ao buscar funcionário: funcionário não existe'})
        }
      } catch(error){
        console.error(error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }
    }
    
    async getAll(req, res){
      try{
        const listaFuncionarios = await getAllFuncionario()
        return res.status(200).json(listaFuncionarios)
      } catch(error){
        console.error(error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }
    }

    async update(req, res){
      try{
        const funcionarioAtualizado = req.body
        const response = await updateFuncionario(funcionarioAtualizado)
        
        if(response.rowCount !== 0){
          return res.status(200).json({message: 'Funcionário atualizado com sucesso!'})
        } else {
          return res.status(404).json({message: 'Erro ao atualizar funcionário: funcionário não existe'})
        }
      } catch(error){
        console.error(error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }
    }

    async delete(req, res){
      try{
        const id = req.params.id
        const response = await deleteFuncionario(id)
        if(response.rowCount !== 0){
          return res.status(200).json({message: 'Funcionário deletado com sucesso!'})
        } else {
          return res.status(404).json({message: 'Erro ao deletar funcionário: funcionário não existe'})
        }
      } catch(error){
        console.error(error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }
    }
}

export default new FuncionarioController()