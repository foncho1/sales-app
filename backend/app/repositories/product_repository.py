from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload

from app.models.product import Product
from app.schemas.product_filter import ProductFilter
from app.enums.product_sort import ProductSort
from app.repositories.base_repository import BaseRepository


class ProductRepository ( BaseRepository[Product]):


    def __init__(self):
        super().__init__(Product)

    def get_all(self, db: Session,filters: ProductFilter):
        query = (
        db.query(Product)
        .options(
            joinedload(Product.category)
        )
    )

        if filters.search:

            search = filters.search.strip()

            if search:

                query = query.filter(
                    Product.name.ilike(f"%{search}%")
                )

        if filters.category_id is not None:

            query = query.filter(
                Product.category_id == filters.category_id
            )

        if filters.min_price is not None:

            query = query.filter(
            Product.price >= filters.min_price
            )

        if filters.max_price is not None:

            query = query.filter(
                Product.price <= filters.max_price
            )

        if filters.sort == ProductSort.NAME_ASC:

            query = query.order_by(Product.name)

        elif filters.sort == ProductSort.NAME_DESC:

            query = query.order_by(Product.name.desc())

        elif filters.sort == ProductSort.PRICE_ASC:

            query = query.order_by(Product.price)

        elif filters.sort == ProductSort.PRICE_DESC:

            query = query.order_by(Product.price.desc())


        total = query.count()

        items = (
            query
            .offset(filters.skip)
            .limit(filters.limit)
            .all()
        )

        return total, items


   # def get_by_id(
    #    self,
     #   db: Session,
    #    product_id: int
    #):
     #    return (
     #   db.query(Product)
     #   .options(joinedload(Product.category))
      #  .filter(Product.id == product_id)
      #  .first()
       # )

  #  def create(
   #     self,
    #    db: Session,
    #    product: Product
   # ):
    #    db.add(product)
    #    db.commit()
      #  db.refresh(product)

     #   return product

   # def update(
     #   self,
     #   db: Session,
      #  product: Product
   # ):
     #   db.commit()
     #   db.refresh(product)

     #   return product

   # def delete(
   #     self,
   #     db: Session,
   #     product: Product
    #):
    #    db.delete(product)
    #    db.commit()