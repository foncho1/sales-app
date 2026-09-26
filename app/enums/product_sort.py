from enum import Enum


class ProductSort(str, Enum):

    NAME_ASC = "name_asc"

    NAME_DESC = "name_desc"

    PRICE_ASC = "price_asc"

    PRICE_DESC = "price_desc"