from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.escola import Escola
from app.schemas.escola_schema import EscolaCreate, EscolaUpdate


class EscolaService:

    def listar(self, db: Session, apenas_ativas: bool = True) -> list[Escola]:
        query = db.query(Escola)
        if apenas_ativas:
            query = query.filter(Escola.ativo == True)
        return query.all()

    def buscar_por_id(self, db: Session, escola_id: UUID) -> Escola:
        escola = db.query(Escola).filter(Escola.id == escola_id).first()
        if not escola:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Escola {escola_id} não encontrada"
            )
        return escola

    def criar(self, db: Session, dados: EscolaCreate) -> Escola:
        if dados.cnpj:
            existe = db.query(Escola).filter(Escola.cnpj == dados.cnpj).first()
            if existe:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"CNPJ {dados.cnpj} já cadastrado"
                )
        escola = Escola(**dados.model_dump())
        db.add(escola)
        db.commit()
        db.refresh(escola)
        return escola

    def atualizar(self, db: Session, escola_id: UUID, dados: EscolaUpdate) -> Escola:
        escola = self.buscar_por_id(db, escola_id)
        for campo, valor in dados.model_dump(exclude_unset=True).items():
            setattr(escola, campo, valor)
        db.commit()
        db.refresh(escola)
        return escola

    def desativar(self, db: Session, escola_id: UUID) -> Escola:
        escola = self.buscar_por_id(db, escola_id)
        escola.ativo = False
        db.commit()
        return escola


escola_service = EscolaService()
