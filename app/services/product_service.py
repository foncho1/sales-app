from sqlalchemy.orm import Session
from fastapi import HTTPException

#from app.exceptions.product_exceptions import ProductNotFoundException
from app.exceptions.not_found import NotFoundException
from app.services.category_service import CategoryService
from app.models.product import Product
from app.repositories.product_repository import ProductRepository
from app.schemas.product import ProductCreate, ProductResponse
from app.schemas.product_filter import ProductFilter
from app.schemas.pagination import PaginatedResponse


class ProductService:

    def __init__(self):
        self.repository = ProductRepository()
        self.category_service = CategoryService()

    def get_all_products(
        self,
        db: Session,
        filters: ProductFilter):

            total, items = self.repository.get_all(
            db,
            filters
        )

            return PaginatedResponse[ProductResponse].create(
                items=items,
                total=total,
                skip=filters.skip,
                limit=filters.limit
            )

    def get_product(
        self,
        db: Session,
        product_id: int
    ):
        return self.repository.get_by_id(
            db,
            product_id
        )

    def create_product(
        self,
        db: Session,
        data: ProductCreate
    ):

        category = self.category_service.get_by_id(
        db,
        data.category_id
         )

        if category is None:
         raise NotFoundException("Categoría")

        product = Product(
            name=data.name,
            price=data.price,
            stock=data.stock,
            category_id=data.category_id
        )

        return self.repository.create(
            db,
            product
        )

    def update_product(
        self,
        db: Session,
        product_id: int,
        data: ProductCreate
    ):
        product = self.repository.get_by_id(db, product_id)

        if product is None:
            raise NotFoundException("Producto")

        category = self.category_service.get_by_id(
            db,
            data.category_id
        )

        if category is None:
            raise HTTPException(
             status_code=404,
             detail="La categoría no existe"
            )

        product.name = data.name
        product.price = data.price
        product.stock = data.stock
        product.category_id = data.category_id

        return self.repository.update(db, product)


    def delete_product(
        self,
        db: Session,
        product_id: int
    ):
        product = self.repository.get_by_id(db, product_id)

        if product is None:
           raise NotFoundException("Producto")

        self.repository.delete(db, product)

        return {
            "message": "Producto eliminado correctamente"
        }