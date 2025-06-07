import { query, transaction } from '../connection.js'

let postObjectTemplate = {
  "data_criacao": "",
  "cliente_id": 0,
  "funcionario_id": 0
}

function haveSameKeys(obj1, obj2){
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every(key => keys2.includes(key));
}

export async function getDadosRelatorio(id){
  const dadosRelatorio = await transaction(async (client) => {
    let querySelectManutencao = 
      `SELECT m.id, m.data_criacao, c.nome as cliente, f.nome as criador 
      FROM manutencao m 
      LEFT JOIN funcionario f ON m.funcionario_id = f.id 
      LEFT JOIN cliente c ON c.id = m.cliente_id
      WHERE m.id = $1`
    const res_manutencao = await client.query(querySelectManutencao, [id])

    // SE A MANUTENÇÃO EXISTIR VAMOS BUSCAR AS FOTOS
    if(res_manutencao.rows.length > 0){
      let querySelectEquipamentos =
        `SELECT id, data_criacao, nome, descricao 
        FROM equipamento 
        WHERE manutencao_id = $1`
      const res_listaEquips = await client.query(querySelectEquipamentos, [id])

      // OBJETO DE RETORNO
      let dadosRelatorioObj = {...res_manutencao.rows[0]}

      // SE EXISTIREM EQUIPAMENTOS NA MANUTENCAO, VAMOS BUSCAR AS TROCAS E AS FOTOS DE CADA UMA
      if(res_listaEquips.rows.length > 0){
        for(let equip of res_listaEquips.rows){
          let querySelectFotos = 
            `SELECT id, nome, caminho, legenda 
            FROM foto 
            WHERE equipamento_id = $1`;
          const res_fotos = await client.query(querySelectFotos, [equip.id])

          equip.fotos = res_fotos.rows

          let querySelectTrocas = 
            `SELECT et.id, t.nome FROM equipamento_troca et 
            JOIN troca t ON et.troca_id = t.id 
            JOIN equipamento e ON et.equipamento_id = e.id 
            WHERE et.equipamento_id = $1`;
          const res_trocas = await client.query(querySelectTrocas, [equip.id])

          /* SELECIONANDO FOTOS DAS TROCAS */
          let existemTrocas = res_trocas.rows.length > 0;
          let trocas_obj = [];

          if(existemTrocas){
            const trocasPlaceholdersSelect = res_trocas.rows.map((_, index) => `$${index + 1}`).join(',');
            let querySelectFotosTrocas = 
              `SELECT id, nome, caminho, legenda, momento, grupo_id, equip_troca_id
              FROM foto_equipamento_troca
              WHERE equip_troca_id IN (${trocasPlaceholdersSelect})`;
            let selectFotosTrocas_values = res_trocas.rows.map((item) => item.id)
            const res_fotosTrocas = await client.query(querySelectFotosTrocas, selectFotosTrocas_values)

            trocas_obj = res_trocas.rows.map((item) => ({
              ...item,
              fotos: res_fotosTrocas.rows.filter(foto => foto.equip_troca_id === item.id)
            }));
          }

          equip.trocas = trocas_obj
        }

        dadosRelatorioObj.equipamentos = res_listaEquips.rows
      } else {
        dadosRelatorioObj.equipamentos = []
      }

      return dadosRelatorioObj
    } else {
      return
    }
  })

  if(dadosRelatorio){
    return dadosRelatorio
  } else {
    const error = new Error('Erro ao buscar dados de relatório: manutenção não existe')
    error.code = 'MAN003'
    throw error;
  }
}

export async function getOneManutencao(id){
  const manutencao_obj = await transaction(async (client) => {
    let querySelectManutencao = 
      `SELECT m.id, m.data_criacao, f.nome as criador 
      FROM manutencao m 
      LEFT JOIN funcionario f ON m.funcionario_id = f.id 
      WHERE m.id = $1`
    const res_manutencao = await client.query(querySelectManutencao, [id])

    let querySelectAllEquipamento =
      "SELECT id, nome, data_criacao FROM equipamento WHERE manutencao_id = $1"
    const res_equipamento = await client.query(querySelectAllEquipamento, [id])

    if(res_manutencao.rows.length > 0){
      return {
        "id": res_manutencao.rows[0].id,
        "data_criacao": res_manutencao.rows[0].data_criacao,
        "funcionario": res_manutencao.rows[0].criador,
        "equipamentos": res_equipamento.rows
      }
    } else {
      return 
    }
  })

  if(manutencao_obj){
    return manutencao_obj
  } else {
    const error = new Error('Erro ao buscar manutenção: manutenção não existe')
    error.code = 'MAN001'
    throw error;
  }
}

export async function getAllManutencao(){
  try{
    const res = await query('SELECT * FROM manutencao ORDER BY data_criacao')
    return res.rows
  }catch(err){
    console.error('Erro executando query: ', err)
    throw err
  }
}

export async function getManutencoesRecentes(){
  try{
    let selectUltimasManutencoes = 
      `SELECT m.id, m.data_criacao, c.nome, f.nome
      FROM manutencao m
      JOIN cliente c ON m.cliente_id = c.id
      JOIN funcionario f ON m.funcionario_id = f.id
      ORDER BY m.data_criacao DESC
      LIMIT 3;`;
    const res = await query(selectUltimasManutencoes)
    return res.rows
  } catch(err){
    console.error('Erro executando query: ', err)
    throw err
  }
  
}

export async function postManutencao(manutencaoObj){
  if(!haveSameKeys(manutencaoObj, postObjectTemplate)){
    const error = new Error('Erro: Objeto para POST de manutenção está incorreto')
    error.code = 'MAN002'
    throw error
  }

  let queryInsertManutencao =
    "INSERT INTO manutencao(data_criacao, cliente_id, funcionario_id) VALUES ($1, $2, $3) RETURNING id";
  let values = [
    manutencaoObj.data_criacao,
    manutencaoObj.cliente_id,
    manutencaoObj.funcionario_id
  ]

  try{
    let res = await query(queryInsertManutencao, values)
    return res.rows[0].id
  } catch(err) {
    console.error('Erro executando query: ', err)
    throw err
  }
}

export async function deleteManutencao(id){
  let queryDeleteManutencao =
    "DELETE FROM manutencao WHERE id = $1"
  let values = [id]

  try{
    let res = await query(queryDeleteManutencao, values)
    return res
  } catch(err) {
    console.error('Erro executando query: ', err)
    throw err
  }
}