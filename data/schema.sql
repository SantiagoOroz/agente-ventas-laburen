DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS products;

-- 1. Tabla de Productos (Adaptada para el CSV provisto)
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,         -- Combinaremos Tipo + Color + Talla
    description TEXT,
    price REAL,                 -- Usaremos PRECIO_50_U
    stock INTEGER,
    category TEXT,              -- Extra del CSV: Deporte, Casual, etc.
    raw_data TEXT               -- JSON extra por si el agente necesita más contexto
);

-- 2. Tabla de Carritos (Requisito del PDF)
CREATE TABLE carts (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active' -- Extra útil: active, completed, abandoned
);

-- 3. Tabla de Items del Carrito (Requisito del PDF)
CREATE TABLE cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cart_id TEXT,
    product_id TEXT,
    qty INTEGER,
    FOREIGN KEY (cart_id) REFERENCES carts(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);