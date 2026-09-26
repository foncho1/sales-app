from app.database.database import engine
from app.models.base import Base

from app.models.product import Product

def create_tables():
    Base.metadata.create_all(bind=engine)