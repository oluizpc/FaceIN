import json
from app.core.database import SessionLocal
from app.models import Face
from app.tests.utils_face import capture_face_image, extract_face_embedding

idaluno = "4457f1ef-ff0e-4e7d-952e-e2ef8695a830"

db = SessionLocal()

try:
    # carrega embeddings do aluno
    faces_db = db.query(Face).filter(Face.idaluno == idaluno).all()
    known_encodings = [json.loads(f.embedding) for f in faces_db]

    # captura rosto a testar
    frame = capture_face_image()
    test_encoding = extract_face_embedding(frame)

    # compara
    if compare_face(known_encodings, test_encoding):
        print("Aluno reconhecido!")
    else:
        print("Rosto não reconhecido!")

except Exception as e:
    print("Erro:", e)
finally:
    db.close()