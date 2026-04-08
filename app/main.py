# app/main.py
from fastapi import FastAPI
from app.routes import aluno # Importa as rotas do aluno

app = FastAPI()

app.include_router(aluno.router)