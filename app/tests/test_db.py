from app.core.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()

try:
    print("Tentando conectar no banco...")

    result = db.execute(text("SELECT 1"))
    
    print("Conexão OK!")
    print("Resultado:", result.scalar())

except Exception as e:
    print("Erro ao conectar no banco:", e)

finally:
    db.close()