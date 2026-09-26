from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.user_service import UserService
from app.schemas.user import UserResponse, UserUpdate
from app.core.dependencies import require_roles
from app.models.user import User

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

service = UserService()


@router.get(
    "/",
    response_model=list[UserResponse]
)
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN"))
):
    return service.get_all(db)


@router.put(
    "/{id}",
    response_model=UserResponse
)
def update_user(
    id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN"))
):
    return service.update_user(
        db,
        id,
        data
    )


@router.delete("/{id}")
def delete_user(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN"))
):
    service.delete_user(
        db,
        id,
        current_user.id
    )

    return {
        "message": "Usuario eliminado"
    }
