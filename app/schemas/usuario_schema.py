from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

from app.schemas.escola_schema import EscolaResumo


class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    role: str = "operador"
    escola_id: Optional[UUID] = None


class UsuarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    nome: str
    email: str
    role: str
    escola_id: Optional[UUID] = None
    escola: Optional[EscolaResumo] = None
    ativo: bool
    criado_em: datetime


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioResponse
