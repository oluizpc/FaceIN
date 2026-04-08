from fastapi import APIRouter
from app.core.database import SessionLocal
from app.models.aluno import Aluno
from app.schemas.aluno_schema import AlunoUpdate
from app.services.aluno_service import atualizar_aluno

router = APIRouter(prefix="/alunos", tags=["Alunos"])

@router.post("/")
def criar_aluno(nome: str, turma: str, matricula: str):
    db = SessionLocal()

    try:
        aluno = Aluno(
            nome=nome,
            turma=turma,
            matricula=matricula
        )

        db.add(aluno)
        db.commit()
        db.refresh(aluno)

        return {
            "message": "Aluno criado com sucesso",
            "id": str(aluno.idaluno)
        }

    except Exception as e:
        db.rollback()
        return {"erro": str(e)}

    finally:
        db.close()


@router.get("/")
def listar_alunos():
    db = SessionLocal()
    try:
        alunos = db.query(Aluno).all()
        return {"Alunos": alunos}
    except Exception as e:
        return {"erro": str(e)}
    finally:
        db.close()

#GET POR ID
@router.get("/{aluno_id}")
def listar_aluno_id(aluno_id: str):
    db = SessionLocal()
    try:
        aluno = db.query(Aluno).filter(Aluno.idaluno == aluno_id).first()
        if aluno:
            return {"Aluno": aluno}
        else:
            return {"message": "Aluno não encontrado"}
    except Exception as e:
        return {"erro": str(e)}
    finally:
        db.close()


#delete aluno ID
@router.delete("/{aluno_id}")
def deletar_aluno(aluno_id: str):
    db = SessionLocal()
    try:
        aluno = db.query(Aluno).filter(Aluno.idaluno == aluno_id).first()
        if aluno:
            db.delete(aluno)
            db.commit()
            return {"message": "Aluno deletado com sucesso"}
        else:
            return {"message": "Aluno não encontrado"}
    except Exception as e:
        db.rollback()
        return {"erro": str(e)}
    finally:
        db.close()

#atualizar aluno ID
@router.patch("/{aluno_id}")
def atualizar(aluno_id: str, dados: AlunoUpdate):
    db = SessionLocal()

    aluno = atualizar_aluno(db, aluno_id, dados)

    if not aluno:
        return {"erro": "Aluno não encontrado"}

    return aluno