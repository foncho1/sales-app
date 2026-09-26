from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.user_service import UserService
from app.schemas.user import (
    UserCreate,
    UserResponse,
    Token
)
from app.core.dependencies import get_current_user, require_roles
from app.models.user import User
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

service = UserService()


@router.post(
    "/register",
    response_model=UserResponse
)
def register(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN"))
):
    return service.create_user(
        db,
        data
    )

@router.post(
    "/login",
    response_model=Token
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    return service.login(
        db,
        form_data
    )

@router.get(
    "/me",
    response_model=UserResponse
)
def me(
    current_user: User = Depends(get_current_user)
):
    return current_user