from pydantic import BaseModel, field_validator
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

    @field_validator("telefone")
    def telefone_obrigatorio_se_whatsapp(cls, v, values):
        if values.data.get("notif_whatsapp") and not v:
            raise ValueError("Telefone obrigatório quando notificação WhatsApp está ativa")
        return v

    @field_validator("email")
    def email_obrigatorio_se_notif_email(cls, v, values):
        if values.data.get("notif_email") and not v:
            raise ValueError("Email obrigatório quando notificação por email está ativa")
        return v


class ResponsavelUpdate(BaseModel):
    nome:           Optional[str] = None
    parentesco:     Optional[str] = None
    telefone:       Optional[str] = None
    email:          Optional[str] = None
    notif_whatsapp: Optional[bool] = None
    notif_email:    Optional[bool] = None


class ResponsavelResponse(BaseModel):
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

    class Config:
        from_attributes = True