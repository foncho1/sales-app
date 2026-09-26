from pydantic import BaseModel, Field
from app.enums.product_sort import ProductSort


class ProductFilter(BaseModel):

    skip: int = Field(
        default=0,
        ge=0
    )

    limit: int = Field(
        default=10,
        ge=1,
        le=100
    )

    search: str | None = None

    category_id: int | None = None

    min_price: float | None = None

    max_price: float | None = None

    sort: ProductSort | None = None