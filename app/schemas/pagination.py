from typing import Generic, TypeVar
import math

from pydantic import BaseModel, ConfigDict


T = TypeVar("T")


class PaginatedResponse(
    BaseModel,
    Generic[T]
):

    items: list[T]

    total: int

    skip: int

    limit: int

    page: int

    pages: int

    has_next: bool

    has_previous: bool

    model_config = ConfigDict(
        from_attributes=True
    )

    @classmethod
    def create(
        cls,
        items: list[T],
        total: int,
        skip: int,
        limit: int
    ):

        page = (skip // limit) + 1

        pages = math.ceil(total / limit) if limit > 0 else 1

        return cls(
            items=items,
            total=total,
            skip=skip,
            limit=limit,
            page=page,
            pages=pages,
            has_next=(skip + limit) < total,
            has_previous=skip > 0
        )