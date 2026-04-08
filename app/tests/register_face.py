# -*- coding: utf-8 -*-

import json
import uuid

from app.core.database import SessionLocal
from app.models.face import Face
from .utils_face import capture_face_image, extract_face_embedding


#  ID do aluno (usar UUID correto gerado)
aluno_id = uuid.UUID("af2e105b-7b38-49e9-a1c3-efd2d6ed084a")


# inicia sessão do banco
db = SessionLocal()

try:
    # captura imagem e extrai embedding
    frame = capture_face_image()
    embedding = extract_face_embedding(frame)
    print("Embedding extraído com sucesso")

    # converte para JSON
    emb_json = json.dumps(embedding.tolist(), ensure_ascii=False)
    print("JSON criado com sucesso")

    # cria registro da face
    nova_face = Face(
        aluno_id=aluno_id,  
        embedding=emb_json,
        foto_url=None,
        angulo="FRENTE",
        usa_oculos=False
    )
    print("Face criada com sucesso")

    # salva no banco
    db.add(nova_face)
    db.commit()

    print("Rosto registrado com sucesso!")

except Exception as e:
    print("Erro:", e)

finally:
    db.close()