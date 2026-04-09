from uuid import UUID

import cv2
import numpy as np
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from app.services.entrada_service import entrada_service


from app.core.database import get_db
from app.services.reconhecimento_service import reconhecimento_service
from app.services.responsavel_service import responsavel_service
from app.services.plugzap_service import plugzap_service

router = APIRouter(prefix="/reconhecimento", tags=["Reconhecimento"])

@router.post("/identificar")
async def identificar_frame(
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

    resultado = reconhecimento_service.processar_frame(frame, db)

    # registra entrada e notifica responsáveis para cada aluno identificado
    for identificado in resultado["identificados"]:
        aluno_id = UUID(identificado["aluno_id"])
        entrada = entrada_service.registrar(
            db        = db,
            aluno_id  = aluno_id,
            confianca = identificado["confianca"],
        )

        if entrada:
            resultado["entrada_registrada"] = True

            # notifica responsáveis via WhatsApp
            responsaveis = responsavel_service.buscar_para_notificacao(db, aluno_id)
            for resp in responsaveis:
                if resp.notif_whatsapp and resp.telefone:
                    enviado = plugzap_service.notificar_entrada(
                        nome_aluno=identificado["nome"],
                        telefone=resp.telefone,
                    )
                    if enviado:
                        entrada_service.marcar_notificado(db, entrada.id)
        else:
            resultado["entrada_registrada"] = False  # já entrou hoje

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
        return {"mensagem": "Face cadastrada com sucesso", "idface": str(face.id)}

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )