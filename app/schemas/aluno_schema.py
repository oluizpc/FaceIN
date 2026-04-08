from pydantic import BaseModel
from typing import Optional


class AlunoCreate(BaseModel):
    nome: str
    turma: str
    matricula: str


class AlunoUpdate(BaseModel):
    nome: Optional[str] = None
    turma: Optional[str] = None
    matricula: Optional[str] = None
    ativo: Optional[bool] = None