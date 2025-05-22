import {
  getAllEquipamentos,
  getOneEquipamento,
  postEquipamento,
  updateEquipamento,
  deleteEquipamento
} from '../db/queries/equipamento.js'

let novoEquip = {
  "data_criacao": "2025-04-29T02:36:24.868Z",
  "nome": "Equipamento Teste",
  "descricao": "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo",
  "manutencao_id": 1
}

let updateEquip = {
  "id": 3,
  "nome": "Equipamento Atualizado 222",
  "descricao": "Lorem ipsum dolor",
  "trocas": [
    { "nome": "eixo"}
  ],
  "fotos": [
    { "nome": "Foto-25042025-223431", "caminho": "..."},
    { "nome": "Foto-29042025-182211", "caminho": "..."},
    { "nome": "Foto-29042025-223246", "caminho": "..."}
  ]
}


class EquipamentoController {
  async getAll(req, res){
    try{
      const listaEquipamentos = await getAllEquipamentos()
      return res.status(200).json(listaEquipamentos)
    } catch(error){
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async getOne(req, res){
    try{
      const id = req.params.id
      const response_obj = await getOneEquipamento(id)
      return res.status(200).json(response_obj)
    } catch(error){
      console.error(error);
      if(error.code == "EQP001"){
        return res.status(404).json({ message: 'Erro ao buscar equipamento: equipamento não existe'})
      } else {
        return res.status(500).json({ message: 'Erro interno do servidor' });
      } 
    }
  }

  async create(req, res) {
    try{
      const novoEquipamento = req.body
      const id = await postEquipamento(novoEquipamento)
      if(id){
        return res.status(201).json({ message: 'Equipamento criado com sucesso', id: id})
      } else {
        return res.status(400).json({ message: 'Erro ao criar equipamento' })
      }
    } catch(error){
      console.error(error);
      if(error.code === "EQP002"){
        return res.status(400).json({ message: 'Erro: Objeto para POST de equipamento está incorreto'})
      } else {
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }
    }
  }

  async update(req, res) {
    try{
      const equipamentoAtualizado = req.body
      const response = await updateEquipamento(equipamentoAtualizado)

      if(response){
        return res.status(200).json({ message: 'Equipamento atualizado com sucesso'})
      } else {
        return res.status(400).json({ message: 'Erro ao atualizar equipamento'})
      }
    } catch(error){
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
  
  
  async delete(req, res) {
    try{
      const id = req.params.id
      const response = await deleteEquipamento(id)

      if(response.rowCount !== 0){
        return res.status(200).json({message: 'Equipamento deletado com sucesso!'})
      } else {
        return res.status(404).json({message: 'Erro ao deletar equipamento: equipamento não existe'})
      }
    } catch(error){
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

export default new EquipamentoController()