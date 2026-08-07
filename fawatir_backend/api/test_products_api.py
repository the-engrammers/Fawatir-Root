import pytest
from rest_framework.test import APIClient
from api.models import Company, Product

pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def company():
    return Company.objects.create(name="Test Company")


class TestProductsAPI:
    def test_create_product(self, api_client, company):
        response = api_client.post("/api/products/", {
            "company": str(company.id),
            "name": "Ordinateur portable",
            "selling_price": "12000.00",
        }, format="json")

        assert response.status_code == 201
        assert response.data["name"] == "Ordinateur portable"

    def test_create_product_missing_company(self, api_client):
        response = api_client.post("/api/products/", {
            "name": "Produit Sans Company",
        }, format="json")

        assert response.status_code == 400
        assert "company" in response.data

    def test_create_product_missing_name(self, api_client, company):
        response = api_client.post("/api/products/", {
            "company": str(company.id),
        }, format="json")

        assert response.status_code == 400

    def test_list_products(self, api_client, company):
        Product.objects.create(company=company, name="Produit A")
        Product.objects.create(company=company, name="Produit B")

        response = api_client.get("/api/products/")

        assert response.status_code == 200
        results = response.data if isinstance(response.data, list) else response.data.get("results", [])
        assert len(results) == 2

    def test_retrieve_product(self, api_client, company):
        product = Product.objects.create(company=company, name="Produit Détail")

        response = api_client.get(f"/api/products/{product.id}/")

        assert response.status_code == 200
        assert response.data["name"] == "Produit Détail"

    def test_update_product_price(self, api_client, company):
        product = Product.objects.create(company=company, name="Produit", selling_price="100.00")

        response = api_client.patch(f"/api/products/{product.id}/", {
            "selling_price": "150.00",
        }, format="json")

        assert response.status_code == 200
        assert response.data["selling_price"] == "150.00"

    def test_delete_product(self, api_client, company):
        product = Product.objects.create(company=company, name="À supprimer")

        response = api_client.delete(f"/api/products/{product.id}/")

        assert response.status_code == 204
        assert not Product.objects.filter(id=product.id).exists()