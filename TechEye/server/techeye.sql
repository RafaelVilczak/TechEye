##drop database techeye;
CREATE DATABASE techeye;
USE techeye;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  senha VARCHAR(100)
);

CREATE TABLE licencas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100),
  modelo_aquisicao VARCHAR(50), -- Permanente / Recorrente
  data_aquisicao DATE,
  periodo_renovacao INT,
  empresa VARCHAR(100),
  tipo_software VARCHAR(100)
);

CREATE TABLE equipamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100),
  usuario VARCHAR(100),
  licenca_id INT,
  memoria_ram VARCHAR(50),
  processador VARCHAR(100),
  armazenamento VARCHAR(100),
  data_aquisicao DATE,
  status VARCHAR(20),
  FOREIGN KEY (licenca_id) REFERENCES licencas(id)
);

CREATE TABLE equipamentos_licencas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipamento_id INT,
  licenca_id INT,
  FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id),
  FOREIGN KEY (licenca_id) REFERENCES licencas(id)
);

CREATE TABLE manutencoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipamento_id INT,
  tecnico VARCHAR(100),
  tipo VARCHAR(50), -- Preventiva / Corretiva
  status VARCHAR(50), -- Entrada, Analise, Manutenção, Concluido
  data_inicio DATE,
  data_fim DATE,
  descricao VARCHAR(300),
  status_anterior VARCHAR(20),
  FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id)
);