import uuid

from app.core.database import SessionLocal
from app.models import Aluno

db = SessionLocal()

novo = Aluno(
    nome="Luiz",
    turma="ADS",
    matricula=str(uuid.uuid4())  # sempre único
)

db.add(novo)
db.commit()

print("ID do aluno:", novo.id)

db.close()