# app/api/v1/responsaveis.py
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.responsavel_schema import ResponsavelCreate, ResponsavelUpdate, ResponsavelResponse
from app.services.responsavel_service import responsavel_service

router = APIRouter(prefix="/responsaveis", tags=["Responsáveis"])


@router.get("/aluno/{aluno_id}", response_model=list[ResponsavelResponse])
def listar_por_aluno(aluno_id: UUID, db: Session = Depends(get_db)):
    return responsavel_service.listar_por_aluno(db, aluno_id)


@router.get("/{responsavel_id}", response_model=ResponsavelResponse)
def buscar_responsavel(responsavel_id: UUID, db: Session = Depends(get_db)):
    return responsavel_service.buscar_por_id(db, responsavel_id)


@router.post("/aluno/{aluno_id}", response_model=ResponsavelResponse, status_code=status.HTTP_201_CREATED)
def criar_responsavel(aluno_id: UUID, dados: ResponsavelCreate, db: Session = Depends(get_db)):
    return responsavel_service.criar(db, aluno_id, dados)


@router.put("/{responsavel_id}", response_model=ResponsavelResponse)
def atualizar_responsavel(responsavel_id: UUID, dados: ResponsavelUpdate, db: Session = Depends(get_db)):
    return responsavel_service.atualizar(db, responsavel_id, dados)


@router.delete("/{responsavel_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_responsavel(responsavel_id: UUID, db: Session = Depends(get_db)):
    responsavel_service.deletar(db, responsavel_id)