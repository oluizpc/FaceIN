from .conftest import ALUNO_PAYLOAD, RESPONSAVEL_PAYLOAD, criar_aluno

RESPONSAVEL_2 = {
    "nome": "Carlos Silva",
    "parentesco": "Pai",
    "telefone": "11988880002",
    "notif_whatsapp": True,
    "notif_email": False,
    "aceite_lgpd": True,
}


def _criar_responsavel(client, aluno_id, payload=None):
    return client.post(
        f"/api/v1/responsaveis/aluno/{aluno_id}",
        json=payload or RESPONSAVEL_PAYLOAD,
    ).json()


# ── POST /api/v1/responsaveis/aluno/{aluno_id} ──────────────────────────────

def test_criar_responsavel_sucesso(client):
    aluno = criar_aluno(client)
    resp = client.post(
        f"/api/v1/responsaveis/aluno/{aluno['id']}",
        json=RESPONSAVEL_PAYLOAD,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["nome"] == RESPONSAVEL_PAYLOAD["nome"]
    assert data["aluno_id"] == aluno["id"]
    assert data["aceite_lgpd"] is True


def test_criar_responsavel_aluno_inexistente(client):
    resp = client.post(
        "/api/v1/responsaveis/aluno/00000000-0000-0000-0000-000000000000",
        json=RESPONSAVEL_PAYLOAD,
    )
    assert resp.status_code == 404


def test_criar_responsavel_whatsapp_sem_telefone(client):
    aluno = criar_aluno(client)
    payload = {**RESPONSAVEL_PAYLOAD, "telefone": None, "notif_whatsapp": True}
    resp = client.post(f"/api/v1/responsaveis/aluno/{aluno['id']}", json=payload)
    assert resp.status_code == 422


# ── GET /api/v1/responsaveis/aluno/{aluno_id} ───────────────────────────────

def test_listar_responsaveis_por_aluno(client):
    aluno = criar_aluno(client)
    _criar_responsavel(client, aluno["id"])
    _criar_responsavel(client, aluno["id"], RESPONSAVEL_2)

    resp = client.get(f"/api/v1/responsaveis/aluno/{aluno['id']}")
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_listar_responsaveis_aluno_sem_responsaveis(client):
    aluno = criar_aluno(client)
    resp = client.get(f"/api/v1/responsaveis/aluno/{aluno['id']}")
    assert resp.status_code == 200
    assert resp.json() == []


# ── GET /api/v1/responsaveis/{id} ───────────────────────────────────────────

def test_buscar_responsavel_por_id(client):
    aluno = criar_aluno(client)
    resp_create = _criar_responsavel(client, aluno["id"])
    resp = client.get(f"/api/v1/responsaveis/{resp_create['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == resp_create["id"]


def test_buscar_responsavel_nao_encontrado(client):
    resp = client.get("/api/v1/responsaveis/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404


# ── PUT /api/v1/responsaveis/{id} ───────────────────────────────────────────

def test_atualizar_responsavel(client):
    aluno = criar_aluno(client)
    resp_r = _criar_responsavel(client, aluno["id"])
    resp = client.put(
        f"/api/v1/responsaveis/{resp_r['id']}",
        json={"nome": "Ana Atualizada", "telefone": "11911112222"},
    )
    assert resp.status_code == 200
    assert resp.json()["nome"] == "Ana Atualizada"


# ── DELETE /api/v1/responsaveis/{id} ────────────────────────────────────────

def test_deletar_responsavel_unico_bloqueado(client):
    """Não pode deletar o único responsável do aluno."""
    aluno = criar_aluno(client)
    resp_r = _criar_responsavel(client, aluno["id"])
    resp = client.delete(f"/api/v1/responsaveis/{resp_r['id']}")
    assert resp.status_code == 400


def test_deletar_responsavel_com_dois(client):
    aluno = criar_aluno(client)
    r1 = _criar_responsavel(client, aluno["id"])
    _criar_responsavel(client, aluno["id"], RESPONSAVEL_2)

    resp = client.delete(f"/api/v1/responsaveis/{r1['id']}")
    assert resp.status_code == 204
