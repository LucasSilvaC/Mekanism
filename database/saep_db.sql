create database saep_db;
use saep_db;

CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    password VARCHAR(255),
    last_login TIMESTAMP NULL,
    is_superuser BOOLEAN DEFAULT FALSE,
    username VARCHAR(150) UNIQUE NOT NULL,
    first_name VARCHAR(150) DEFAULT '',
    last_name VARCHAR(150) DEFAULT '',
    email VARCHAR(254) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    is_staff BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuario (username, email, password, telefone, is_superuser)
VALUES
('admin', 'admin@empresa.com', 'admin123', '1999999999', TRUE),
('maria', 'maria@empresa.com', 'senha123', '19988887777', FALSE),
('lucas', 'lucas@empresa.com', 'senha456', '19977776666', FALSE);

CREATE TABLE categoria (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) UNIQUE NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categoria (nome, descricao)
VALUES
('Ferramentas', 'Equipamentos e ferramentas manuais'),
('Eletrônicos', 'Componentes e dispositivos eletrônicos'),
('Escritório', 'Itens para uso administrativo');

CREATE TABLE produto (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    categoria_id INTEGER NOT NULL REFERENCES categoria(id),
    quantidade DECIMAL(10,2) DEFAULT 0,
    unidade VARCHAR(2) DEFAULT 'UN',
    preco_custo DECIMAL(10,2) DEFAULT 0,
    preco_venda DECIMAL(10,2) DEFAULT 0,
    estoque_minimo DECIMAL(10,2) DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO produto 
(codigo, nome, descricao, categoria_id, quantidade, unidade, preco_custo, preco_venda, estoque_minimo)
VALUES
('FRT-001', 'Chave de Fenda', 'Chave de fenda padrão', 1, 50, 'UN', 10.00, 18.00, 10),
('ELT-002', 'Sensor de Movimento', 'Sensor infravermelho digital', 2, 20, 'UN', 25.00, 50.00, 5),
('ESC-003', 'Caderno A4', 'Caderno com 96 folhas', 3, 150, 'UN', 5.00, 12.00, 20);

CREATE TABLE movimentacao (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES produto(id),
    tipo VARCHAR(10) NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL,
    observacao TEXT,
    usuario_id INTEGER NOT NULL REFERENCES usuario(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO movimentacao (produto_id, tipo, quantidade, observacao, usuario_id)
VALUES
(1, 'ENTRADA', 20, 'Reposição de estoque', 1),
(2, 'SAIDA', 5, 'Pedido interno', 2),
(3, 'ENTRADA', 50, 'Compra mensal', 3);
