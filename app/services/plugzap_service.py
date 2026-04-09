import re
import logging
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


def _formatar_telefone(telefone: str) -> str:
    """Remove formatação e garante código do país 55 (Brasil)."""
    digitos = re.sub(r"\D", "", telefone)
    if not digitos.startswith("55"):
        digitos = "55" + digitos
    return digitos


class PlugZapService:

    def _url(self, endpoint: str) -> str:
        return (
            f"https://api.plugzapi.com.br/instances/{settings.PLUGZAP_INSTANCE_ID}"
            f"/token/{settings.PLUGZAP_TOKEN}/{endpoint}"
        )

    def _headers(self) -> dict:
        return {"Client-Token": settings.PLUGZAP_CLIENT_TOKEN}

    def _configurado(self) -> bool:
        return bool(
            settings.PLUGZAP_INSTANCE_ID
            and settings.PLUGZAP_TOKEN
            and settings.PLUGZAP_CLIENT_TOKEN
        )

    def enviar_texto(self, telefone: str, mensagem: str) -> bool:
        if not self._configurado():
            logger.warning("[PlugZap] Credenciais não configuradas — notificação ignorada.")
            return False

        numero = _formatar_telefone(telefone)

        try:
            resp = httpx.post(
                self._url("send-text"),
                headers=self._headers(),
                json={"phone": numero, "message": mensagem},
                timeout=10,
            )
            resp.raise_for_status()
            logger.info("[PlugZap] Mensagem enviada para %s", numero)
            return True

        except httpx.HTTPStatusError as exc:
            logger.error(
                "[PlugZap] Erro HTTP %s ao enviar para %s: %s",
                exc.response.status_code, numero, exc.response.text,
            )
        except httpx.RequestError as exc:
            logger.error("[PlugZap] Falha de conexão: %s", exc)

        return False

    def notificar_entrada(self, nome_aluno: str, telefone: str) -> bool:
        mensagem = (
            f"Olá! *{nome_aluno}* acabou de chegar à escola. ✅\n"
            "Esta é uma notificação automática do sistema FaceIn."
        )
        return self.enviar_texto(telefone, mensagem)


plugzap_service = PlugZapService()
