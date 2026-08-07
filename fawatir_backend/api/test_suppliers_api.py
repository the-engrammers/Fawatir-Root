import pytest
from rest_framework.test import APIClient
from api.models import Company, Supplier

pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def company():
    return Company.objects.create(name="Test Company")


class TestSuppliersAPI:
    def test_create_supplier(self, api_client, company):
        response = api_client.post("/api/suppliers/", {
            "company": str(company.id),
            "company_name": "Fournisseur Test",
            "contact_name": "Sara Contact",
            "email": "sara@fournisseur.com",
        }, format="json")

        assert response.status_code == 201
        assert response.data["company_name"] == "Fournisseur Test"

    def test_create_supplier_missing_company(self, api_client):
        response = api_client.post("/api/suppliers/", {
            "company_name": "Fournisseur Sans Company",
        }, format="json")

        assert response.status_code == 400

    def test_list_suppliers(self, api_client, company):
        Supplier.objects.create(company=company, company_name="Four A")
        Supplier.objects.create(company=company, company_name="Four B")

        response = api_client.get("/api/suppliers/")

        assert response.status_code == 200
        results = response.data if isinstance(response.data, list) else response.data.get("results", [])
        assert len(results) == 2

    def test_update_supplier(self, api_client, company):
        supplier = Supplier.objects.create(company=company, company_name="Ancien")

        response = api_client.patch(f"/api/suppliers/{supplier.id}/", {
            "company_name": "Nouveau",
        }, format="json")

        assert response.status_code == 200
        assert response.data["company_name"] == "Nouveau"

    def test_delete_supplier(self, api_client, company):
        supplier = Supplier.objects.create(company=company, company_name="À supprimer")

        response = api_client.delete(f"/api/suppliers/{supplier.id}/")

        assert response.status_code == 204

    def test_clear_all_suppliers(self, api_client, company):
        Supplier.objects.create(company=company, company_name="F1")
        Supplier.objects.create(company=company, company_name="F2")

        response = api_client.delete("/api/suppliers/clear/")

        assert response.status_code == 200
        assert Supplier.objects.count() == 0