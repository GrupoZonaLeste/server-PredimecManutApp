export async function autenticarSessao(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ message: 'Token de sessão ausente' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Formato inválido de token' });
    }

    const token = parts[1];

    const sql = `SELECT funcionario_id FROM sessao WHERE id = $1 AND expira_em > NOW()`;
    const result = await query(sql, [token]);

    if (result.rowCount === 0) {
      return res.status(401).json({ message: 'Sessão inválida ou expirada' });
    }

    req.funcionario_id = result.rows[0].funcionario_id;
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao autenticar sessão' });
  }
}
