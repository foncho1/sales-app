from pydantic import BaseModel, Field, ConfigDict

from app.schemas.category import CategoryResponse


class ProductCreate(BaseModel):
    name: str = Field(
        min_length=3,
        max_length=100
    )

    price: float = Field(
        gt=0
    )

    stock: int = Field(
        ge=0
    )

    category_id: int = Field(
        gt=0
    )


class ProductResponse(BaseModel):
    id: int
    name: str
    price: float
    stock: int
    category: CategoryResponse

    model_config = {
        "from_attributes": True
    }

class ProductSummaryResponse(BaseModel):

    id: int

    name: str

    model_config = ConfigDict(
        from_attributes=True
    )