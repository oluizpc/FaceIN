from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.escola_schema import EscolaCreate, EscolaUpdate, EscolaResponse
from app.schemas.aluno_schema import AlunoResponse
from app.services.escola_service import escola_service
from app.services.aluno_service import aluno_service
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/escolas", tags=["Escolas"], dependencies=[Depends(get_current_user)])


@router.get("/", response_model=list[EscolaResponse])
def listar_escolas(db: Session = Depends(get_db)):
    return escola_service.listar(db)


@router.get("/{escola_id}", response_model=EscolaResponse)
def buscar_escola(escola_id: UUID, db: Session = Depends(get_db)):
    return escola_service.buscar_por_id(db, escola_id)


@router.get("/{escola_id}/alunos", response_model=list[AlunoResponse])
def listar_alunos_da_escola(escola_id: UUID, db: Session = Depends(get_db)):
    escola_service.buscar_por_id(db, escola_id)
    return aluno_service.listar(db, escola_id=escola_id)


@router.post("/", response_model=EscolaResponse, status_code=status.HTTP_201_CREATED)
def criar_escola(dados: EscolaCreate, db: Session = Depends(get_db)):
    return escola_service.criar(db, dados)


@router.put("/{escola_id}", response_model=EscolaResponse)
def atualizar_escola(escola_id: UUID, dados: EscolaUpdate, db: Session = Depends(get_db)):
    return escola_service.atualizar(db, escola_id, dados)


@router.delete("/{escola_id}", status_code=status.HTTP_204_NO_CONTENT)
def desativar_escola(escola_id: UUID, db: Session = Depends(get_db)):
    escola_service.desativar(db, escola_id)
