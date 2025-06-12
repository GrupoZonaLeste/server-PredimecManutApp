import { Router } from "express";
import { criarSessao, deletarSessao } from '../db/sessao.js';
import { query } from '../db/connection.js'

const router = Router()

router.post('/login', async (req, res) => {
  const { login, senha } = req.body;

  try {
    const sql = `SELECT id, nome, tipo, senha FROM funcionario WHERE login = $1`;
    const result = await query(sql, [login]);

    if (result.rowCount === 0 || result.rows[0].senha !== senha) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const funcionario_obj = {
      id: result.rows[0].id,
      nome: result.rows[0].nome,
      tipo: result.rows[0].tipo,
    }

    const funcionario_id = result.rows[0].id;
    const {token, dataVencimento} = await criarSessao(funcionario_id);

    return res.status(200).json({ token: token, dataVencimento: dataVencimento, funcionario: funcionario_obj});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao realizar login' });
  }
});

router.post('/logout', async(req, res) => {
  const { token } = req.body

  try{
    await deletarSessao(token)
    return res.status(200).json({ message: 'Sessão deletada com sucesso'})
  } catch(err){
    console.error(err);
    return res.status(500).json({ message: 'Erro ao deletar sessão' });
  }
})

export default router