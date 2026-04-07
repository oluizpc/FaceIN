# app/main.py
from fastapi import FastAPI

app = FastAPI(
    title="FaceIn",
    description="Sistema de reconhecimento facial para controle de entrada escolar",
    version="0.1.0"
)

@app.get("/")
def health_check():
    return {"status": "ok", "projeto": "FaceIn"}