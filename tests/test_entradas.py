import uuid
from datetime import datetime, date

from app.models.entrada import Entrada
from .conftest import ALUNO_PAYLOAD, criar_aluno


def _criar_entrada(db, aluno_id, registrado_em=None):
    """Insere uma entrada diretamente no DB de teste."""
    entrada = Entrada(
        aluno_id=aluno_id,
        confianca=0.9500,
        notificado=False,
        registrado_em=registrado_em or datetime.now(),
    )
    db.add(entrada)
    db.commit()
    db.refresh(entrada)
    return entrada


# ── GET /api/v1/entradas/ ───────────────────────────────────────────────────

def test_listar_entradas_vazio(client):
    resp = client.get("/api/v1/entradas/")
    assert resp.status_code == 200
    assert resp.json() == []


def test_listar_entradas(client, db):
    aluno = criar_aluno(client)
    _criar_entrada(db, uuid.UUID(aluno["id"]))
    resp = client.get("/api/v1/entradas/")
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_listar_entradas_filtro_aluno(client, db):
    aluno1 = criar_aluno(client, ALUNO_PAYLOAD)
    aluno2 = criar_aluno(client, {"nome": "Outro", "turma": "5B", "matricula": "2024002"})
    _criar_entrada(db, uuid.UUID(aluno1["id"]))
    _criar_entrada(db, uuid.UUID(aluno2["id"]))

    resp = client.get(f"/api/v1/entradas/?aluno_id={aluno1['id']}")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["aluno_id"] == aluno1["id"]


# ── GET /api/v1/entradas/hoje ───────────────────────────────────────────────

def test_entradas_hoje_vazio(client):
    resp = client.get("/api/v1/entradas/hoje")
    assert resp.status_code == 200
    assert resp.json() == []


def test_entradas_hoje_retorna_apenas_hoje(client, db):
    aluno = criar_aluno(client)
    aluno_id = uuid.UUID(aluno["id"])

    # entrada de hoje
    _criar_entrada(db, aluno_id, registrado_em=datetime.now())
    # entrada de ontem (não deve aparecer)
    from datetime import timedelta
    _criar_entrada(db, aluno_id, registrado_em=datetime.now() - timedelta(days=1))

    resp = client.get("/api/v1/entradas/hoje")
    assert resp.status_code == 200
    assert len(resp.json()) == 1


# ── GET /api/v1/entradas/{id} ───────────────────────────────────────────────

def test_buscar_entrada_por_id(client, db):
    aluno = criar_aluno(client)
    entrada = _criar_entrada(db, uuid.UUID(aluno["id"]))
    resp = client.get(f"/api/v1/entradas/{entrada.id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == str(entrada.id)


def test_buscar_entrada_nao_encontrada(client):
    resp = client.get("/api/v1/entradas/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404


# ── Regra: duplicata no mesmo dia ───────────────────────────────────────────

def test_ja_entrou_hoje_nao_duplica(db):
    """entrada_service.registrar deve retornar None se aluno já entrou hoje."""
    from app.services.entrada_service import entrada_service

    aluno_id = uuid.uuid4()
    primeira = entrada_service.registrar(db, aluno_id, confianca=0.95)
    assert primeira is not None

    segunda = entrada_service.registrar(db, aluno_id, confianca=0.97)
    assert segunda is None
