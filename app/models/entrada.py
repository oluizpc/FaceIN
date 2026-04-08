import uuid

from sqlalchemy import TIMESTAMP, UUID, Boolean, Column, ForeignKey, Numeric, String, func
from app.core.database import Base

class Entrada(Base):
    __tablename__ = "entradas"
    identrada = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    idaluno = Column(UUID(as_uuid=True), ForeignKey("alunos.idaluno"), nullable=False)
    foto_url = Column(String(500))          
    confianca = Column(Numeric(5, 4))          # Armazena a confiança como string
    notificado = Column(Boolean, default=False)     
    registrado_em = Column(TIMESTAMP, default=func.now());