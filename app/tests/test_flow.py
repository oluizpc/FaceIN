import uuid
from app.core.database import SessionLocal
from app.models.aluno import Aluno
from app.models.face import Face

db = SessionLocal()

print("=== INÍCIO DO TESTE ===")

# 1. Criar aluno
aluno = Aluno(
    nome="Fluxo Teste",
    turma="A1",
    matricula=str(uuid.uuid4())
)

db.add(aluno)
db.commit()

print("Aluno criado:", aluno.id)

# 2. Criar face fake (sem câmera só pra testar DB)
face = Face(
    aluno_id=aluno.id,
    embedding="[0.1, 0.2, 0.3]",
    foto_url="foto.jpg"
)

db.add(face)
db.commit()

print("Face vinculada com sucesso!")

print("=== FIM DO TESTE ===")
