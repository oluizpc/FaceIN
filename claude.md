# FaceIN — Contexto do Projeto para Claude Code

## O que é este projeto

FaceIN é um sistema de controle de entrada escolar por reconhecimento facial, desenvolvido como projeto acadêmico (TCC/banca). O sistema identifica alunos via câmera, registra a entrada e notifica responsáveis via WhatsApp.

## Stack

- **Backend**: FastAPI + SQLAlchemy + SQLite (`facein.db`)
- **Reconhecimento facial**: InsightFace modelo `buffalo_s`, embeddings 512D, similaridade cosseno
- **WhatsApp**: PlugZap API (`api.plugzapi.com.br`) com `Client-Token` no header
- **Frontend**: React + Vite + Tailwind CSS v4 (`@tailwindcss/vite`)
- **Testes**: pytest, 37 testes, SQLite in-memory + StaticPool
- **Python**: 3.11 (venv em `venv311/`)

## Estrutura

```
FaceIN/
├── app/
│   ├── api/v1/          # Routers: alunos, responsaveis, entradas, reconhecimento
│   ├── core/config.py   # Settings (Pydantic BaseSettings, lê .env)
│   ├── models/          # SQLAlchemy ORM
│   ├── schemas/         # Pydantic v2 schemas
│   └── services/        # lógica de negócio + plugzap_service + reconhecimento_service
├── frontend/
│   ├── src/
│   │   ├── components/  # Sidebar, Toast, Icons (SVG inline — sem lucide-react)
│   │   └── pages/       # Dashboard, Alunos, AlunoDetalhes, Painel
│   └── vite.config.js   # proxy /api → localhost:8000
├── tests/               # 37 testes pytest
├── .env                 # variáveis de ambiente (não commitado)
└── requirements.txt
```

## Variáveis de ambiente (.env)

```
PLUGZAP_INSTANCE_ID=...
PLUGZAP_TOKEN=...
PLUGZAP_CLIENT_TOKEN=...   # Token de segurança da conta (ativar no painel PlugZap)
```

## Como rodar

```bash
# Backend (terminal 1)
source venv311/Scripts/activate
uvicorn app.main:app --reload

# Frontend (terminal 2)
cd frontend
npm run dev
```

- API: http://localhost:8000
- Swagger: http://localhost:8000/docs
- Frontend: http://localhost:5173

## Como rodar os testes

```bash
source venv311/Scripts/activate
pytest tests/ -v
```

Os testes rodam sem servidor. Usam SQLite in-memory com `StaticPool` (crítico — sem isso dá `no such table`).

## Decisões técnicas importantes

### Icons sem lucide-react
`lucide-react` causava conflito de versão do React ("You might have more than one copy of React"). Solução: desinstalar e usar `frontend/src/components/Icons.jsx` com SVGs inline.

### InsightFace lazy-loaded
O modelo InsightFace é carregado sob demanda via `@property` em `reconhecimento_service.py`. Isso evita falha na importação quebrando todos os routers do FastAPI.

### Router de reconhecimento com try/except em main.py
O router de reconhecimento é importado dentro de `try/except` para que falhas (ex: InsightFace não instalado) não impeçam os outros routers de carregar.

### Pydantic v2
- Usar `model_config = ConfigDict(...)` em vez de `class Config`
- Usar `model_validator(mode="after")` para validações cross-field (ex: telefone obrigatório se notif_whatsapp=True)
- `field_validator` não tem acesso a outros campos ainda — usar `model_validator`

### PlugZap
- URL: `https://api.plugzapi.com.br/instances/{id}/token/{token}/send-text`
- Header obrigatório: `Client-Token: {client_token}`
- Ativar "Token de segurança da conta" no painel antes de usar
- O `uvicorn --reload` **não recarrega o .env** — reiniciar o servidor após alterar variáveis

## Fluxo de reconhecimento

1. POST `/api/v1/reconhecimento/identificar` com imagem
2. InsightFace extrai embedding da face detectada
3. Compara com embeddings cadastrados (cosseno)
4. Se similaridade ≥ threshold: registra entrada + notifica responsáveis via WhatsApp

## Contexto acadêmico

Projeto de TCC/apresentação para banca. O frontend deve ter aparência profissional e moderna. Público: professores avaliadores e futuros clientes (escolas).
