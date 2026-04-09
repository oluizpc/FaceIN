import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Importa todos os models para registrá-los no Base antes do create_all
import app.models  # noqa: F401

from app.core.database import Base, get_db
from app.main import app

SQLALCHEMY_TEST_URL = "sqlite:///:memory:"

# StaticPool garante que create_all e a sessão usem a mesma conexão in-memory
engine = create_engine(
    SQLALCHEMY_TEST_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db(reset_db):
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# ── helpers reutilizáveis ────────────────────────────────────────────────────

ALUNO_PAYLOAD = {"nome": "João Silva", "turma": "5A", "matricula": "2024001"}
ALUNO_PAYLOAD_2 = {"nome": "Maria Santos", "turma": "5B", "matricula": "2024002"}

RESPONSAVEL_PAYLOAD = {
    "nome": "Ana Silva",
    "parentesco": "Mãe",
    "telefone": "11999990001",
    "notif_whatsapp": True,
    "notif_email": False,
    "aceite_lgpd": True,
}


def criar_aluno(client, payload=None):
    """Cria um aluno e retorna o JSON de resposta."""
    return client.post("/api/v1/alunos/", json=payload or ALUNO_PAYLOAD).json()
