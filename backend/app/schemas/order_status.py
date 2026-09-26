from pydantic import BaseModel
from typing import Literal


class OrderStatusUpdate(BaseModel):

    status: Literal[
        "PENDING",
        "PAID",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED"
    ]