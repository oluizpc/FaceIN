import pytest
from .conftest import ALUNO_PAYLOAD, ALUNO_PAYLOAD_2, criar_aluno


# ── POST /api/v1/alunos/ ────────────────────────────────────────────────────

def test_criar_aluno_sucesso(client):
    resp = client.post("/api/v1/alunos/", json=ALUNO_PAYLOAD)
    assert resp.status_code == 201
    data = resp.json()
    assert data["nome"] == ALUNO_PAYLOAD["nome"]
    assert data["turma"] == ALUNO_PAYLOAD["turma"]
    assert data["matricula"] == ALUNO_PAYLOAD["matricula"]
    assert data["ativo"] is True
    assert "id" in data


def test_criar_aluno_matricula_duplicada(client):
    client.post("/api/v1/alunos/", json=ALUNO_PAYLOAD)
    resp = client.post("/api/v1/alunos/", json=ALUNO_PAYLOAD)
    assert resp.status_code == 409


# ── GET /api/v1/alunos/ ─────────────────────────────────────────────────────

def test_listar_alunos_vazio(client):
    resp = client.get("/api/v1/alunos/")
    assert resp.status_code == 200
    assert resp.json() == []


def test_listar_alunos(client):
    criar_aluno(client, ALUNO_PAYLOAD)
    criar_aluno(client, ALUNO_PAYLOAD_2)
    resp = client.get("/api/v1/alunos/")
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_listar_alunos_nao_retorna_inativos(client):
    aluno = criar_aluno(client)
    client.delete(f"/api/v1/alunos/{aluno['id']}")
    resp = client.get("/api/v1/alunos/")
    assert resp.json() == []


# ── GET /api/v1/alunos/{id} ─────────────────────────────────────────────────

def test_buscar_aluno_por_id(client):
    aluno = criar_aluno(client)
    resp = client.get(f"/api/v1/alunos/{aluno['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == aluno["id"]


def test_buscar_aluno_nao_encontrado(client):
    resp = client.get("/api/v1/alunos/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404


# ── PUT /api/v1/alunos/{id} ─────────────────────────────────────────────────

def test_atualizar_aluno(client):
    aluno = criar_aluno(client)
    resp = client.put(
        f"/api/v1/alunos/{aluno['id']}",
        json={"nome": "João Atualizado", "turma": "6A"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["nome"] == "João Atualizado"
    assert data["turma"] == "6A"


# ── DELETE /api/v1/alunos/{id} ──────────────────────────────────────────────

def test_desativar_aluno(client):
    aluno = criar_aluno(client)
    resp = client.delete(f"/api/v1/alunos/{aluno['id']}")
    assert resp.status_code == 204


def test_desativar_aluno_nao_encontrado(client):
    resp = client.delete("/api/v1/alunos/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404
