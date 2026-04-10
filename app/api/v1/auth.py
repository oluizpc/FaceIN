from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.usuario_schema import UsuarioCreate, UsuarioResponse, LoginRequest, TokenResponse
from app.services.auth_service import auth_service
from app.dependencies.auth import get_current_user, require_admin
from app.models.usuario import Usuario

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
def login(dados: LoginRequest, db: Session = Depends(get_db)):
    return auth_service.login(db, dados)


@router.post("/registro", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def registrar(
    dados: UsuarioCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    """Somente admin pode criar novos usuários."""
    return auth_service.registrar(db, dados)


@router.post("/primeiro-admin", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def criar_primeiro_admin(dados: UsuarioCreate, db: Session = Depends(get_db)):
    """Cria o admin inicial. Bloqueado automaticamente após o primeiro uso."""
    existe = db.query(Usuario).first()
    if existe:
        raise HTTPException(status_code=403, detail="Sistema já possui usuários cadastrados")
    dados.role = "admin"
    dados.escola_id = None
    return auth_service.registrar(db, dados)


@router.get("/me", response_model=UsuarioResponse)
def me(current_user: Usuario = Depends(get_current_user)):
    return current_user


@router.get("/usuarios", response_model=list[UsuarioResponse])
def listar_usuarios(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    """Somente admin pode listar usuários."""
    return db.query(Usuario).filter(Usuario.ativo == True).all()


@router.delete("/usuarios/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def desativar_usuario(
    usuario_id: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin),
):
    from uuid import UUID
    usuario = db.query(Usuario).filter(Usuario.id == UUID(usuario_id)).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    if str(usuario.id) == str(current_user.id):
        raise HTTPException(status_code=400, detail="Você não pode desativar sua própria conta")
    usuario.ativo = False
    db.commit()
