import uuid

from sqlalchemy import JSON, TIMESTAMP, UUID, Boolean, Column, ForeignKey, String, func
from app.core.database import Base

class Face(Base):
    __tablename__ = "faces"
    idface = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    idaluno = Column(UUID(as_uuid=True), ForeignKey("alunos.idaluno"), nullable=False)
    embedding = Column(JSON, nullable=False)  # Armazena o embedding como string JSON
    foto_url = Column(String(500))
    angulo = Column(String(20), nullable=False)  # Armazena o ângulo como string
    usa_oculos = Column(Boolean)    
    criado_em = Column(TIMESTAMP, default=func.now());

