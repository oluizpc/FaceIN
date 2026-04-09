from uuid import UUID
from datetime import datetime, date
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.entrada import Entrada
from app.models.aluno import Aluno


class EntradaService:

    def listar(self, db: Session, aluno_id: UUID = None) -> list[Entrada]:
        query = db.query(Entrada)

        if aluno_id:
            query = query.filter(Entrada.aluno_id == aluno_id)

        return query.order_by(Entrada.registrado_em.desc()).all()

    def listar_hoje(self, db: Session) -> list[Entrada]:
        hoje = date.today()
        return db.query(Entrada).filter(
            Entrada.registrado_em >= datetime.combine(hoje, datetime.min.time()),
            Entrada.registrado_em <= datetime.combine(hoje, datetime.max.time())
        ).order_by(Entrada.registrado_em.desc()).all()

    def buscar_por_id(self, db: Session, entrada_id: UUID) -> Entrada:
        entrada = db.query(Entrada).filter(Entrada.id == entrada_id).first()

        if not entrada:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Entrada {entrada_id} não encontrada"
            )

        return entrada

    def ja_entrou_hoje(self, db: Session, aluno_id: UUID) -> bool:
        hoje = date.today()
        entrada = db.query(Entrada).filter(
            Entrada.aluno_id == aluno_id,
            Entrada.registrado_em >= datetime.combine(hoje, datetime.min.time()),
            Entrada.registrado_em <= datetime.combine(hoje, datetime.max.time())
        ).first()

        return entrada is not None

    def registrar(
        self,
        db: Session,
        aluno_id: UUID,
        confianca: float,
        foto_url: str = None
    ) -> Entrada | None:

        # regra — não registra duplicata no mesmo dia
        if self.ja_entrou_hoje(db, aluno_id):
            return None

        entrada = Entrada(
            aluno_id  = aluno_id,
            confianca = confianca,
            foto_url  = foto_url
        )

        db.add(entrada)
        db.commit()
        db.refresh(entrada)
        return entrada

    def marcar_notificado(self, db: Session, entrada_id: UUID) -> Entrada:
        entrada = self.buscar_por_id(db, entrada_id)
        entrada.notificado = True
        db.commit()
        return entrada


entrada_service = EntradaService()