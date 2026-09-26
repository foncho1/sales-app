from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.services.product_service import ProductService

from app.database.session import get_db
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductResponse
from app.core.dependencies import require_roles
from typing import Annotated
from app.schemas.product_filter import ProductFilter
from app.schemas.pagination import PaginatedResponse


#router = APIRouter()

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)
service = ProductService()



@router.post("/", response_model=ProductResponse)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user = Depends (require_roles("ADMIN"))
):

    return service.create_product(
        db,
        product
    )

@router.get("/", response_model=PaginatedResponse[ProductResponse])
def get_products(
    filters: Annotated[ProductFilter, Depends()],
    db: Session = Depends(get_db)
):
    return service.get_all_products(db, filters)

@router.get("/{id}", response_model=ProductResponse)
def get_product(
    id: int,
    db: Session = Depends(get_db)
):

    product = service.get_product(
        db,
        id
    )

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    return product

@router.put("/{id}", response_model=ProductResponse)
def update_product(
    id: int,
    data: ProductCreate,
    db: Session = Depends(get_db),
    current_user = Depends (require_roles("ADMIN"))
):
   return service.update_product(
        db,
        id,
        data
    )

@router.delete("/{id}")
def delete_product(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends (require_roles("ADMIN"))
):
   return service.delete_product(
        db,
        id
    )
