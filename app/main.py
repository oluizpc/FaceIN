import warnings
from fastapi import FastAPI
from app.api.v1 import alunos, entradas, responsaveis, escolas, auth
from app.core.database import engine, Base
import app.models  # garante que todos os models são registrados no Base

# reconhecimento importado separadamente para isolar falha de carregamento do InsightFace
try:
    from app.api.v1 import reconhecimento as _reconhecimento_mod
except Exception as exc:
    warnings.warn(f"[FaceIn] Módulo de reconhecimento não carregado: {exc}")
    _reconhecimento_mod = None

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FaceIn",
    description="Sistema de reconhecimento facial para controle de entrada escolar",
    version="0.1.0"
)

# ── rotas
app.include_router(auth.router,         prefix="/api/v1")
app.include_router(escolas.router,      prefix="/api/v1")
app.include_router(alunos.router,       prefix="/api/v1")
app.include_router(entradas.router,     prefix="/api/v1")
app.include_router(responsaveis.router, prefix="/api/v1")

if _reconhecimento_mod:
    app.include_router(_reconhecimento_mod.router, prefix="/api/v1")


@app.get("/")
def health_check():
    return {"status": "ok", "projeto": "FaceIn"}