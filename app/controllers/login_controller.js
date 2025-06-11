import { query } from "../db/connection.js";
import crypto from "crypto";

export async function login(req, res) {
  const { login, senha } = req.body;

  try {
    const result = await query(
      "SELECT id, nome, tipo FROM funcionario WHERE login = $1 AND senha = $2",
      [login, senha]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ erro: "Login ou senha inválidos" });
    }

    const funcionario = result.rows[0];
    const token = crypto.randomUUID();
    const expiraEm = new Date(Date.now() + 1000 * 60 * 60 * 730); // 730 horas === 30 dias

    await query(
      "INSERT INTO sessao(token, funcionario_id, expira_em) VALUES ($1, $2, $3)",
      [token, funcionario.id, expiraEm]
    );

    res.json({ token, funcionario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro interno no servidor" });
  }
}