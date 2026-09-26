#from fastapi import FastAPI
#from app.database.database import engine
#from contextlib import asynccontextmanager
#from app.database.init_db import create_tables

#from app.routers.products import router as products_router
from fastapi import FastAPI

from app.routers.products import router as products_router
from app.routers.categories import router as categories_router
from app.routers.auth import router as auth_router
from app.routers.orders import router as orders_router
from app.routers.users import router as users_router
from fastapi.responses import JSONResponse
from fastapi import Request
from app.exceptions.base import AppException
from fastapi.middleware.cors import CORSMiddleware

#from app.exceptions.product_exceptions import ProductNotFoundException

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products_router)
app.include_router(categories_router)
app.include_router(auth_router)
app.include_router(orders_router)
app.include_router(users_router)

@app.exception_handler(AppException)
async def product_not_found_handler(
    request: Request,
    exc: AppException
):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.message
        }
    )



