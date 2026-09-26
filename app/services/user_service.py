from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserUpdate
from app.exceptions.not_found import NotFoundException
from app.core.security import hash_password, verify_password
from app.core.jwt import create_access_token
from fastapi.security import OAuth2PasswordRequestForm


class UserService:

    def __init__(self):
        self.repository = UserRepository()

    def get_by_id(
        self,
        db: Session,
        user_id: int
    ):
        return self.repository.get_by_id(
            db,
            user_id
        )

    def create_user(
        self,
        db: Session,
        data: UserCreate
    ):

        email_exists = self.repository.get_by_email(
            db,
            data.email
        )

        if email_exists:
            raise ValueError(
                "El correo ya está registrado"
            )

        username_exists = self.repository.get_by_username(
            db,
            data.username
        )

        if username_exists:
            raise ValueError(
                "El nombre de usuario ya existe"
            )

        user = User(
            username=data.username,
            email=data.email,
            hashed_password=hash_password(data.password),
            role=data.role,
            is_admin=(data.role == "ADMIN")
        )


        return self.repository.create(
            db,
            user
        )

    def get_all(
        self,
        db: Session
    ):
        return self.repository.get_all(db)

    def update_user(
        self,
        db: Session,
        user_id: int,
        data: UserUpdate
    ):

        user = self.repository.get_by_id(
            db,
            user_id
        )

        if user is None:
            raise NotFoundException(
                "Usuario"
            )

        email_exists = self.repository.get_by_email(
            db,
            data.email
        )

        if email_exists and email_exists.id != user_id:
            raise HTTPException(
                status_code=409,
                detail="El correo ya está registrado"
            )

        username_exists = self.repository.get_by_username(
            db,
            data.username
        )

        if username_exists and username_exists.id != user_id:
            raise HTTPException(
                status_code=409,
                detail="El nombre de usuario ya existe"
            )

        user.username = data.username
        user.email = data.email
        user.role = data.role
        user.is_admin = (data.role == "ADMIN")

        return self.repository.update(
            db,
            user
        )

    def delete_user(
        self,
        db: Session,
        user_id: int,
        current_user_id: int
    ):

        user = self.repository.get_by_id(
            db,
            user_id
        )

        if user is None:
            raise NotFoundException(
                "Usuario"
            )

        if user.id == current_user_id:
            raise HTTPException(
                status_code=400,
                detail="No puedes eliminar tu propio usuario"
            )

        self.repository.delete(
            db,
            user
        )

    def login(
        self,
        db: Session,
        data: OAuth2PasswordRequestForm
    ):

        user = self.repository.get_by_email(
            db,
            data.username
        )

        if user is None:
            raise HTTPException(
                status_code=401,
                detail="Correo o contraseña incorrectos"
            )

        if not verify_password(
            data.password,
            user.hashed_password
        ):
            raise HTTPException(
                status_code=401,
                detail="Correo o contraseña incorrectos"
            )

        token = create_access_token(
            {
                "sub": str(user.id),
                "role": user.role
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer"
        }