import uuid

from sqlalchemy import Column, String, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class Face(Base):
    __tablename__ = "faces"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    aluno_id = Column(UUID(as_uuid=True), ForeignKey("alunos.id"), nullable=False)

    embedding = Column(Text, nullable=False)  # JSON
    foto_url = Column(String, nullable=True)
    angulo = Column(String, nullable=True)
    usa_oculos = Column(Boolean, default=False)