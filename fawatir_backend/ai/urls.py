from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CashflowForecastView, DocumentViewSet, SpreadsheetImportViewSet, FastSpreadsheetMappingView, AIChatView

router = DefaultRouter()
router.register(r'documents', DocumentViewSet)
router.register(r'spreadsheets', SpreadsheetImportViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('chat/', AIChatView.as_view(), name='chat'),
    path('fast-mapping/', FastSpreadsheetMappingView.as_view(), name='fast-mapping'),
    path('forecast/', CashflowForecastView.as_view(), name='cashflow-forecast'),
]
