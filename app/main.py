import warnings
from fastapi import FastAPI
from app.api.v1 import alunos, entradas, responsaveis

# reconhecimento importado separadamente para isolar falha de carregamento do InsightFace
try:
    from app.api.v1 import reconhecimento as _reconhecimento_mod
except Exception as exc:
    warnings.warn(f"[FaceIn] Módulo de reconhecimento não carregado: {exc}")
    _reconhecimento_mod = None

app = FastAPI(
    title="FaceIn",
    description="Sistema de reconhecimento facial para controle de entrada escolar",
    version="0.1.0"
)

# ── rotas
app.include_router(alunos.router,       prefix="/api/v1")
app.include_router(entradas.router,     prefix="/api/v1")
app.include_router(responsaveis.router, prefix="/api/v1")

if _reconhecimento_mod:
    app.include_router(_reconhecimento_mod.router, prefix="/api/v1")


@app.get("/")
def health_check():
    return {"status": "ok", "projeto": "FaceIn"}