import json
import numpy as np
from uuid import UUID
from sqlalchemy.orm import Session
from insightface.app import FaceAnalysis

from app.models.face import Face
from app.models.aluno import Aluno


class ReconhecimentoService:

    def __init__(self):
        self.modelo = FaceAnalysis(
            name="buffalo_s",
            providers=["CPUExecutionProvider"]
        )
        self.modelo.prepare(ctx_id=0, det_size=(320, 320))
        self.threshold = 0.5

    # ── embedding ────────────────────────────────────────────────────
    def gerar_embedding(self, frame) -> np.ndarray | None:
        rostos = self.modelo.get(frame)

        if not rostos:
            return None

        if len(rostos) > 1:
            return None  # mais de um rosto no frame

        return rostos[0].embedding

    # ── similaridade ─────────────────────────────────────────────────
    def _cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

    # ── identificação ────────────────────────────────────────────────
    def identificar(
        self,
        embedding: np.ndarray,
        db: Session
    ) -> tuple[Aluno | None, float]:

        faces = db.query(Face).all()

        if not faces:
            return None, 0.0

        melhor_aluno    = None
        melhor_score    = 0.0

        for face in faces:
            emb_banco = np.array(json.loads(face.embedding))
            score     = self._cosine_similarity(embedding, emb_banco)

            if score > melhor_score:
                melhor_score = score
                melhor_aluno = face.aluno_id

        if melhor_score >= self.threshold:
            aluno = db.query(Aluno).filter(
                Aluno.id == melhor_aluno,
                Aluno.ativo == True
            ).first()
            return aluno, melhor_score

        return None, melhor_score

    # ── processar frame completo ─────────────────────────────────────
    def processar_frame(
        self,
        frame,
        db: Session
    ) -> dict:

        rostos = self.modelo.get(frame)

        if not rostos:
            return {"identificados": [], "desconhecidos": 0}

        identificados = []
        desconhecidos = 0

        for rosto in rostos:
            embedding        = rosto.embedding
            aluno, confianca = self.identificar(embedding, db)
            box              = rosto.bbox.astype(int).tolist()

            if aluno:
                identificados.append({
                    "aluno_id":  str(aluno.id),
                    "nome":      aluno.nome,
                    "matricula": aluno.matricula,
                    "confianca": round(confianca, 4),
                    "bbox":      box
                })
            else:
                desconhecidos += 1

        return {
            "identificados": identificados,
            "desconhecidos": desconhecidos
        }

    # ── cadastrar face ───────────────────────────────────────────────
    def cadastrar_face(self, frame, aluno_id, angulo: str, db: Session) -> Face:
        embedding = self.gerar_embedding(frame)

        if embedding is None:
            raise ValueError("Nenhum rosto detectado ou mais de um rosto no frame")

        face = Face(
            aluno_id  = UUID(aluno_id),  # converte string para UUID
            embedding = json.dumps(embedding.tolist()),
            angulo    = angulo
        )

        db.add(face)
        db.commit()
        db.refresh(face)
        return face

        embedding = self.gerar_embedding(frame)

        if embedding is None:
            raise ValueError("Nenhum rosto detectado ou mais de um rosto no frame")

        face = Face(
            aluno_id  = aluno_id,
            embedding = json.dumps(embedding.tolist()),
            angulo    = angulo
        )

        db.add(face)
        db.commit()
        db.refresh(face)
        return face


reconhecimento_service = ReconhecimentoService()