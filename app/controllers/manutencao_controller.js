import {
  getDadosRelatorio,
  getOneManutencao,
  getAllManutencao,
  getManutencoesRecentes,
  postManutencao,
  deleteManutencao
} from '../db/queries/manutencao.js'

let novaManutencao = {
  "data_criacao": "2025-04-29T02:36:24.868Z",
  "cliente_id": 1,
  "funcionario_id": 1
}

class ManutencaoController {
  async getRelatorio(req, res){
    try{
      const id = req.params.id;
      const response_obj = await getDadosRelatorio(id)
      return JSON.stringify(response_obj)
    } catch(error){
      console.log(error)
      if(error.code == "MAN003"){
        return res.status(404).json({ message: 'Erro ao buscar dados do relatório: manutenção não existe'})
      } else {
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }
    }
  }

  async create(req, res){
    try{
      const novaManutencao = req.body
      const id = await postManutencao(novaManutencao)
      if(id){
        return res.status(201).json({ message: 'Manutenção criada com sucesso!', id: id})
      } else {
        return res.status(400).json({ message: 'Erro ao criar Manutenção'})
      }
    } catch(error){
      console.error(error);
      if(error.code === 'MAN002'){
        return res.status(400).json({ message: 'Erro: Objeto para POST de manutenção está incorreto'})
      } else {
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }
    }
  }
  
  async getOne(req, res){
    try{
      const id = req.params.id
      const response_obj = await getOneManutencao(id)
      return res.status(200).json(response_obj)
    } catch(error){
      console.error(error);
      if(error.code == "MAN001"){
        return res.status(404).json({ message: 'Erro ao buscar manutenção: manutenção não existe'})
      } else {
        return res.status(500).json({ message: 'Erro interno do servidor' });
      } 
    }
  }

  async getRecent(req, res){
    try{
      const listaManutencoesRecentes = await getManutencoesRecentes()
      return res.status(200).json(listaManutencoesRecentes)
    } catch(error){
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async getAll(req, res){
    try{
      const listaManutencoes = await getAllManutencao()
      return res.status(200).json(listaManutencoes)
    } catch(error){
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
  //async update(req, res){}

  async delete(req, res){
    try{
      const id = req.params.id
      const response = await deleteManutencao(id);

      if(response.rowCount !== 0){
        return res.status(200).json({ message: 'Manutenção deletada com sucesso!' })
      } else {
        return res.status(404).json({ message: 'Erro ao deletar manutenção: manutenção não existe'})
      }
    } catch(error){ 
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

export default new ManutencaoController()