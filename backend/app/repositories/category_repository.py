from sqlalchemy.orm import Session

from app.models.category import Category
from app.repositories.base_repository import BaseRepository


class CategoryRepository(BaseRepository[Category]):

    def __init__(self):
        super().__init__(Category)

    def get_all(self, db: Session):
        return db.query(Category).all()

   # def create(self, db: Session, category: Category):
    #    db.add(category)
     #   db.commit()
      #  db.refresh(category)

       # return category

   # def get_by_id(self, db: Session, category_id: int):
    #    return db.get(Category, category_id)

    #def update(
     #   self,
      #  db: Session,
       # category: Category
    #):
     #   db.commit()
      #  db.refresh(category)

       # return category


    #def delete(
     #   self,
      #  db: Session,
       # category: Category
    #):
     #   db.delete(category)
      #  db.commit()