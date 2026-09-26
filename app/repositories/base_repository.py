from typing import Generic
from typing import Type
from typing import TypeVar

from sqlalchemy.orm import Session


T = TypeVar("T")


class BaseRepository(
    Generic[T]
):

    def __init__(
        self,
        model: Type[T]
    ):
        self.model = model

    def get_by_id(
        self,
        db: Session,
        id: int
    ):

        return (
            db.query(self.model)
            .filter(
                self.model.id == id
            )
            .first()
        )

    def create(
        self,
        db: Session,
        obj: T
    ):

        db.add(obj)

        db.commit()

        db.refresh(obj)

        return obj

    def delete(
        self,
        db: Session,
        obj: T
    ):

        db.delete(obj)

        db.commit()

    def update(
        self,
        db: Session,
        obj: T
    ):

        db.commit()

        db.refresh(obj)

        return obj