INSERT INTO cliente(data_criacao, nome)
VALUES
	('2025-04-20 12:30:00-03', 'Cliente ABC'),
	('2025-04-22 11:22:34-03', 'Empresa XPTO'),
	('2025-04-23 16:55:32-03', 'Cliente XYZ');
	
-- tipo pode ser "funcionario" ou "admin"
INSERT INTO funcionario(data_criacao, nome, login, senha, tipo)
VALUES
	('2025-04-20 12:30:00-03', 'Admin', 'admin@admin.com', 'admin', 'admin'),
	('2025-04-20 13:00:00-03', 'Funcionario 01', 'abc@abc.com', '12345678', 'funcionario');

INSERT INTO manutencao(data_criacao, cliente_id, funcionario_id)
VALUES
	('2025-04-20 12:30:00-03', 1, 1),
	('2025-04-20 12:35:00-03', 1, 1),
	('2025-04-20 12:40:00-03', 2, 2);

INSERT INTO equipamento(data_criacao, nome, descricao, manutencao_id)
VALUES
	('2025-04-20 12:35:00-03', 'Equipamento X', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eu odio tellus.', 1),
	('2025-04-20 12:35:00-03', 'Equipamento Y', 'Lorem ipsum dolor sit amet', 1),
	('2025-04-20 12:35:00-03', 'Equip. A', 'Lorem ipsum dolor sit amet', 2);

INSERT INTO troca(nome)
VALUES
	('rolamento'),
	('polia'),
	('fonte');

INSERT INTO equipamento_troca(equipamento_id, troca_id)
VALUES
	(1, 1),
	(1, 2),
	(1, 3),
	(2, 1),
	(2, 3),
	(3, 3);

INSERT INTO foto_equipamento_troca(nome, caminho, legenda, momento, grupo_id, equip_troca_id)
VALUES
	('Troca-20052025-112233', '...', 'teste_legenda', 'antes', 'Eqp-1-rolamento-20052025-112233',1),
	('Troca-20052025-134433', '...', 'teste_legenda', 'depois', 'Eqp-1-rolamento-20052025-112233', 1),
	('Troca-20052025-153211', '...', 'teste_legenda', 'antes', 'Eqp-1-polia-20052025-153211', 2),
	('Troca-20052025-155522', '...', 'teste_legenda', 'depois', 'Eqp-1-polia-20052025-153211', 2),
	('Troca-20052025-171147', '...', 'teste_legenda', 'antes', 'Eqp-1-fonte-20052025-171147', 3),
	('Troca-20052025-174421', '...', 'teste_legenda', 'depois', 'Eqp-1-fonte-20052025-171147', 3);

INSERT INTO foto(nome, caminho, legenda, equipamento_id)
VALUES
	('Foto-20042025-183826', '...', 'teste_legenda', 1),
	('Foto-20042025-192216', '...', 'teste_legenda', 1),
	('Foto-20042025-213354', '...', 'teste_legenda', 2),
	('Foto-20042025-213410', '...', 'teste_legenda', 2);


		