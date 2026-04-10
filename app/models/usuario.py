import uuid

from sqlalchemy import TIMESTAMP, Boolean, Column, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from sqlalchemy.orm import relationship


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    escola_id = Column(UUID(as_uuid=True), ForeignKey("escolas.id"), nullable=True)
    nome = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False, unique=True)
    senha_hash = Column(String(200), nullable=False)
    role = Column(String(20), nullable=False, default="operador")  # admin | operador
    ativo = Column(Boolean, default=True)
    criado_em = Column(TIMESTAMP, default=func.now())

    escola = relationship("Escola")
