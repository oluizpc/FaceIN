import uuid
from sqlalchemy import TIMESTAMP, Boolean, Column, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Responsavel(Base):
    __tablename__ = "responsaveis"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    aluno_id       = Column(UUID(as_uuid=True), ForeignKey("alunos.id"), nullable=False)
    nome           = Column(String(200), nullable=False)
    parentesco     = Column(String(50), nullable=True)
    telefone       = Column(String(20), nullable=True)
    email          = Column(String(255), nullable=True)
    notif_whatsapp = Column(Boolean, default=True)
    notif_email    = Column(Boolean, default=False)
    criado_em      = Column(TIMESTAMP, default=func.now())
    atualizado_em  = Column(TIMESTAMP, default=func.now(), onupdate=func.now())
    aceite_lgpd    = Column(Boolean, default=False, nullable=False)
    aceite_lgpd_em = Column(TIMESTAMP, nullable=True)  # quando aceitou

    aluno = relationship("Aluno", back_populates="responsaveis")