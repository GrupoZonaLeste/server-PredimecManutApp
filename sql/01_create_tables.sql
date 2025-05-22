CREATE TABLE cliente(
	id SERIAL PRIMARY KEY,
	data_criacao TIMESTAMPTZ NOT NULL,
	nome VARCHAR(100) NOT NULL
);
CREATE TABLE sessao (
  id UUID PRIMARY KEY,
  funcionario_id INT REFERENCES funcionario(id) ON DELETE CASCADE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expira_em TIMESTAMPTZ NOT NULL
);
CREATE TYPE tipo_funcionario AS ENUM ('funcionario', 'admin');
CREATE TABLE funcionario(
	id SERIAL PRIMARY KEY,
	data_criacao TIMESTAMPTZ NOT NULL,
	nome VARCHAR(100) UNIQUE NOT NULL,
	login VARCHAR(255) UNIQUE NOT NULL,
	senha TEXT NOT NULL,
	tipo tipo_funcionario NOT NULL
);

CREATE TABLE manutencao(
	id SERIAL PRIMARY KEY,
	data_criacao TIMESTAMPTZ NOT NULL,
	cliente_id INT,
	funcionario_id INT,
	CONSTRAINT fk_manutencao_cliente
		FOREIGN KEY(cliente_id) REFERENCES cliente(id)
		ON DELETE CASCADE,
	CONSTRAINT fk_manutencao_funcionario
		FOREIGN KEY(funcionario_id) REFERENCES funcionario(id)
		ON DELETE CASCADE
);

CREATE TABLE equipamento(
	id SERIAL PRIMARY KEY,
	data_criacao TIMESTAMPTZ NOT NULL,
	nome VARCHAR(150) NOT NULL,
	descricao TEXT,
	manutencao_id INT,
	CONSTRAINT fk_equip_manutencao
		FOREIGN KEY(manutencao_id) REFERENCES manutencao(id)
		ON DELETE CASCADE
);

CREATE TABLE foto(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(50) UNIQUE NOT NULL,
	caminho VARCHAR(255) NOT NULL,
	equipamento_id INT,
	CONSTRAINT fk_foto_equipamento
		FOREIGN KEY(equipamento_id) REFERENCES equipamento(id)
		ON DELETE CASCADE
);

CREATE TABLE troca(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE equipamento_troca(
	equipamento_id INT,
	troca_id INT,
	CONSTRAINT fk_equipTroca_equipamento
		FOREIGN KEY(equipamento_id) REFERENCES equipamento(id)
		ON DELETE CASCADE,
	CONSTRAINT fk_equipTroca_troca
		FOREIGN KEY(troca_id) REFERENCES troca(id)
		ON DELETE CASCADE
);

/*
DROP TYPE tipo_funcionario CASCADE;
DROP TABLE equipamento_troca CASCADE;
DROP TABLE troca CASCADE;
DROP TABLE foto CASCADE;
DROP TABLE equipamento CASCADE;
DROP TABLE manutencao CASCADE;
DROP TABLE funcionario CASCADE;
DROP TABLE cliente CASCADE;
*/





