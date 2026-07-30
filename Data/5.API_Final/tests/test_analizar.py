from core.patch import apply_pydantic_patch
apply_pydantic_patch()

import pytest
from fastapi.testclient import TestClient
from main import app
from core import config

client = TestClient(app)

def test_analizar_endpoint_mock():
    """
    Prueba el endpoint /analyze con USE_MOCK=True para no gastar cuota de Gemini.
    Verifica que el contrato de respuesta y el status code sean correctos.
    """
    # Forzamos Mock temporalmente para este test
    config.USE_MOCK = True
    
    payload = {
        "titulo": "Implementación de Spring Boot",
        "texto": "Este documento trata sobre la inyección de dependencias en Spring Boot y Java 17.",
        "doc_id": "doc_test_123"
    }
    
    response = client.post("/api/v1/analyze", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["Titulo"] == "Implementación de Spring Boot"
    assert data["Categoria"] == "Backend" # Valor hardcodeado en el mock
    assert "doc_id" in data
    assert "trace_id" in data
    assert "version" in data
    assert type(data["keywords"]) == list

@pytest.mark.skipif(not config.GEMINI_API_KEY, reason="Se requiere GEMINI_API_KEY en el .env")
def test_analizar_endpoint_real():
    """
    Prueba real contra Gemini. Verifica que la IA realmente responda 
    con el JSON esperado por el esquema.
    """
    config.USE_MOCK = False
    
    payload = {
        "titulo": "Seguridad en Redes",
        "texto": "Configuración de firewalls y prevención de ataques DDoS en AWS y OCI.",
        "doc_id": "doc_test_real_456"
    }
    
    response = client.post("/api/v1/analyze", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    assert "doc_id" in data
    assert data["Categoria"] != "Desconocida" # Asume que Gemini pudo clasificarlo
    assert "trace_id" in data
