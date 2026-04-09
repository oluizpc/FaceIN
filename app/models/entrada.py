import uuid
from sqlalchemy import TIMESTAMP, Boolean, Column, ForeignKey, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Entrada(Base):
    __tablename__ = "entradas"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    aluno_id      = Column(UUID(as_uuid=True), ForeignKey("alunos.id"), nullable=False)
    foto_url      = Column(String(500), nullable=True)
    confianca     = Column(Numeric(5, 4), nullable=True)
    notificado    = Column(Boolean, default=False)
    registrado_em = Column(TIMESTAMP, default=func.now())

    aluno = relationship("Aluno", back_populates="entradas")