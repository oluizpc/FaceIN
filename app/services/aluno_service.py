from app.models.aluno import Aluno


def criar_aluno(db, data):
    aluno = Aluno(**data.dict())
    db.add(aluno)
    db.commit()
    db.refresh(aluno)
    return aluno

def atualizar_aluno(db, aluno_id, dados):
    aluno = db.query(Aluno).filter(Aluno.idaluno == aluno_id).first()

    if not aluno:
        return None

    for campo, valor in dados.dict(exclude_unset=True).items():
        setattr(aluno, campo, valor)

    db.commit()
    db.refresh(aluno)

    return aluno