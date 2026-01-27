DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS products;

CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT,          -- Ej: "Pantalón - Verde (M)" (Útil para mostrar en chat)
    type TEXT,          -- TIPO_PRENDA
    size TEXT,          -- TALLA
    color TEXT,         -- COLOR
    description TEXT,   -- DESCRIPCIÓN
    price REAL,         -- PRECIO_50_U
    stock INTEGER,      -- CANTIDAD_DISPONIBLE
    is_active BOOLEAN   -- DISPONIBLE (1 o 0)
);

CREATE TABLE carts (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active'
);

CREATE TABLE cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cart_id TEXT,
    product_id TEXT,
    qty INTEGER,
    FOREIGN KEY (cart_id) REFERENCES carts(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);