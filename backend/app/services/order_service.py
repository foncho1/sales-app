from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.exceptions.not_found import NotFoundException

from app.models.order import Order
from app.models.order_item import OrderItem

from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository
from app.models.user import User
from app.schemas.order_status import OrderStatusUpdate

from app.schemas.order import OrderCreate


VALID_STATUS_TRANSITIONS = {
    "PENDING": [
    "PAID",
    "CANCELLED"
    ],
    "PAID": [
    "SHIPPED"
    ],
    "SHIPPED": [
    "DELIVERED"
    ],
    "DELIVERED": [],
    "CANCELLED": []
}

class OrderService:

    def __init__(self):

        self.order_repository = OrderRepository()

        self.product_repository = ProductRepository()

    def create_order(
        self,
        db: Session,
        user_id: int,
        data: OrderCreate
    ):

        order = Order(
        user_id=user_id,
        total=0,
        status="PENDING"
        )

        db.add(order)

        db.flush()

        total = 0

        for item in data.items:

            product = self.product_repository.get_by_id(
                db,
                item.product_id
            )

            if product is None:
                raise HTTPException(
                    status_code=404,
                    detail=f"Producto {item.product_id} no encontrado"
                )

            if item.quantity <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="La cantidad debe ser mayor que cero"
                )

            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente para {product.name}"
                )

            subtotal = product.price * item.quantity

            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=item.quantity,
                price=product.price
            )

            db.add(order_item)

            product.stock -= item.quantity

            total += subtotal

        order.total = total

        db.commit()

        db.refresh(order)

        return order

    def get_orders(
        self,
        db: Session,
        current_user:User
    ):
         if current_user.role == "ADMIN":
            return self.order_repository.get_all(db)

         return self.order_repository.get_by_user(
             db,
             current_user.id
            )

    def get_order(
        self,
        db: Session,
        order_id: int,
        current_user:User
    ):

        order = self.order_repository.get_by_id(
            db,
            order_id
        )

        if order is None:
            raise NotFoundException(
                "Pedido"
            )

        if (
            current_user.role != "ADMIN"
            and order.user_id != current_user.id
    ):
         raise HTTPException(
            status_code=403,
            detail="No tienes permisos para ver este pedido"
        )

        return order

    def update_status(
        self,
        db: Session,
        order_id: int,
        data: OrderStatusUpdate
    ):

        order = self.order_repository.get_by_id(
            db,
            order_id
        )

        if order is None:
            raise NotFoundException(
                "Pedido"
            )

        allowed = VALID_STATUS_TRANSITIONS[
            order.status
        ]

        if data.status not in allowed:
            raise HTTPException(
                status_code=400,
                detail=( f"No se puede cambiar de " f"{order.status} a {data.status}")
            )

        order.status = data.status

        return self.order_repository.update(
            db,
            order
        )

    def cancel_order(
        self,
        db: Session,
        order_id: int,
        current_user: User
    ):
        order = self.order_repository.get_by_id(
        db,
        order_id
        )

        if order is None:
            raise NotFoundException(
                "Pedido"
            )

        if (
            current_user.role != "ADMIN"
            and order.user_id != current_user.id
        ):
            raise HTTPException(
                status_code=403,
                detail="No tienes permisos para cancelar este pedido"
            )

        if order.status != "PENDING":
            raise HTTPException(
                status_code=400,
                detail="Solo se pueden cancelar pedidos pendientes"
            )

        for item in order.items:

            item.product.stock += item.quantity

        order.status = "CANCELLED"

        db.commit()
        db.refresh(order)

        return order