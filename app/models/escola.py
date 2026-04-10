import uuid

from sqlalchemy import TIMESTAMP, Boolean, Column, String, func
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from sqlalchemy.orm import relationship


class Escola(Base):
    __tablename__ = "escolas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String(200), nullable=False)
    cnpj = Column(String(18), unique=True, nullable=True)
    endereco = Column(String(500), nullable=True)
    telefone = Column(String(20), nullable=True)
    ativo = Column(Boolean, default=True)
    criado_em = Column(TIMESTAMP, default=func.now())
    atualizado_em = Column(TIMESTAMP, default=func.now(), onupdate=func.now())

    alunos = relationship("Aluno", back_populates="escola")
