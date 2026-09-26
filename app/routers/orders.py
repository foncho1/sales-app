from fastapi import (
    APIRouter,
    Depends,
    Response
)

from sqlalchemy.orm import Session

from app.database.session import get_db

from app.schemas.order import OrderCreate, OrderResponse

from app.services.order_service import OrderService
from app.services.invoice_service import InvoiceService
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.order_status import OrderStatusUpdate
from app.core.dependencies import require_roles

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

service = OrderService()
invoice_service = InvoiceService()

@router.post("/", response_model=OrderResponse)
def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return service.create_order(
        db=db,
        user_id=current_user.id,
        data=data
    )

@router.get("/",response_model=list[OrderResponse])
def get_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return service.get_orders(db, current_user)

@router.get("/{order_id}",response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return service.get_order(
        db,
        order_id,
        current_user
    )

@router.get("/{order_id}/invoice")
def get_order_invoice(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    order = service.get_order(
        db,
        order_id,
        current_user
    )

    pdf_bytes = invoice_service.generate_invoice_pdf(
        order
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                f'attachment; filename="factura-{order.id}.pdf"'
        }
    )

@router.delete("/{order_id}", response_model=OrderResponse)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return service.cancel_order(
        db,
        order_id,
        current_user
    )

@router.patch("/{order_id}/status",response_model=OrderResponse)
def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("ADMIN")
    )
):

    return service.update_status(
        db,
        order_id,
        data
    )