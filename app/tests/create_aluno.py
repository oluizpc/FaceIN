import uuid
from app.core.database import SessionLocal
from app.models.aluno import Aluno

db = SessionLocal()

print("Criando aluno...")

aluno = Aluno(
    nome="Luiz Teste",
    turma="A1",
    matricula=str(uuid.uuid4())
)

db.add(aluno)
db.commit()

print("Aluno criado com ID:", aluno.id)