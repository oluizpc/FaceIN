# app/tests/reconhecimento_v2.py
import cv2
import json
import numpy as np

from insightface.app import FaceAnalysis
from app.core.database import SessionLocal
from app.models import Face, Aluno

# ── carrega modelo ───────────────────────────────────────────────────
app_face = FaceAnalysis(
    name="buffalo_s",        # modelo leve pra CPU
    providers=["CPUExecutionProvider"]
)
app_face.prepare(ctx_id=0, det_size=(320, 320))  # resolução menor = mais rápido

# ── carrega faces do banco uma vez só ───────────────────────────────
db = SessionLocal()

faces   = db.query(Face).all()
alunos  = {str(a.id): a for a in db.query(Aluno).all()}

db.close()

known_encodings = []
known_ids       = []

for face in faces:
    emb = np.array(json.loads(face.embedding))
    known_encodings.append(emb)
    known_ids.append(str(face.aluno_id))

known_encodings = np.array(known_encodings)
print(f"{len(known_encodings)} faces carregadas")

# ── configurações ────────────────────────────────────────────────────
THRESHOLD       = 0.5   # distância mínima pra considerar match
PROCESSAR_A_CADA = 2    # processa 1 frame a cada 2

# ── funções ──────────────────────────────────────────────────────────
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def identificar(embedding):
    if len(known_encodings) == 0:
        return "Desconhecido", 0.0

    similaridades = [cosine_similarity(embedding, k) for k in known_encodings]
    melhor_idx    = int(np.argmax(similaridades))
    melhor_score  = similaridades[melhor_idx]

    if melhor_score >= THRESHOLD:
        aluno_id = known_ids[melhor_idx]
        aluno    = alunos.get(aluno_id)
        if aluno:
            return f"{aluno.nome} - {aluno.matricula}", melhor_score

    return "Desconhecido", melhor_score

# ── loop principal ───────────────────────────────────────────────────
video       = cv2.VideoCapture(0)
frame_count = 0
cache       = []

while True:
    ret, frame = video.read()
    if not ret:
        break

    frame_count += 1

    if frame_count % PROCESSAR_A_CADA == 0:
        cache = []
        rostos = app_face.get(frame)

        for rosto in rostos:
            embedding        = rosto.embedding
            nome, confianca  = identificar(embedding)

            box = rosto.bbox.astype(int)
            cor = (0, 255, 0) if nome != "Desconhecido" else (0, 0, 255)

            cache.append((box, nome, confianca, cor))

    # desenha cache em todos os frames
    for (box, nome, confianca, cor) in cache:
        x1, y1, x2, y2 = box
        cv2.rectangle(frame, (x1, y1), (x2, y2), cor, 2)
        cv2.putText(
            frame,
            f"{nome} ({confianca:.2f})",
            (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6, cor, 2
        )

    cv2.imshow("FaceIn v2 — InsightFace", frame)

    if cv2.waitKey(1) == 27:
        break

video.release()
cv2.destroyAllWindows()