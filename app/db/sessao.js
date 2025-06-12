import { v4 as uuidv4 } from 'uuid';
import { query } from './connection.js'; 

export async function criarSessao(funcionario_id) {
  const token = uuidv4(); // token opaco
  const expiraEm = new Date(Date.now() + 8766 * 60 * 60 * 1000); // 8766 horas === 1 ano

  const sql = `INSERT INTO sessao (id, funcionario_id, expira_em) VALUES ($1, $2, $3)`;
  await query(sql, [token, funcionario_id, expiraEm]);

  return { token: token, dataVencimento: expiraEm };
}

export async function deletarSessao(token) {
  const sql = `DELETE FROM sessao WHERE id = $1`;
  let res = await query(sql, [token]);
}