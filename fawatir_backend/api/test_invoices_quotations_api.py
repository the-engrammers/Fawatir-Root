import pytest
from decimal import Decimal
from rest_framework.test import APIClient
from api.models import Company, Client, Product, Invoice, InvoiceItem, Quotation

pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def company():
    return Company.objects.create(name="Test Company")


@pytest.fixture
def client_obj(company):
    return Client.objects.create(company=company, company_name="Client Facture")


class TestInvoicesAPI:
    def test_create_invoice(self, api_client, company, client_obj):
        response = api_client.post("/api/invoices/", {
            "company": str(company.id),
            "client": str(client_obj.id),
            "invoice_number": "FAC-TEST-001",
            "status": "Brouillon",
            "subtotal": "1000.00",
            "tax_amount": "200.00",
            "total_amount": "1200.00",
            "balance_due": "1200.00",
        }, format="json")

        assert response.status_code == 201
        assert response.data["invoice_number"] == "FAC-TEST-001"

    def test_invoice_number_must_be_unique(self, api_client, company, client_obj):
        Invoice.objects.create(
            company=company, client=client_obj,
            invoice_number="FAC-DUP-001", total_amount=Decimal("500.00"),
        )

        response = api_client.post("/api/invoices/", {
            "company": str(company.id),
            "client": str(client_obj.id),
            "invoice_number": "FAC-DUP-001",
            "total_amount": "300.00",
        }, format="json")

        assert response.status_code == 400

    def test_create_invoice_item_linked_to_product(self, api_client, company, client_obj):
        invoice = Invoice.objects.create(
            company=company, client=client_obj, invoice_number="FAC-ITEM-API",
        )
        product = Product.objects.create(company=company, name="Article Test")

        response = api_client.post("/api/invoice-items/", {
            "invoice": str(invoice.id),
            "product": str(product.id),
            "quantity": "2",
            "unit_price": "150.00",
            "line_total": "300.00",
        }, format="json")

        assert response.status_code == 201
        assert InvoiceItem.objects.filter(invoice=invoice).count() == 1

    def test_mark_invoice_as_paid(self, api_client, company, client_obj):
        invoice = Invoice.objects.create(
            company=company, client=client_obj, invoice_number="FAC-PAY-001",
            status="Envoyée", total_amount=Decimal("500.00"), balance_due=Decimal("500.00"),
        )

        response = api_client.patch(f"/api/invoices/{invoice.id}/", {
            "status": "Payée",
            "balance_due": "0.00",
        }, format="json")

        assert response.status_code == 200
        assert response.data["status"] == "Payée"
        assert response.data["balance_due"] == "0.00"


class TestQuotationsAPI:
    def test_create_quotation(self, api_client, company, client_obj):
        response = api_client.post("/api/quotations/", {
            "company": str(company.id),
            "client": str(client_obj.id),
            "quotation_number": "DEV-TEST-001",
            "status": "Brouillon",
            "total_amount": "800.00",
        }, format="json")

        assert response.status_code == 201
        assert response.data["quotation_number"] == "DEV-TEST-001"

    def test_quotation_client_name_uses_contact_name_fallback(self, api_client, company):
        client_sans_entreprise = Client.objects.create(
            company=company, contact_name="Client Sans Entreprise",
        )
        quotation = Quotation.objects.create(
            company=company, client=client_sans_entreprise, quotation_number="DEV-FALLBACK-001",
        )

        response = api_client.get(f"/api/quotations/{quotation.id}/")

        assert response.status_code == 200
        assert response.data["client_name"] == "Client Sans Entreprise"

    def test_clear_all_quotations(self, api_client, company, client_obj):
        Quotation.objects.create(company=company, client=client_obj, quotation_number="DEV-C1")
        Quotation.objects.create(company=company, client=client_obj, quotation_number="DEV-C2")

        response = api_client.delete("/api/quotations/clear/")

        assert response.status_code == 200
        assert Quotation.objects.count() == 0