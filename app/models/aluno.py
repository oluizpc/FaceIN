import uuid

from sqlalchemy import TIMESTAMP, UUID, Boolean, Column, String, func
from app.core.database import Base

class Aluno(Base):
    __tablename__ = "alunos"
    idaluno = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String(200), nullable=False)
    turma = Column(String(20), nullable=False)
    matricula = Column(String(50), unique=True)
    ativo = Column(Boolean, default=True)
    criado_em = Column(TIMESTAMP, default=func.now())
    atualizado_em = Column(TIMESTAMP, default=func.now(), onupdate=func.now ());
            