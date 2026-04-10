from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

from app.schemas.escola_schema import EscolaResumo


class AlunoCreate(BaseModel):
    escola_id: UUID
    nome: str
    turma: str
    matricula: str


class AlunoUpdate(BaseModel):
    escola_id: Optional[UUID] = None
    nome: Optional[str] = None
    turma: Optional[str] = None
    matricula: Optional[str] = None
    ativo: Optional[bool] = None


class AlunoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    escola_id: Optional[UUID] = None
    escola: Optional[EscolaResumo] = None
    nome: str
    turma: str
    matricula: Optional[str] = None
    ativo: bool
    criado_em: datetime