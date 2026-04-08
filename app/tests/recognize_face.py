import json

from app.core.database import SessionLocal
from app.models.face import Face
from app.models.aluno import Aluno

from app.tests.utils_face import capture_face_image, extract_face_embedding, compare_face


db = SessionLocal()

try:
    print("Capturando rosto para reconhecimento...")

    # 1. Captura nova face
    frame = capture_face_image()
    test_embedding = extract_face_embedding(frame)

    print("Embedding capturado!")

    # 2. Busca todas as faces do banco
    faces = db.query(Face).all()

    if not faces:
        raise Exception("Nenhuma face cadastrada no banco")

    print(f"{len(faces)} faces encontradas no banco")

    # 3. Comparar com cada face
    for face in faces:
        known_embedding = json.loads(face.embedding)

        # valida tamanho
        if len(known_embedding) != 128:
            print("Embedding inválido ignorado")
            print("Tamanho embedding:", len(known_embedding))
            continue

        match = compare_face([known_embedding], test_embedding)

        if match:
            # 4. Buscar aluno
            aluno = db.query(Aluno).filter(Aluno.id == face.aluno_id).first()

            print("\nROSTO IDENTIFICADO!")
            print("Face encontrada, aluno_id:", face.aluno_id)
            if aluno:
                print(f"ROSTO IDENTIFICADO!")
                print(f"Aluno: {aluno.nome}")
            else:
                print("Rosto identificado, mas aluno não encontrado no banco")
            print("Turma:", aluno.turma)

            break
    else:
        print("\n Nenhum rosto reconhecido")

except Exception as e:
    print("Erro:", e)

finally:
    db.close()