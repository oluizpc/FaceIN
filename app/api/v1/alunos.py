from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.aluno_schema import AlunoCreate, AlunoUpdate, AlunoResponse
from app.services.aluno_service import aluno_service
from app.dependencies.auth import get_current_user, get_escola_id_filtro
from app.models.usuario import Usuario

router = APIRouter(prefix="/alunos", tags=["Alunos"], dependencies=[Depends(get_current_user)])


@router.get("/", response_model=list[AlunoResponse])
def listar_alunos(
    escola_id: Optional[UUID] = Query(None),
    db: Session = Depends(get_db),
    filtro_escola: Optional[UUID] = Depends(get_escola_id_filtro),
):
    # operador: usa sempre a escola dele; admin: usa o query param (ou nenhum)
    escola = filtro_escola or escola_id
    return aluno_service.listar(db, escola_id=escola)


@router.get("/{aluno_id}", response_model=AlunoResponse)
def buscar_aluno(
    aluno_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    aluno = aluno_service.buscar_por_id(db, aluno_id)
    if current_user.role != "admin" and aluno.escola_id != current_user.escola_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    return aluno


@router.post("/", response_model=AlunoResponse, status_code=status.HTTP_201_CREATED)
def criar_aluno(
    dados: AlunoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    # operador só pode criar aluno na própria escola
    if current_user.role != "admin":
        dados.escola_id = current_user.escola_id
    return aluno_service.criar(db, dados)


@router.put("/{aluno_id}", response_model=AlunoResponse)
def atualizar_aluno(
    aluno_id: UUID,
    dados: AlunoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    aluno = aluno_service.buscar_por_id(db, aluno_id)
    if current_user.role != "admin" and aluno.escola_id != current_user.escola_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    return aluno_service.atualizar(db, aluno_id, dados)


@router.delete("/{aluno_id}", status_code=status.HTTP_204_NO_CONTENT)
def desativar_aluno(
    aluno_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    aluno = aluno_service.buscar_por_id(db, aluno_id)
    if current_user.role != "admin" and aluno.escola_id != current_user.escola_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    aluno_service.desativar(db, aluno_id)
