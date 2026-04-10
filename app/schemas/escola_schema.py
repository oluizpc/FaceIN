from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime


class EscolaCreate(BaseModel):
    nome: str
    cnpj: Optional[str] = None
    endereco: Optional[str] = None
    telefone: Optional[str] = None


class EscolaUpdate(BaseModel):
    nome: Optional[str] = None
    cnpj: Optional[str] = None
    endereco: Optional[str] = None
    telefone: Optional[str] = None
    ativo: Optional[bool] = None


class EscolaResumo(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    nome: str


class EscolaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    nome: str
    cnpj: Optional[str] = None
    endereco: Optional[str] = None
    telefone: Optional[str] = None
    ativo: bool
    criado_em: datetime
