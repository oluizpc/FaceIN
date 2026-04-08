# app/api/v1/alunos.py
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.aluno_schema import AlunoCreate, AlunoUpdate, AlunoResponse
from app.services.aluno_service import aluno_service

router = APIRouter(prefix="/alunos", tags=["Alunos"])


@router.get("/", response_model=list[AlunoResponse])
def listar_alunos(db: Session = Depends(get_db)):
    return aluno_service.listar(db)


@router.get("/{aluno_id}", response_model=AlunoResponse)
def buscar_aluno(aluno_id: UUID, db: Session = Depends(get_db)):
    return aluno_service.buscar_por_id(db, aluno_id)


@router.post("/", response_model=AlunoResponse, status_code=status.HTTP_201_CREATED)
def criar_aluno(dados: AlunoCreate, db: Session = Depends(get_db)):
    return aluno_service.criar(db, dados)


@router.put("/{aluno_id}", response_model=AlunoResponse)
def atualizar_aluno(aluno_id: UUID, dados: AlunoUpdate, db: Session = Depends(get_db)):
    return aluno_service.atualizar(db, aluno_id, dados)


@router.delete("/{aluno_id}", status_code=status.HTTP_204_NO_CONTENT)
def desativar_aluno(aluno_id: UUID, db: Session = Depends(get_db)):
    aluno_service.desativar(db, aluno_id)