# app/tests/cadastrar_face.py
import cv2
import json
import numpy as np
from insightface.app import FaceAnalysis
from app.core.database import SessionLocal
from app.models import Face, Aluno

# ── carrega modelo ───────────────────────────────────────────────────
app_face = FaceAnalysis(
    name="buffalo_s",
    providers=["CPUExecutionProvider"]
)
app_face.prepare(ctx_id=0, det_size=(320, 320))

# ── busca aluno no banco ─────────────────────────────────────────────
db = SessionLocal()
aluno = db.query(Aluno).first()  # pega o primeiro aluno cadastrado

if not aluno:
    print("Nenhum aluno cadastrado no banco!")
    db.close()
    exit()

print(f"Cadastrando face para: {aluno.nome}")
print("Pressione ESPAÇO para capturar | ESC para sair")

video = cv2.VideoCapture(0)

while True:
    ret, frame = video.read()
    if not ret:
        break

    rostos = app_face.get(frame)

    for rosto in rostos:
        box = rosto.bbox.astype(int)
        cv2.rectangle(frame, (box[0], box[1]), (box[2], box[3]), (0, 255, 0), 2)
        cv2.putText(frame, "Rosto detectado!", (box[0], box[1] - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    cv2.imshow("FaceIn — Cadastro", frame)

    key = cv2.waitKey(1)

    # ESC sai
    if key == 27:
        break

    # ESPACO captura
    if key == 32:
        if len(rostos) == 0:
            print("Nenhum rosto detectado, tente novamente!")
            continue

        if len(rostos) > 1:
            print("Mais de um rosto detectado, fique sozinho na câmera!")
            continue

        embedding = rostos[0].embedding.tolist()

        face = Face(
            aluno_id=aluno.id,
            embedding=json.dumps(embedding),
            foto_url=None,
            angulo="FRENTE"
        )

        db.add(face)
        db.commit()
        print(f"Face cadastrada com sucesso! Dimensoes: {len(embedding)}")
        break

video.release()
cv2.destroyAllWindows()
db.close()