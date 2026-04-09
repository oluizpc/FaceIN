# app/tests/cadastrar_face.py
import cv2
import json
from insightface.app import FaceAnalysis
from app.core.database import SessionLocal
from app.models import Face, Aluno

# ── carrega modelo ───────────────────────────────────────────────────
app_face = FaceAnalysis(
    name="buffalo_s",
    providers=["CPUExecutionProvider"]
)
app_face.prepare(ctx_id=0, det_size=(320, 320))

# ── cadastra ou busca aluno no banco ─────────────────────────────────
db = SessionLocal()

print("\n── Dados do aluno ──")
nome      = input("Nome: ").strip()
turma     = input("Turma: ").strip()
matricula = input("Matrícula: ").strip()

aluno = db.query(Aluno).filter(Aluno.matricula == matricula).first()

if aluno:
    print(f"Aluno já cadastrado: {aluno.nome} — usando cadastro existente")
else:
    aluno = Aluno(
        nome=nome,
        turma=turma,
        matricula=matricula
    )
    db.add(aluno)
    db.commit()
    db.refresh(aluno)
    print(f"Aluno criado com sucesso! ID: {aluno.id}")

angulo = input("Ângulo (FRENTE/DIREITA/ESQUERDA/SEM_OCULOS/COM_OCULOS) [FRENTE]: ").strip() or "FRENTE"

print(f"\nCadastrando face para: {aluno.nome} — {angulo}")
print("Pressione ESPAÇO para capturar | ESC para sair")

# ── câmera ───────────────────────────────────────────────────────────
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

    if key == 27:  # ESC
        break

    if key == 32:  # ESPAÇO
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
            angulo=angulo
        )

        db.add(face)
        db.commit()
        print(f"Face cadastrada! Aluno: {aluno.nome} | Ângulo: {angulo} | Dimensões: {len(embedding)}")
        break

video.release()
cv2.destroyAllWindows()
db.close()