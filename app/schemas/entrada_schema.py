from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime


class EntradaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id:            UUID
    aluno_id:      UUID
    foto_url:      Optional[str] = None
    confianca:     Optional[float] = None
    notificado:    bool
    registrado_em: datetime


class EntradaFiltro(BaseModel):
    aluno_id:    Optional[UUID] = None
    data_inicio: Optional[datetime] = None
    data_fim:    Optional[datetime] = None