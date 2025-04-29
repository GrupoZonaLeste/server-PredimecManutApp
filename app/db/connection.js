import { Pool } from 'pg';
import { readFileSync } from 'fs';

// Lê o cliente.json
const cliente = JSON.parse(readFileSync('./app/db/cliente.json', 'utf-8'));

//const client = new Client(cliente);

const pool = new Pool({
  ...cliente,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000
})

export async function query(text, params) {
  const start = Date.now()

  try{
    let res;

    if(typeof params === undefined){
      res = await pool.query(text);
    } else {
      res = await pool.query(text, params);
    }
    
    const duration = Date.now() - start;
    console.log('✅ Query executada em', duration, 'ms');
    return res;
  } catch(err){
    console.error('❌ Erro na query:\n', text);
    //console.error(err);
    throw err;
  }
}

export async function transaction(callback){
  const client = await pool.connect(); // cria uma conexão exclusiva para essa transação

  try{
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')

    return result
  } catch(err){
    await client.query('ROLLBACK');
    console.error('❌ Transaction falhou, fazendo rollback.');
    throw err;
  } finally{
    client.release() // libera a conexão para o pool
  }
}

//pool.on('connect', () => console.log('🟢 Nova conexão estabelecida.'));
//pool.on('acquire', () => console.log('🟠 Conexão adquirida.'));
//pool.on('remove', () => console.log('🔴 Conexão removida.'));

export { pool };