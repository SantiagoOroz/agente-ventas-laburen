
import pandas as pd

try:
    df = pd.read_excel('products.xlsx')
    print("Columns:", df.columns.tolist())
except Exception as e:
    print(e)
