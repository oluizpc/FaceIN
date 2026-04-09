from pydantic import BaseModel, ConfigDict, model_validator
from typing import Optional
from uuid import UUID
from datetime import datetime


class ResponsavelCreate(BaseModel):
    nome:           str
    parentesco:     Optional[str] = None
    telefone:       Optional[str] = None
    email:          Optional[str] = None
    notif_whatsapp: bool = True
    notif_email:    bool = False
    aceite_lgpd:    bool = False

    @model_validator(mode="after")
    def validar_contatos(self):
        if self.notif_whatsapp and not self.telefone:
            raise ValueError("Telefone obrigatório quando notificação WhatsApp está ativa")
        if self.notif_email and not self.email:
            raise ValueError("Email obrigatório quando notificação por email está ativa")
        return self


class ResponsavelUpdate(BaseModel):
    nome:           Optional[str] = None
    parentesco:     Optional[str] = None
    telefone:       Optional[str] = None
    email:          Optional[str] = None
    notif_whatsapp: Optional[bool] = None
    notif_email:    Optional[bool] = None


class ResponsavelResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id:             UUID
    aluno_id:       UUID
    nome:           str
    parentesco:     Optional[str] = None
    telefone:       Optional[str] = None
    email:          Optional[str] = None
    notif_whatsapp: bool
    notif_email:    bool
    aceite_lgpd:    bool
    aceite_lgpd_em: Optional[datetime] = None
    criado_em:      datetime