import pytest
from rest_framework.test import APIClient
from api.models import Company, Client

pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def company():
    return Company.objects.create(name="Test Company")


class TestClientsAPI:
    def test_create_client(self, api_client, company):
        response = api_client.post("/api/clients/", {
            "company": str(company.id),
            "contact_name": "Ahmed Test",
            "company_name": "Test SARL",
            "email": "ahmed@test.com",
        }, format="json")

        assert response.status_code == 201
        assert response.data["contact_name"] == "Ahmed Test"

    def test_create_client_missing_company(self, api_client):
        response = api_client.post("/api/clients/", {
            "contact_name": "Ahmed Test",
        }, format="json")

        assert response.status_code == 400
        assert "company" in response.data

    def test_list_clients(self, api_client, company):
        Client.objects.create(company=company, company_name="Client A")
        Client.objects.create(company=company, company_name="Client B")

        response = api_client.get("/api/clients/")

        assert response.status_code == 200
        results = response.data if isinstance(response.data, list) else response.data.get("results", [])
        assert len(results) == 2

    def test_retrieve_client(self, api_client, company):
        client_obj = Client.objects.create(company=company, company_name="Client Détail")

        response = api_client.get(f"/api/clients/{client_obj.id}/")

        assert response.status_code == 200
        assert response.data["company_name"] == "Client Détail"

    def test_update_client(self, api_client, company):
        client_obj = Client.objects.create(company=company, company_name="Ancien Nom")

        response = api_client.patch(f"/api/clients/{client_obj.id}/", {
            "company_name": "Nouveau Nom",
        }, format="json")

        assert response.status_code == 200
        assert response.data["company_name"] == "Nouveau Nom"

    def test_delete_client(self, api_client, company):
        client_obj = Client.objects.create(company=company, company_name="À supprimer")

        response = api_client.delete(f"/api/clients/{client_obj.id}/")

        assert response.status_code == 204
        assert not Client.objects.filter(id=client_obj.id).exists()

    def test_clear_all_clients(self, api_client, company):
        Client.objects.create(company=company, company_name="Client 1")
        Client.objects.create(company=company, company_name="Client 2")

        response = api_client.delete("/api/clients/clear/")

        assert response.status_code == 200
        assert Client.objects.count() == 0