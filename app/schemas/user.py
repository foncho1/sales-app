from pydantic import BaseModel, EmailStr, Field
from typing import Literal


class UserCreate(BaseModel):

    username: str = Field(
        min_length=3,
        max_length=50
    )

    email: EmailStr

    password: str = Field(
        min_length=6
    )

    role: Literal["USER", "ADMIN"] = "USER"

class UserUpdate(BaseModel):

    username: str = Field(
        min_length=3,
        max_length=50
    )

    email: EmailStr

    role: Literal["USER", "ADMIN"] = "USER"

class LoginRequest(BaseModel):

    email: EmailStr

    password: str

class Token(BaseModel):

    access_token: str

    token_type: str

class UserResponse(BaseModel):

    id: int
    username: str
    email: EmailStr
    is_active: bool
    is_admin: bool
    role: str

    model_config = {
        "from_attributes": True
    }