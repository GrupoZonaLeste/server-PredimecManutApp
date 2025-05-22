router.post('/login', async (req, res) => {
  const { login, senha } = req.body;

  try {
    const sql = `SELECT id, senha FROM funcionario WHERE login = $1`;
    const result = await query(sql, [login]);

    if (result.rowCount === 0 || result.rows[0].senha !== senha) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const funcionario_id = result.rows[0].id;
    const token = await criarSessao(funcionario_id);

    return res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao realizar login' });
  }
});
