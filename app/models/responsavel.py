import uuid

from sqlalchemy import TIMESTAMP, UUID, Boolean, Column, ForeignKey, String, func
from app.core.database import Base

class Responsavel(Base):
    __tablename__ = "responsaveis"
    idresponsavel = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    idaluno = Column(UUID(as_uuid=True), ForeignKey("alunos.idaluno"), nullable=False)
    nome = Column(String(200), nullable=False)
    parentesco = Column(String(50))
    telefone = Column(String(20))
    email = Column(String(255))
    notif_whatsapp = Column(Boolean, default=True)
    notif_email = Column(Boolean, default=False)
    criado_em = Column(TIMESTAMP, default=func.now())
    atualizado_em = Column(TIMESTAMP, default=func.now(), onupdate=func.now());