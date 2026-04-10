from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.usuario import Usuario
from app.schemas.usuario_schema import UsuarioCreate, LoginRequest, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token


class AuthService:

    def registrar(self, db: Session, dados: UsuarioCreate) -> Usuario:
        existe = db.query(Usuario).filter(Usuario.email == dados.email).first()
        if existe:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"E-mail {dados.email} já cadastrado",
            )

        usuario = Usuario(
            nome=dados.nome,
            email=dados.email,
            senha_hash=hash_password(dados.senha),
            role=dados.role,
            escola_id=dados.escola_id,
        )
        db.add(usuario)
        db.commit()
        db.refresh(usuario)
        return usuario

    def login(self, db: Session, dados: LoginRequest) -> TokenResponse:
        usuario = db.query(Usuario).filter(
            Usuario.email == dados.email,
            Usuario.ativo == True,
        ).first()

        if not usuario or not verify_password(dados.senha, usuario.senha_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="E-mail ou senha incorretos",
            )

        token = create_access_token({"sub": str(usuario.id), "role": usuario.role})
        return TokenResponse(access_token=token, usuario=usuario)


auth_service = AuthService()
