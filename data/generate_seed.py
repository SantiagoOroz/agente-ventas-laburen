import pandas as pd

# Nombre del archivo de entrada y salida
input_file = 'products.xlsx'
output_file = 'seed.sql'

def clean_text(text):
    """Limpia el texto y escapa las comillas simples para SQL"""
    return str(text).replace("'", "''").strip()

# Leer el archivo Excel
try:
    print(f"Leyendo el archivo {input_file}...")
    df = pd.read_excel(input_file)
    
    # Rellenar valores nulos con cadenas vacías o ceros
    df = df.fillna('')
    
    sql_statements = []
    sql_statements.append("DELETE FROM products;") # Limpiar tabla antes de insertar
    
    for index, row in df.iterrows():
        # Combinamos columnas para crear un nombre descriptivo
        # Ej: "Pantalón Verde (XXL)"
        full_name = f"{row['TIPO_PRENDA']} {row['COLOR']} ({row['TALLA']})"
        
        # Limpieza de datos
        p_id = clean_text(row['ID'])
        name = clean_text(full_name)
        desc = clean_text(row['DESCRIPCIÓN'])
        cat = clean_text(row['CATEGORÍA'])
        
        # Convertir precio (eliminando posibles comas de miles)
        price_str = str(row['PRECIO_50_U']).replace(',', '')
        price = float(price_str) if price_str else 0.0
        
        stock = int(row['CANTIDAD_DISPONIBLE']) if row['CANTIDAD_DISPONIBLE'] != '' else 0
        
        # Generar sentencia INSERT
        stmt = f"INSERT INTO products (id, name, description, price, stock, category) VALUES ('{p_id}', '{name}', '{desc}', {price}, {stock}, '{cat}');"
        sql_statements.append(stmt)

    # Guardar archivo SQL
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_statements))
        
    print(f"¡Éxito! Se generaron {len(sql_statements)-1} productos en {output_file}")

except FileNotFoundError:
    print(f"Error: No se encuentra el archivo {input_file}")
except Exception as e:
    print(f"Ocurrió un error: {e}")