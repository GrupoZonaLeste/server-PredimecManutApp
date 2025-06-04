import { query, transaction } from '../connection.js'

let postObjectTemplate = {
  "data_criacao": "",
  "nome": "",
  "descricao": "",
  "manutencao_id": 0
}

let updateObjectTemplate = {
  "id": 0,
  "nome": "",
  "descricao": "",
  "trocas": [],
  "fotos": []
}

let updateFotosObjectTemplate = {
  "nome": "",
  "caminho": "",
  "legenda": "",
  "momento": "",
  "grupo_id": ""
}

function haveSameKeys(obj1, obj2){
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every(key => keys2.includes(key));
}

function areObjectsTheSame(obj1, obj2){
  let string_obj1 = JSON.stringify(obj1)
  let string_obj2 = JSON.stringify(obj2)

  return string_obj1 === string_obj2
}

function isObjectInArray(obj1, arr){
  let found = false;

  arr.forEach((item) => {
    if(areObjectsTheSame(obj1, item)){
      found = true;
      return    
    }
  })

  return found;
}

export async function getAllEquipamentos(){
  try{
    const res = await query('SELECT * FROM equipamento')
    return res.rows
  } catch(err){
    console.error('Erro executando query: ', err)
    throw err
  }
}

export async function getOneEquipamento(id){
  const equipamento_obj = await transaction(async (client) => {
    let querySelectEquipamento = 
      "SELECT id, data_criacao, nome, descricao FROM equipamento WHERE id = $1";
    const res_equipamento = await client.query(querySelectEquipamento, [id])

    let querySelectFotos = 
      "SELECT id, nome, caminho, legenda FROM foto WHERE equipamento_id = $1";
    const res_fotos = await client.query(querySelectFotos, [id])

    let querySelectTrocas = 
      `SELECT et.id, t.nome FROM equipamento_troca et 
      JOIN troca t ON et.troca_id = t.id 
      JOIN equipamento e ON et.equipamento_id = e.id 
      WHERE et.equipamento_id = $1`;
    const res_trocas = await client.query(querySelectTrocas, [id])

    /* SELECIONANDO FOTOS DAS TROCAS */
    const trocasPlaceholdersSelect = res_trocas.rows.map((_, index) => `$${index + 1}`).join(',');
    let querySelectFotosTrocas = 
      `SELECT id, nome, caminho, legenda, momento, grupo_id, equip_troca_id
      FROM foto_equipamento_troca
      WHERE equip_troca_id IN (${trocasPlaceholdersSelect})`;
    let selectFotosTrocas_values = res_trocas.rows.map((item) => item.id)
    const res_fotosTrocas = await client.query(querySelectFotosTrocas, selectFotosTrocas_values)

    let trocas_obj = res_trocas.rows.map((item) => ({
      ...item,
      fotos: res_fotosTrocas.rows.filter(foto => foto.equip_troca_id === item.id)
    }));

    if(res_equipamento.rows.length > 0){
      return {
        "id": res_equipamento.rows[0].id,
        "data_criacao": res_equipamento.rows[0].data_criacao,
        "nome": res_equipamento.rows[0].nome,
        "descricao": res_equipamento.rows[0].descricao,
        "trocas": trocas_obj,
        "fotos": res_fotos.rows
      }
    } else {
      return
    }
  })

  if(equipamento_obj){
    return equipamento_obj
  } else {
    const error = new Error('Erro ao buscar equipamento: equipamento não existe')
    error.code = 'EQP001'
    throw error;
  }
}

export async function postEquipamento(equipamentoObj){
  if(!haveSameKeys(equipamentoObj, postObjectTemplate)){
    const error = new Error('Erro: Objeto para POST de equipamento esta incorreto')
    error.code = 'EQP002'
    throw error
  }

  let queryInsertEquipamento = 
    `INSERT INTO equipamento(data_criacao, nome, descricao, manutencao_id) 
    VALUES ($1, $2, $3, $4) 
    RETURNING id`
  let values = [
    equipamentoObj.data_criacao,
    equipamentoObj.nome,
    equipamentoObj.descricao,
    equipamentoObj.manutencao_id
  ]

  try{
    let res = await query(queryInsertEquipamento, values)
    return res.rows[0].id;
  } catch(err){
    console.error('Erro executando query: ', err)
    throw err
  }
}

export async function deleteEquipamento(id){
  let queryDeleteEquipamento =
    `DELETE FROM equipamento WHERE id = $1`;
  
  try{
    const res = await query(queryDeleteEquipamento, [id])
    return true
  } catch(err) {
    console.error('Erro executando query: ', err)
    throw err
  }
}

/* ATUALIZACAO DE EQUIPAMENTO */

/* funções usadas dentro do updateEquipamento */
async function atualizarDadosEquipamento(client, equipamentoObj){
  let queryUpdateEquip = 
    `UPDATE equipamento
    SET
      nome = CASE WHEN nome IS DISTINCT FROM $1 THEN $1 ELSE nome END,
      descricao = CASE WHEN descricao IS DISTINCT FROM $2 THEN $2 ELSE descricao END
    WHERE id = $3`;
  let updateEquipValues = [
    equipamentoObj.nome,
    equipamentoObj.descricao,
    equipamentoObj.id
  ]
  const res_updateEquip = await client.query(queryUpdateEquip, updateEquipValues)
  return res_updateEquip
}

async function inserirNovasTrocas(client, equipamentoObj){
  // VERIFICANDO QUAIS TROCAS JA EXISTEM
  let querySelectTrocas =
    `SELECT nome FROM troca`;
  const res_selectTroca = await client.query(querySelectTrocas)

  let listaNovasTrocas = equipamentoObj.trocas.map((item) => item.nome);
  let listaTrocasExistentes = res_selectTroca.rows.map((item) => item.nome)

  listaNovasTrocas =  listaNovasTrocas.filter(item => !listaTrocasExistentes.includes(item));

  /* ADICIONANDO TROCAS QUE NÃO EXISTEM AINDA */
  const trocasPlaceholdersInsert = listaNovasTrocas.map((_, index) => `($${index + 1})`).join(',');
  // trocasPlaceholders = [($1), ($2), ($3), ...]

  if(listaNovasTrocas.length > 0){
    let queryInsertTrocas = 
      `INSERT INTO troca(nome)
      VALUES ${trocasPlaceholdersInsert}`;
    let insertTrocasValues = listaNovasTrocas
    
    const res_insertTrocas = await client.query(queryInsertTrocas, insertTrocasValues)
    return res_insertTrocas;
  }
}

async function selectIdTrocas(client, equipamentoObj){
  /* SELECIONANDO OS IDs DAS TROCAS FEITAS PARA ADICIONAR NA TABELA RELACIONAMENTO */
  const trocasPlaceholdersSelect = equipamentoObj.trocas.map((_, index) => `$${index + 1}`).join(',');
  
  let querySelectTrocas = 
    `SELECT id FROM troca
    WHERE nome IN (${trocasPlaceholdersSelect})`;
  let selectTrocasValues = equipamentoObj.trocas.map((item) => item.nome)
  
  const res_selectTrocas = await client.query(querySelectTrocas, selectTrocasValues)
  return res_selectTrocas;
}

async function atualizarEquipTrocasAntigas(client, listaNovasTrocas, equipamentoObj){
  // Selecionar quais valores da tabela 'equipamento_troca' já existem no banco
  let querySelectEquipTrocas = 
    `SELECT troca_id FROM equipamento_troca
    WHERE equipamento_id = $1`
  const res_selectEquipTrocas = await client.query(querySelectEquipTrocas, [equipamentoObj.id])
  let listaEquipTrocasIDs = res_selectEquipTrocas.rows.map((item) => item.troca_id)

  // deletar os registros onde o campo 'troca_id' não está na lista 'listaNovasTrocas'
  const trocasPlaceholders = listaNovasTrocas.map((_, index) => `$${index + 1}`).join(',');
  const ultimaPosicao = parseInt(listaNovasTrocas.length) + 1

  if(listaNovasTrocas.length > 0){
    let queryDeleteEquipTrocas = 
      `DELETE FROM equipamento_troca
      WHERE equipamento_id = ${`$`+ultimaPosicao}
      AND troca_id NOT IN (${trocasPlaceholders})`
    let deleteTrocasValues = [...listaNovasTrocas, equipamentoObj.id]
    const res_deleteEquipTrocas = await client.query(queryDeleteEquipTrocas, deleteTrocasValues)
  }

  // Insert dos troca_id novos que ainda não existem nessa tabela
  let listaEquipTrocasNovas = listaNovasTrocas.filter((item) => !listaEquipTrocasIDs.includes(item))

  const insertPlaceholders = listaEquipTrocasNovas.map((_, index) => {
    let nextIndex = (index+1) * 2
    return `($${nextIndex-1}, $${nextIndex})`
  }).join(',')

  let listaEquipTrocasInsert = []
  listaEquipTrocasNovas.forEach((item) => {
    listaEquipTrocasInsert.push(equipamentoObj.id)
    listaEquipTrocasInsert.push(item)
  })

  if(listaEquipTrocasInsert.length > 0){
    let queryInsertEquipTroca = 
      `INSERT INTO equipamento_troca(equipamento_id, troca_id)
      VALUES ${insertPlaceholders}`
    const res_insertEquipTrocas = await client.query(queryInsertEquipTroca, listaEquipTrocasInsert)
    return res_insertEquipTrocas
  }

}

async function atualizarEquipTrocasFotos(client, equipamentoObj){
  // Selecionar quais valores da tabela 'equipamento_troca' já existem no banco
  let querySelectEquipTrocas = 
    `SELECT et.id, et.troca_id, t.nome FROM equipamento_troca et
    JOIN troca t ON et.troca_id = t.id
    WHERE equipamento_id = $1`
  const res_selectEquipTrocas = await client.query(querySelectEquipTrocas, [equipamentoObj.id])

  let listaEquipTrocasComId = res_selectEquipTrocas.rows

  for(const troca of listaEquipTrocasComId){
    let objTroca = equipamentoObj.trocas.find((obj) => obj.nome === troca.nome)
    let id_troca = parseInt(troca.id)
    let fotos_validas = true

    // TESTAR SE OS OBJETOS DAS FOTOS ESTÃO CORRETOS
    objTroca.fotos.forEach((foto) => {
      if(!haveSameKeys(foto, updateFotosObjectTemplate)){
        fotos_validas = false 
        console.log('ERRO, FOTOS EM FORMATO ERRADO')
      }    
    })

    // SE HOUVER UM OBJETO TROCA E SUAS FOTOS ESTIVEREM COM ESTRUTURA CORRETA, VAMOS FAZER A QUERY
    if(objTroca !== null && fotos_validas){
      let listaFotos = objTroca.fotos

      // SE NÃO HOUVEREM FOTOS DA TROCA, ENTÃO FORAM REMOVIDAS. VAMOS APAGAR TODAS DO BANCO
      if(listaFotos.length === 0){
        let deleteTodasFotos =
          `DELETE FROM foto_equipamento_troca
          WHERE equip_troca_id = $1`
        const res_deleteTodasFotos = await client.query(deleteTodasFotos, [id_troca])
      }

      // SE HOUVEREM FOTOS DA TROCA, PRECISAMOS TESTAR ALGUMAS COISAS
      if(listaFotos.length > 0){
        let selectFotosDaTroca =
          `SELECT nome, caminho, legenda, momento, grupo_id 
          FROM foto_equipamento_troca
          WHERE equip_troca_id = $1`
        const res_selectFotosDaTroca = await client.query(selectFotosDaTroca, [id_troca])
        let listaFotosDaTrocaNoBanco = [...res_selectFotosDaTroca.rows]

        // VAMOS VER SE JÁ EXISTEM FOTOS DESSA TROCA NO BANCO, SE EXISTIR, PRECISAMOS TESTAR SE VAMOS EXCLUI-LAS
        if(listaFotosDaTrocaNoBanco.length > 0){
          let listaNomeFotosParaExcluir = []

          for(const foto of listaFotosDaTrocaNoBanco){
            if(!isObjectInArray(foto, listaFotos)){
              listaNomeFotosParaExcluir.push(foto.nome)
            }
          }

          // PODE SER QUE A FOTO QUE VEIO COM A TROCA JÁ EXISTA NO BANCO, MAS NÃO DEVO SER REMOVIDA
          // AQUI VERIFICAMOS SE EXISTEM FOTOS PARA SEREM REMOVIDAS
          if(listaNomeFotosParaExcluir.length > 0){
            const deletePlaceholders = listaNomeFotosParaExcluir.map((_, index) => `$${index + 1}`).join(',');

            let deleteFotosRemovidas =
              `DELETE FROM foto_equipamento_troca
              WHERE nome IN (${deletePlaceholders})`
            const res_deleteFotosRemovidas = await client.query(deleteFotosRemovidas, listaNomeFotosParaExcluir)
          }
        }

        // VAMOS PREPARAR AS FOTOS QUE SÃO NOVAS E DEVEM SER INSERIDAS NO BANCO
        // PARA ISSO, VAMOS VERIFICAR TODAS AS FOTOS QUE VIERAM COM O TROCA, SE ELAS NÃO EXISTIREM NO BANCO AINDA, VAMOS ADICONÁ-LAS
        let listaNovasFotos = []

        for(const foto of listaFotos){
          if(!isObjectInArray(foto, listaFotosDaTrocaNoBanco)){
            listaNovasFotos.push(foto)
          }
        }

        // SE HOUVEREM FOTOS NOVAS, VAMOS INSERI-LAS 
        if(listaNovasFotos.length > 0){
          let listaValoresParaInsert = []
          listaNovasFotos.forEach((foto) => {
            listaValoresParaInsert.push(foto.nome)
            listaValoresParaInsert.push(foto.caminho)
            listaValoresParaInsert.push(foto.legenda)
            listaValoresParaInsert.push(foto.momento)
            listaValoresParaInsert.push(foto.grupo_id)
            listaValoresParaInsert.push(id_troca)
          })

          const fotosPlaceholderInsert = listaNovasFotos.map((_, index) => {
            let lastIndexForRow = (index + 1) * 6
            return `($${lastIndexForRow-5}, 
                    $${lastIndexForRow-4}, 
                    $${lastIndexForRow-3}, 
                    $${lastIndexForRow-2}, 
                    $${lastIndexForRow-1}, 
                    $${lastIndexForRow})`
          }).join(', ')
        
          let insertNovasFotos =
            `INSERT INTO foto_equipamento_troca(nome, caminho, legenda, momento, grupo_id, equip_troca_id)
            VALUES ${fotosPlaceholderInsert}`
          const res_insertNovasFotos = await client.query(insertNovasFotos, listaValoresParaInsert)
        }
      }
    }
  }
}

async function atualizarFotosAntigas(client, equipamentoObj){
  let listaFotosNovas = equipamentoObj.fotos
  
  // selecionar quais fotos já existem na tabela foto:
  let querySelectFotos = 
    `SELECT nome, caminho FROM foto
    WHERE equipamento_id = $1`
  const res_selectFotos = await client.query(querySelectFotos, [equipamentoObj.id])
  let listaFotosAntigas = res_selectFotos.rows

  // deletar fotos antigas que não estão mais no equipamento
  let listaFotosParaRemover = listaFotosAntigas.filter((item) => !isObjectInArray(item, listaFotosNovas))
  let listaNomesParaRemover = listaFotosParaRemover.map((item) => item.nome)

  const fotosPlaceholderDelete = listaNomesParaRemover.map((_, index) => `$${index+1}`).join(', ')
  const ultimaPosicaoPlaceholder = parseInt(listaNomesParaRemover.length) + 1

  if(listaNomesParaRemover.length > 0){
    let queryDeleteFotos = 
      `DELETE FROM foto 
      WHERE equipamento_id = $${ultimaPosicaoPlaceholder}
      AND nome IN (${fotosPlaceholderDelete})`
    let deleteFotosValues = [...listaNomesParaRemover, equipamentoObj.id]
    const res_deleteFotos = await client.query(queryDeleteFotos, deleteFotosValues)
  }

  /*
    AQUI TEMOS QUE INSERIR O CÓDIGO PARA EXCLUIR A FOTO DO STORAGE
  */

  // inserir fotos novas que ainda não estão na tabela
  let listaFotosParaAdicionar = listaFotosNovas.filter((item) => !isObjectInArray(item, listaFotosAntigas))
  const fotosPlaceholderInsert = listaFotosParaAdicionar.map((_, index) => {
    let lastIndexForRow = (index + 1) * 3
    return `($${lastIndexForRow-2}, $${lastIndexForRow-1}, $${lastIndexForRow})`
  }).join(', ')

  /*
    PARA ISSO FUNCIONAR A FOTO PRECISA SER ADICIONADA NO STORAGE APÓS SER TIRADA, 
    ASSIM O CAMINHO DA FOTO JÁ FICA SALVO NO OBJETO DE UPDATE, QUE SERÁ INSERIDO NA TABELA LOGO ABAIXO
  */

  let listaFotosParaInsert = []
  listaFotosParaAdicionar.forEach((item) => {
    listaFotosParaInsert.push(item.nome)
    listaFotosParaInsert.push(item.caminho)
    listaFotosParaInsert.push(equipamentoObj.id)
  }) 

  if(listaFotosParaInsert.length > 0){
    let queryInsertFotos = 
      `INSERT INTO foto(nome, caminho, equipamento_id)
      VALUES ${fotosPlaceholderInsert}`
    const res_insertFotos = await client.query(queryInsertFotos, listaFotosParaInsert) 
  }
  
}

/* função principal */
export async function updateEquipamento(equipamentoObj){
  if(!haveSameKeys(equipamentoObj, updateObjectTemplate)){
    console.error('O Objeto para UPDATE da manutenção está incorreto!')
    return
  }

  const success = await transaction(async (client) => {

    // Atualiza os dados da tabela 'equipamento'
    await atualizarDadosEquipamento(client, equipamentoObj)
    
    // Adiciona nomes de trocas que não existiam ainda na tabela 'troca'
    await inserirNovasTrocas(client, equipamentoObj)

    // Seleciona os IDs das trocas da manutenção
    const res_selectTrocas = await selectIdTrocas(client, equipamentoObj)
    let listaNovasTrocas = res_selectTrocas.rows.map((item) => item.id)

    // Deleta as trocas que não estão na lista atual e adiciona as novas trocas
    await atualizarEquipTrocasAntigas(client, listaNovasTrocas, equipamentoObj)

    // Deleta as fotos das trocas que não estão na lista atual
    await atualizarEquipTrocasFotos(client, equipamentoObj)

    // Deleta as fotos que não estão na lista atual e adiciona as novas fotos
    await atualizarFotosAntigas(client, equipamentoObj)

    return true
  })

  return success
}