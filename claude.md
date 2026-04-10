# FaceIN — Contexto do Projeto para Claude Code

## O que é este projeto

FaceIN é um sistema de controle de entrada escolar por reconhecimento facial, desenvolvido como projeto acadêmico (TCC/banca). O sistema identifica alunos via câmera, registra a entrada e notifica responsáveis via WhatsApp. Suporta múltiplas escolas com isolamento de dados por usuário.

## Stack

- **Backend**: FastAPI + SQLAlchemy + SQLite (`facein.db`)
- **Autenticação**: JWT com `python-jose` + `passlib` (scheme: `sha256_crypt`)
- **Reconhecimento facial**: InsightFace modelo `buffalo_s`, embeddings 512D, similaridade cosseno
- **WhatsApp**: PlugZap API (`api.plugzapi.com.br`) com `Client-Token` no header
- **Frontend**: React + Vite + Tailwind CSS v4 (`@tailwindcss/vite`)
- **Testes**: pytest, SQLite in-memory + StaticPool
- **Python**: 3.14 (venv em `venv/`) — **não usar `venv311/` para o backend**

## Estrutura

```
FaceIN/
├── app/
│   ├── api/v1/          # Routers: alunos, responsaveis, entradas, escolas, auth, reconhecimento
│   ├── core/
│   │   ├── config.py    # Settings (Pydantic BaseSettings, lê .env)
│   │   ├── database.py  # SQLAlchemy engine + Base + get_db
│   │   └── security.py  # hash_password, verify_password, create_access_token, decode_token
│   ├── dependencies/
│   │   └── auth.py      # get_current_user, require_admin, get_escola_id_filtro
│   ├── models/          # SQLAlchemy ORM: Escola, Usuario, Aluno, Responsavel, Entrada, Face
│   ├── schemas/         # Pydantic v2 schemas
│   └── services/        # lógica de negócio + auth_service + plugzap_service + reconhecimento_service
├── frontend/
│   ├── src/
│   │   ├── api/         # client.js (axios + interceptor JWT), alunos.js, escolas.js, auth.js
│   │   ├── context/     # AuthContext.jsx (login, logout, usuario, autenticado)
│   │   ├── components/  # Navbar.jsx, Icons.jsx (SVG inline)
│   │   └── pages/       # Login, Escolas, Alunos, AlunoDetalhes, Painel, Usuarios
│   └── vite.config.js   # proxy /api → localhost:8000
├── tests/               # pytest, SQLite in-memory
├── .env                 # variáveis de ambiente (não commitado)
└── requirements.txt
```

## Variáveis de ambiente (.env)

```
DATABASE_URL=sqlite:///./facein.db
SECRET_KEY=...             # chave para assinar JWT
PLUGZAP_INSTANCE_ID=...
PLUGZAP_TOKEN=...
PLUGZAP_CLIENT_TOKEN=...   # Token de segurança da conta (ativar no painel PlugZap)
```

## Como rodar

```bash
# Backend (terminal 1) — usar o venv, não o venv311
source venv/Scripts/activate
uvicorn app.main:app        # NÃO usar --reload (incompatível com Python 3.14 no Windows)

# Frontend (terminal 2)
cd frontend
npm run dev
```

- API: http://localhost:8000
- Swagger: http://localhost:8000/docs
- Frontend: http://localhost:5173

## Como rodar os testes

```bash
source venv/Scripts/activate
pytest tests/ -v
```

Os testes rodam sem servidor. Usam SQLite in-memory com `StaticPool` (crítico — sem isso dá `no such table`).

## Primeiro uso / setup inicial

As tabelas são criadas automaticamente via `Base.metadata.create_all()` no `main.py`.
Para criar o admin inicial (só funciona uma vez, bloqueado após primeiro uso):

```
POST /api/v1/auth/primeiro-admin
{ "nome": "Admin", "email": "...", "senha": "..." }
```

Depois disso, apenas admins autenticados podem criar novos usuários via `POST /api/v1/auth/registro`.

## Modelo de autenticação e acesso

- **JWT Bearer token** — todas as rotas (exceto `/auth/login` e `/auth/primeiro-admin`) exigem token
- **Roles**: `admin` (acesso total) e `operador` (acesso restrito à própria escola)
- **Filtro automático**: operador só vê/edita alunos e entradas da escola vinculada ao seu usuário
- **`get_escola_id_filtro`** (dependency em `app/dependencies/auth.py`): retorna `None` se admin, `escola_id` do usuário se operador — usar nos routers para aplicar o filtro

## Decisões técnicas importantes

### Dois ambientes virtuais
O projeto tem `venv/` e `venv311/`. O backend roda no `venv/`. Instalar dependências sempre no `venv/`.
O `venv311/` existe por compatibilidade com InsightFace (Python 3.11).

### uvicorn sem --reload no Windows + Python 3.14
O modo `--reload` usa subprocess que conflita com Python 3.14 no Windows — o servidor aceita conexões mas não responde. Sempre rodar sem `--reload`.

### Hashing de senha: sha256_crypt
`bcrypt` causa `ValueError: password cannot be longer than 72 bytes` no Python 3.14 com passlib.
Solução: `CryptContext(schemes=["sha256_crypt"])` em `app/core/security.py`.

### Icons sem lucide-react
`lucide-react` causava conflito de versão do React. Solução: usar `frontend/src/components/Icons.jsx` com SVGs inline.

### InsightFace lazy-loaded
O modelo InsightFace é carregado sob demanda via `@property` em `reconhecimento_service.py`. Evita falha na importação quebrando todos os routers.

### Router de reconhecimento com try/except em main.py
Importado dentro de `try/except` para que falhas (ex: InsightFace não instalado) não impeçam os outros routers de carregar.

### Pydantic v2
- Usar `model_config = ConfigDict(...)` em vez de `class Config`
- Usar `model_validator(mode="after")` para validações cross-field
- `field_validator` não tem acesso a outros campos — usar `model_validator`

### PlugZap
- URL: `https://api.plugzapi.com.br/instances/{id}/token/{token}/send-text`
- Header obrigatório: `Client-Token: {client_token}`
- Ativar "Token de segurança da conta" no painel antes de usar

## Fluxo de reconhecimento

1. POST `/api/v1/reconhecimento/identificar` com imagem
2. InsightFace extrai embedding da face detectada
3. Compara com embeddings cadastrados (cosseno)
4. Se similaridade ≥ threshold: registra entrada + notifica responsáveis via WhatsApp

## Contexto acadêmico

Projeto de TCC/apresentação para banca. O frontend deve ter aparência profissional e moderna. Público: professores avaliadores e futuros clientes (escolas).
