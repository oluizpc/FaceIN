import cv2
import json
import numpy as np
import face_recognition

from app.core.database import SessionLocal
from app.models import Face, Aluno

db = SessionLocal()

# ── carrega tudo em memória uma vez só ──────────────────────────────
faces = db.query(Face).all()

known_encodings = []
alunos_map = {}  # aluno_id -> nome + matricula

for face in faces:
    emb = np.array(json.loads(face.embedding))
    known_encodings.append(emb)
    alunos_map[str(face.aluno_id)] = None  # preenche abaixo

# carrega alunos UMA vez, sem query dentro do loop
alunos = db.query(Aluno).all()
alunos_dict = {str(a.id): a for a in alunos}

db.close()  # fecha conexão, não precisa mais

print(f"{len(known_encodings)} faces carregadas")

# ── configurações ────────────────────────────────────────────────────
ESCALA = 0.25        # reduz frame pra 25% — principal otimização
PROCESSAR_A_CADA = 3 # processa 1 frame a cada 3

video = cv2.VideoCapture(0)

frame_count = 0
resultado_cache = []  # guarda último resultado

while True:
    ret, frame = video.read()
    if not ret:
        break

    frame_count += 1

    # só processa a cada N frames
    if frame_count % PROCESSAR_A_CADA == 0:

        # reduz resolução pra processar mais rápido
        pequeno = cv2.resize(frame, (0, 0), fx=ESCALA, fy=ESCALA)
        rgb = cv2.cvtColor(pequeno, cv2.COLOR_BGR2RGB)

        locations = face_recognition.face_locations(rgb, model="hog")
        encodings = face_recognition.face_encodings(rgb, locations)

        resultado_cache = []

        for (top, right, bottom, left), encoding in zip(locations, encodings):

            # escala as coordenadas de volta pro tamanho original
            top    = int(top    / ESCALA)
            right  = int(right  / ESCALA)
            bottom = int(bottom / ESCALA)
            left   = int(left   / ESCALA)

            matches = face_recognition.compare_faces(
                known_encodings, encoding, tolerance=0.5
            )

            nome = "Desconhecido"
            cor  = (0, 0, 255)

            if True in matches:
                index    = matches.index(True)
                aluno_id = str(list(alunos_dict.keys())[index])
                aluno    = alunos_dict.get(aluno_id)

                if aluno:
                    nome = f"{aluno.nome} - {aluno.matricula}"
                    cor  = (0, 255, 0)

            resultado_cache.append((top, right, bottom, left, nome, cor))

    # desenha o último resultado em TODOS os frames
    for (top, right, bottom, left, nome, cor) in resultado_cache:
        cv2.rectangle(frame, (left, top), (right, bottom), cor, 2)
        cv2.putText(
            frame, nome, (left, top - 10),
            cv2.FONT_HERSHEY_SIMPLEX, 0.6, cor, 2
        )

    cv2.imshow("FaceIn — Reconhecimento", frame)

    if cv2.waitKey(1) == 27:
        break

video.release()
cv2.destroyAllWindows()