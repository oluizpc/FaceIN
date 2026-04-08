# create_tables.py

from app.core.database import Base, engine
from app.models import *

print("Criando tabelas...")
Base.metadata.create_all(bind=engine)
print("OK")