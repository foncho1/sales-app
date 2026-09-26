from sqlalchemy.orm import Session, selectinload

from app.models.order import Order
from sqlalchemy import select
from app.models.order_item import OrderItem

from sqlalchemy.orm import selectinload

class OrderRepository:

    def create(
        self,
        db: Session,
        order: Order
    ):

        db.add(order)
        db.commit()
        db.refresh(order)

        return order

    def get_by_id(
        self,
        db: Session,
        order_id: int
    ):

        statement = (
            select(Order)
            .options(
                selectinload(Order.items)
                .selectinload(OrderItem.product),
                selectinload(Order.user)
        )
        .where(Order.id == order_id)
        )

        return db.scalar(statement)

    def get_all(
        self,
        db: Session
    ):
        statement = (
            select(Order)
            .options(
                selectinload(Order.items)
                .selectinload(OrderItem.product)
            )
        )

        return db.scalars(statement).all()

    def get_by_user(
        self,
        db: Session,
        user_id: int
    ):
        statement = (
            select(Order)
            .options(
                selectinload(Order.items)
                .selectinload(OrderItem.product)
            )
            .where(Order.user_id == user_id)
        )

        return db.scalars(statement).all()

    def update(
        self,
        db: Session,
        order: Order
    ):
        db.commit()
        db.refresh(order)

        return order

    def delete(
        self,
        db: Session,
        order: Order
    ):
        db.delete(order)
        db.commit()