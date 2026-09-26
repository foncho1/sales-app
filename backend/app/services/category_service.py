from sqlalchemy.orm import Session

from app.models.category import Category
from app.exceptions.not_found import NotFoundException
from app.repositories.category_repository import CategoryRepository
from app.schemas.category import CategoryCreate


class CategoryService:

    def __init__(self):
        self.repository = CategoryRepository()

    def get_all(self, db: Session):
        return self.repository.get_all(db)

    def create(self, db: Session, category_data: CategoryCreate):
        category = Category(
            name=category_data.name
        )

        return self.repository.create(db, category)

    def get_by_id(self, db: Session, category_id: int):
        return self.repository.get_by_id(db, category_id)

    def update_category(
        self,
        db: Session,
        category_id: int,
        data: CategoryCreate
    ):
        category = self.repository.get_by_id(
            db,
            category_id
        )

        if category is None:
            raise NotFoundException(
                "Categoría no encontrada"
            )

        category.name = data.name

        return self.repository.update(
            db,
            category
        )

    def delete_category(
        self,
        db: Session,
        category_id: int
    ):
        category = self.repository.get_by_id(
            db,
            category_id
        )

        if category is None:
            raise NotFoundException(
                "Categoría no encontrada"
            )

        self.repository.delete(
            db,
            category
        )