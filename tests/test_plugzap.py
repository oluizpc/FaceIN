"""
Testes unitários do PlugZapService.
Nenhuma chamada real é feita — httpx é mockado via pytest monkeypatch.
"""
import httpx
import pytest
from unittest.mock import MagicMock

from app.services.plugzap_service import PlugZapService, _formatar_telefone


# ── _formatar_telefone ───────────────────────────────────────────────────────

def test_formatar_telefone_adiciona_codigo_pais():
    assert _formatar_telefone("11999990001") == "5511999990001"


def test_formatar_telefone_nao_duplica_codigo_pais():
    assert _formatar_telefone("5511999990001") == "5511999990001"


def test_formatar_telefone_remove_formatacao():
    assert _formatar_telefone("(11) 9 9999-0001") == "5511999990001"


def test_formatar_telefone_com_hifens_e_espacos():
    assert _formatar_telefone("+55 (11) 99999-0001") == "5511999990001"


# ── PlugZapService.enviar_texto ──────────────────────────────────────────────

@pytest.fixture
def service(monkeypatch):
    """Service com credenciais simuladas."""
    monkeypatch.setenv("PLUGZAP_INSTANCE_ID", "inst123")
    monkeypatch.setenv("PLUGZAP_TOKEN", "tok456")
    svc = PlugZapService()
    # injeta credenciais diretamente para evitar recarga do settings
    svc._get_instance_id = lambda: "inst123"
    svc._get_token = lambda: "tok456"
    return svc


def test_enviar_texto_sem_credenciais(monkeypatch):
    """Retorna False e não chama a API quando credenciais estão vazias."""
    from app.core import config as cfg_module
    monkeypatch.setattr(cfg_module.settings, "PLUGZAP_INSTANCE_ID", "")
    monkeypatch.setattr(cfg_module.settings, "PLUGZAP_TOKEN", "")

    svc = PlugZapService()
    resultado = svc.enviar_texto("11999990001", "teste")
    assert resultado is False


def _mock_resp_ok():
    mock = MagicMock()
    mock.raise_for_status.return_value = None
    mock.status_code = 200
    return mock


def _mock_resp_erro(status_code=401):
    mock = MagicMock()
    mock.raise_for_status.side_effect = httpx.HTTPStatusError(
        "error", request=MagicMock(), response=MagicMock(status_code=status_code, text="Unauthorized")
    )
    mock.status_code = status_code
    return mock


def test_enviar_texto_sucesso(monkeypatch):
    """Retorna True quando a API responde 200."""
    from app.core import config as cfg_module
    monkeypatch.setattr(cfg_module.settings, "PLUGZAP_INSTANCE_ID", "inst123")
    monkeypatch.setattr(cfg_module.settings, "PLUGZAP_TOKEN", "tok456")
    monkeypatch.setattr(httpx, "post", lambda *a, **kw: _mock_resp_ok())

    assert PlugZapService().enviar_texto("11999990001", "Olá teste") is True


def test_enviar_texto_erro_http(monkeypatch):
    """Retorna False quando a API responde com erro HTTP."""
    from app.core import config as cfg_module
    monkeypatch.setattr(cfg_module.settings, "PLUGZAP_INSTANCE_ID", "inst123")
    monkeypatch.setattr(cfg_module.settings, "PLUGZAP_TOKEN", "tok456")
    monkeypatch.setattr(httpx, "post", lambda *a, **kw: _mock_resp_erro(401))

    assert PlugZapService().enviar_texto("11999990001", "teste") is False


def test_enviar_texto_erro_conexao(monkeypatch):
    """Retorna False quando há falha de rede."""
    from app.core import config as cfg_module
    monkeypatch.setattr(cfg_module.settings, "PLUGZAP_INSTANCE_ID", "inst123")
    monkeypatch.setattr(cfg_module.settings, "PLUGZAP_TOKEN", "tok456")

    def mock_post(*a, **kw):
        raise httpx.ConnectError("Connection refused")

    monkeypatch.setattr(httpx, "post", mock_post)

    assert PlugZapService().enviar_texto("11999990001", "teste") is False


# ── notificar_entrada ────────────────────────────────────────────────────────

def test_notificar_entrada_formata_mensagem(monkeypatch):
    """Verifica que o nome do aluno aparece em negrito na mensagem."""
    from app.core import config as cfg_module
    monkeypatch.setattr(cfg_module.settings, "PLUGZAP_INSTANCE_ID", "inst123")
    monkeypatch.setattr(cfg_module.settings, "PLUGZAP_TOKEN", "tok456")

    mensagens_enviadas = []

    def mock_post(url, json, **kwargs):
        mensagens_enviadas.append(json["message"])
        return _mock_resp_ok()

    monkeypatch.setattr(httpx, "post", mock_post)

    PlugZapService().notificar_entrada("João Silva", "11999990001")

    assert len(mensagens_enviadas) == 1
    assert "*João Silva*" in mensagens_enviadas[0]
