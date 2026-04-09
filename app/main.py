from fastapi import FastAPI
from app.api.v1 import alunos, reconhecimento, entradas, responsaveis

app = FastAPI(
    title="FaceIn",
    description="Sistema de reconhecimento facial para controle de entrada escolar",
    version="0.1.0"
)

# ── rotas
app.include_router(alunos.router,        prefix="/api/v1")
app.include_router(reconhecimento.router, prefix="/api/v1")
app.include_router(entradas.router, prefix="/api/v1")
app.include_router(responsaveis.router, prefix="/api/v1")


@app.get("/")
def health_check():
    return {"status": "ok", "projeto": "FaceIn"}