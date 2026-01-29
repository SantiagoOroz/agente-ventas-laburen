import pandas as pd

# Nombre del archivo de entrada y salida
input_file = 'products.xlsx'
output_file = 'seed.sql'

def clean_text(text):
    """Limpia el texto y escapa las comillas simples para SQL"""
    return str(text).replace("'", "''").strip()

try:
    print(f"Leyendo el archivo {input_file}...")
    df = pd.read_excel(input_file)
    
    # Rellenar valores nulos
    df = df.fillna('')
    
    sql_statements = []
    sql_statements.append("DELETE FROM products;") 
    
    count = 0
    for index, row in df.iterrows():
        # 1. Datos Crudos
        p_id = clean_text(row['ID'])
        p_type = clean_text(row['TIPO_PRENDA'])
        p_size = clean_text(row['TALLA'])
        p_color = clean_text(row['COLOR'])
        desc = clean_text(row['DESCRIPCIÓN'])
        
        # 2. Generar un Nombre Compuesto (Ayuda a la IA a identificar el producto rápido)
        full_name = f"{p_type} - {p_color} ({p_size})"
        
        # 3. Limpieza de Precio
        price_str = str(row['PRECIO_50_U']).replace(',', '')
        price = float(price_str) if price_str else 0.0
        
        # 4. Stock
        stock = int(row['CANTIDAD_DISPONIBLE']) if row['CANTIDAD_DISPONIBLE'] != '' else 0
        
        # 5. Booleano Disponible (Sí/No -> 1/0)
        is_active = 1 if row['DISPONIBLE'].strip().lower() in ['sí', 'si', 'yes'] else 0
        
        # Solo insertamos si tiene ID válido
        if p_id:
            stmt = f"INSERT INTO products (id, name, type, size, color, description, price, stock, is_active) VALUES ('{p_id}', '{full_name}', '{p_type}', '{p_size}', '{p_color}', '{desc}', {price}, {stock}, {is_active});"
            sql_statements.append(stmt)
            count += 1

    # Guardar archivo SQL
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_statements))
        
    print(f"¡Éxito! Se generaron {count} productos en {output_file}")
    print("Ahora ejecuta: wrangler d1 execute laburen-shop-db --file=schema.sql --remote")
    print("Y luego:       wrangler d1 execute laburen-shop-db --file=seed.sql --remote")

except FileNotFoundError:
    print(f"Error: No se encuentra el archivo {input_file}")
except Exception as e:
    print(f"Ocurrió un error: {e}")