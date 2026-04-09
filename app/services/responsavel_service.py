from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.responsavel import Responsavel
from app.models.aluno import Aluno
from app.schemas.responsavel_schema import ResponsavelCreate, ResponsavelUpdate


class ResponsavelService:

    def listar_por_aluno(self, db: Session, aluno_id: UUID) -> list[Responsavel]:
        return db.query(Responsavel).filter(
            Responsavel.aluno_id == aluno_id
        ).all()

    def buscar_por_id(self, db: Session, responsavel_id: UUID) -> Responsavel:
        responsavel = db.query(Responsavel).filter(
            Responsavel.id == responsavel_id
        ).first()

        if not responsavel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Responsável {responsavel_id} não encontrado"
            )

        return responsavel

    def criar(self, db: Session, aluno_id: UUID, dados: ResponsavelCreate) -> Responsavel:
        # verifica se aluno existe
        aluno = db.query(Aluno).filter(
            Aluno.id == aluno_id,
            Aluno.ativo == True
        ).first()

        if not aluno:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Aluno {aluno_id} não encontrado"
            )

        responsavel = Responsavel(
            aluno_id       = aluno_id,
            aceite_lgpd_em = datetime.now(timezone.utc) if dados.aceite_lgpd else None,
            **dados.model_dump()
        )

        db.add(responsavel)
        db.commit()
        db.refresh(responsavel)
        return responsavel

    def atualizar(self, db: Session, responsavel_id: UUID, dados: ResponsavelUpdate) -> Responsavel:
        responsavel = self.buscar_por_id(db, responsavel_id)

        for campo, valor in dados.model_dump(exclude_unset=True).items():
            setattr(responsavel, campo, valor)

        db.commit()
        db.refresh(responsavel)
        return responsavel

    def deletar(self, db: Session, responsavel_id: UUID):
        responsavel = self.buscar_por_id(db, responsavel_id)

        # não pode deletar se for o único responsável do aluno
        total = db.query(Responsavel).filter(
            Responsavel.aluno_id == responsavel.aluno_id
        ).count()

        if total <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível remover o único responsável do aluno"
            )

        db.delete(responsavel)
        db.commit()

    def buscar_para_notificacao(self, db: Session, aluno_id: UUID) -> list[Responsavel]:
        return db.query(Responsavel).filter(
            Responsavel.aluno_id == aluno_id,
            Responsavel.aceite_lgpd == True,
            (Responsavel.notif_whatsapp == True) | (Responsavel.notif_email == True)
        ).all()


responsavel_service = ResponsavelService()