from pydantic import BaseModel
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
    id: UUID
    nome: str
    turma: str
    matricula: Optional[str] = None
    ativo: bool
    criado_em: datetime

    class Config:
        from_attributes = True