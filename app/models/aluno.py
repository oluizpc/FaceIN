import uuid

from sqlalchemy import TIMESTAMP, Boolean, Column, String, func
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from sqlalchemy.orm import relationship


class Aluno(Base):
    __tablename__ = "alunos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String(200), nullable=False)
    turma = Column(String(20), nullable=False)
    matricula = Column(String(50), unique=True)
    ativo = Column(Boolean, default=True)
    criado_em = Column(TIMESTAMP, default=func.now())
    atualizado_em = Column(TIMESTAMP, default=func.now(), onupdate=func.now())

    responsaveis = relationship("Responsavel", back_populates="aluno")