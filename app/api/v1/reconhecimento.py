# app/api/v1/reconhecimento.py
import cv2
import numpy as np
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.reconhecimento_service import reconhecimento_service

router = APIRouter(prefix="/reconhecimento", tags=["Reconhecimento"])


@router.post("/identificar")
async def identificar_frame(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # lê o arquivo enviado e converte pra frame
    conteudo = await file.read()
    nparr    = np.frombuffer(conteudo, np.uint8)
    frame    = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Imagem inválida ou corrompida"
        )

    resultado = reconhecimento_service.processar_frame(frame, db)
    return resultado


@router.post("/cadastrar-face/{aluno_id}")
async def cadastrar_face(
    aluno_id: str,
    angulo: str = "FRENTE",
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    conteudo = await file.read()
    nparr    = np.frombuffer(conteudo, np.uint8)
    frame    = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Imagem inválida ou corrompida"
        )

    try:
        face = reconhecimento_service.cadastrar_face(
            frame    = frame,
            aluno_id = aluno_id,
            angulo   = angulo,
            db       = db
        )
        return {"mensagem": "Face cadastrada com sucesso", "idface": str(face.idface)}

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )