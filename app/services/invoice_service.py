from fpdf import FPDF

from app.models.order import Order


class InvoiceService:

    def generate_invoice_pdf(
        self,
        order: Order
    ) -> bytes:

        pdf = FPDF(unit="mm", format="A4")

        pdf.set_auto_page_break(
            auto=True,
            margin=15
        )

        pdf.add_page()

        self._draw_header(pdf, order)
        self._draw_customer(pdf, order)
        self._draw_items_table(pdf, order)
        self._draw_total(pdf, order)

        return bytes(pdf.output())

    def _draw_header(
        self,
        pdf: FPDF,
        order: Order
    ) -> None:

        pdf.set_font("Helvetica", "B", 22)
        pdf.cell(0, 12, "FACTURA")
        pdf.ln(10)

        pdf.set_font("Helvetica", "", 10)
        pdf.cell(0, 6, "SalesApp")
        pdf.ln(6)

        pdf.set_font("Helvetica", "", 11)

        pdf.cell(0, 6, f"Factura N.: {order.id:06d}")
        pdf.ln(6)

        pdf.cell(
            0,
            6,
            f"Fecha: {order.created_at.strftime('%d/%m/%Y %H:%M')}"
        )
        pdf.ln(6)

        pdf.cell(0, 6, f"Estado: {order.status}")
        pdf.ln(10)

    def _draw_customer(
        self,
        pdf: FPDF,
        order: Order
    ) -> None:

        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 6, "Cliente")
        pdf.ln(6)

        pdf.set_font("Helvetica", "", 11)

        pdf.cell(0, 6, order.user.username)
        pdf.ln(6)

        pdf.cell(0, 6, order.user.email)
        pdf.ln(10)

    def _draw_items_table(
        self,
        pdf: FPDF,
        order: Order
    ) -> None:

        column_widths = [80, 25, 35, 35]

        headers = [
            "Producto",
            "Cantidad",
            "Precio unitario",
            "Subtotal"
        ]

        pdf.set_font("Helvetica", "B", 10)
        pdf.set_fill_color(240, 240, 240)

        for width, header in zip(column_widths, headers):

            pdf.cell(
                width,
                8,
                header,
                border=1,
                fill=True
            )

        pdf.ln(8)

        pdf.set_font("Helvetica", "", 10)

        for item in order.items:

            subtotal = item.price * item.quantity

            pdf.cell(
                column_widths[0],
                8,
                item.product.name,
                border=1
            )

            pdf.cell(
                column_widths[1],
                8,
                str(item.quantity),
                border=1,
                align="C"
            )

            pdf.cell(
                column_widths[2],
                8,
                f"${item.price:.2f}",
                border=1,
                align="R"
            )

            pdf.cell(
                column_widths[3],
                8,
                f"${subtotal:.2f}",
                border=1,
                align="R"
            )

            pdf.ln(8)

    def _draw_total(
        self,
        pdf: FPDF,
        order: Order
    ) -> None:

        pdf.ln(4)

        pdf.set_font("Helvetica", "B", 12)

        pdf.cell(140, 8, "TOTAL", align="R")

        pdf.cell(
            35,
            8,
            f"${order.total:.2f}",
            align="R"
        )
