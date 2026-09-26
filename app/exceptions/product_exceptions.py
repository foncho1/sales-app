class ProductNotFoundException(Exception):

    def __init__(self):
        self.message = "Producto no encontrado"
        super().__init__(self.message)