from fastapi import status

from app.exceptions.base import AppException


class NotFoundException(AppException):

    def __init__(self, resource: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            message=f"{resource} no encontrado"
        )