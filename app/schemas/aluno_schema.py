from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime


class AlunoCreate(BaseModel):
    nome: str
    turma: str
    matricula: str


class AlunoUpdate(BaseModel):
    nome: Optional[str] = None
    turma: Optional[str] = None
    matricula: Optional[str] = None
    ativo: Optional[bool] = None


class AlunoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    nome: str
    turma: str
    matricula: Optional[str] = None
    ativo: bool
    criado_em: datetime