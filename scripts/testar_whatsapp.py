"""
Script de teste de envio de mensagem via PlugZap.
Execute: python scripts/testar_whatsapp.py
"""
import sys
import os

# garante que a raiz do projeto está no path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.plugzap_service import plugzap_service

TELEFONE   = "553598891616"
NOME_ALUNO = "João Silva (teste)"

print(f"Enviando mensagem para {TELEFONE}...")

ok = plugzap_service.notificar_entrada(
    nome_aluno=NOME_ALUNO,
    telefone=TELEFONE,
)

if ok:
    print("Mensagem enviada com sucesso!")
else:
    print("Falha no envio — verifique os logs acima.")
