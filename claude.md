# FaceIN — Contexto do Projeto para Claude Code

## O que é este projeto

FaceIN é um sistema de controle de entrada escolar por reconhecimento facial, desenvolvido como projeto acadêmico (TCC/banca). O sistema identifica alunos via câmera, registra a entrada e notifica responsáveis via WhatsApp. Suporta múltiplas escolas com isolamento de dados por usuário.

## Stack

- **Backend**: FastAPI + SQLAlchemy + SQLite (`facein.db`)
- **Autenticação**: JWT com `python-jose` + `passlib` (scheme: `sha256_crypt`)
- **Reconhecimento facial**: InsightFace modelo `buffalo_s`, embeddings 512D, similaridade cosseno
- **WhatsApp**: PlugZap API (`api.plugzapi.com.br`) com `Client-Token` no header
- **Frontend**: React + Vite + Tailwind CSS v4 (`@tailwindcss/vite`)
- **Fontes**: Syne (títulos) + DM Sans (corpo) + JetBrains Mono (dados/timestamps) — via Google Fonts
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
│   │   ├── context/     # AuthContext.jsx (auth), ThemeContext.jsx (dark/light + localStorage)
│   │   ├── components/  # Navbar.jsx (inclui botão toggle de tema), Icons.jsx (SVG inline)
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

### Design system do frontend
O frontend usa um sistema de design próprio baseado em variáveis CSS, sem depender de classes Tailwind para estilo visual. Regras:

- **Nunca usar classes Tailwind para cores, espaçamento ou tipografia** nas páginas — usar `style={{}}` inline com as variáveis CSS.
- Tailwind é usado apenas para utilitários estruturais quando necessário (ex: `fade-up`, `fi-input`).
- Todas as cores vêm de variáveis CSS definidas em `frontend/src/index.css` (ex: `var(--accent)`, `var(--bg-surface)`).
- As variáveis mudam automaticamente com o tema — **nunca hardcodar cores** como `#fff` ou `#000` diretamente nos componentes (exceto preto `#000` no texto sobre botões de accent).

### Temas dark/light
- Controlados por `ThemeContext.jsx` via atributo `data-theme` no `<html>`.
- Persistido em `localStorage` com chave `facein-theme`.
- `[data-theme="dark"]` é o padrão. Variáveis sobrescritas em `[data-theme="light"]` no `index.css`.
- O botão toggle fica no `Navbar` (ícone sol/lua).

### Variáveis CSS disponíveis

| Variável | Uso |
|---|---|
| `--bg-base` | Fundo da página |
| `--bg-surface` | Cards, navbar, painéis |
| `--bg-elevated` | Elementos dentro de cards |
| `--border` | Bordas padrão |
| `--border-bright` | Bordas de destaque/foco |
| `--accent` | Cor principal (cyan) |
| `--accent-dim` | Accent mais escuro (hover/disabled) |
| `--accent-glow` | Sombra/glow do accent (rgba) |
| `--success` | Verde para entradas/confirmações |
| `--warning` | Âmbar para alertas |
| `--danger` | Vermelho para erros/destruição |
| `--text-primary` | Texto principal |
| `--text-secondary` | Texto secundário/labels |
| `--text-muted` | Texto desabilitado/placeholders |

### Classes CSS customizadas (index.css)
- `.fi-input` — estilo padrão para todos os `<input>` e `<select>` do sistema
- `.fade-up` — animação de entrada (translateY + opacity)
- `.scan-line` — barra de varredura animada no Painel (câmera ativa)
- `.camera-active-border` — borda pulsante na câmera ativa
- `.status-dot` — indicador piscante de status
- `.entry-card-anim` — slide da direita para entradas no log

### Tipografia
- `Syne` — títulos de página (`fontFamily: 'Syne, sans-serif'`), botões de ação primária
- `DM Sans` — corpo de texto geral (padrão do `body`)
- `JetBrains Mono` — dados técnicos: timestamps, matrículas, porcentagens de confiança, IDs

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

Projeto de TCC/apresentação para banca. O frontend tem estética **"Biometric Control Terminal"** — dark navy + cyan elétrico, visual de sistema de segurança profissional. Público: professores avaliadores e futuros clientes (escolas).

Ao adicionar novas páginas ou componentes, seguir o mesmo padrão visual: `style={{}}` inline com variáveis CSS, fontes Syne/DM Sans/JetBrains Mono, sem classes Tailwind para cor ou tipografia.
