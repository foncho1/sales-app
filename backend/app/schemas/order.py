from pydantic import BaseModel, ConfigDict
from app.schemas.product import ProductSummaryResponse
from datetime import datetime


class OrderItemCreate(BaseModel):

    product_id: int

    quantity: int


class OrderCreate(BaseModel):

    items: list[OrderItemCreate]

class OrderItemResponse(BaseModel):

    quantity: int

    price: float

    product: ProductSummaryResponse

    model_config = ConfigDict(
        from_attributes=True
    )

class OrderResponse(BaseModel):

    id: int

    user_id: int

    total: float

    status: str

    created_at: datetime

    updated_at: datetime

    items: list[OrderItemResponse]

    model_config = ConfigDict(
        from_attributes=True
    )