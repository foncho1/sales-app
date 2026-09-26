from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.jwt import verify_token
from app.repositories.user_repository import UserRepository


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Token inválido"
        )


    user_id = payload.get("sub")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Token inválido"
        )


    repository = UserRepository()

    user = repository.get_by_id(
        db,
        int(user_id)
    )


    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Usuario no encontrado"
        )


    return user


def require_roles(*roles: str):

    def role_checker(
        current_user=Depends(get_current_user)
    ):

        if current_user.role not in roles:

            raise HTTPException(
                status_code=403,
                detail="No tienes permisos para realizar esta acción"
            )


        return current_user


    return role_checker