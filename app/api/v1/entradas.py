from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.entrada_schema import EntradaResponse
from app.services.entrada_service import entrada_service
from app.dependencies.auth import get_current_user, get_escola_id_filtro

router = APIRouter(prefix="/entradas", tags=["Entradas"], dependencies=[Depends(get_current_user)])


@router.get("/", response_model=list[EntradaResponse])
def listar_entradas(
    aluno_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    escola_id: Optional[UUID] = Depends(get_escola_id_filtro),
):
    return entrada_service.listar(db, aluno_id=aluno_id, escola_id=escola_id)


@router.get("/hoje", response_model=list[EntradaResponse])
def entradas_hoje(
    db: Session = Depends(get_db),
    escola_id: Optional[UUID] = Depends(get_escola_id_filtro),
):
    return entrada_service.listar_hoje(db, escola_id=escola_id)


@router.get("/{entrada_id}", response_model=EntradaResponse)
def buscar_entrada(entrada_id: UUID, db: Session = Depends(get_db)):
    return entrada_service.buscar_por_id(db, entrada_id)
