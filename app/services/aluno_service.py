# app/services/aluno_service.py
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.aluno import Aluno
from app.schemas.aluno_schema import AlunoCreate, AlunoUpdate


class AlunoService:

    def listar(self, db: Session) -> list[Aluno]:
        return db.query(Aluno).filter(Aluno.ativo == True).all()

    def buscar_por_id(self, db: Session, aluno_id: UUID) -> Aluno:
        aluno = db.query(Aluno).filter(
            Aluno.idaluno == aluno_id,
            Aluno.ativo == True
        ).first()

        if not aluno:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Aluno {aluno_id} não encontrado"
            )

        return aluno

    def criar(self, db: Session, dados: AlunoCreate) -> Aluno:
        # verifica se matricula já existe
        if dados.matricula:
            existe = db.query(Aluno).filter(
                Aluno.matricula == dados.matricula
            ).first()

            if existe:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Matrícula {dados.matricula} já cadastrada"
                )

        aluno = Aluno(**dados.model_dump())
        db.add(aluno)
        db.commit()
        db.refresh(aluno)
        return aluno

    def atualizar(self, db: Session, aluno_id: UUID, dados: AlunoUpdate) -> Aluno:
        aluno = self.buscar_por_id(db, aluno_id)

        for campo, valor in dados.model_dump(exclude_unset=True).items():
            setattr(aluno, campo, valor)

        db.commit()
        db.refresh(aluno)
        return aluno

    def desativar(self, db: Session, aluno_id: UUID) -> Aluno:
        aluno = self.buscar_por_id(db, aluno_id)
        aluno.ativo = False
        db.commit()
        return aluno


aluno_service = AlunoService()