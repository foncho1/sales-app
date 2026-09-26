from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.category import CategoryCreate, CategoryResponse
from app.services.category_service import CategoryService
from app.core.dependencies import require_roles

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)

service = CategoryService()


@router.get("/", response_model=list[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return service.get_all(db)


@router.post(
    "/",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED
)
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("ADMIN") )
):
    return service.create(db, data)

@router.put(
    "/{id}",
    response_model=CategoryResponse
)
def update_category(
    id: int,
    data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("ADMIN"))
):
    return service.update_category(
        db,
        id,
        data
    )

@router.delete("/{id}")
def delete_category(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("ADMIN"))
):
    service.delete_category(
        db,
        id
    )

    return {
        "message": "Categoría eliminada"
    }