from core.patch import apply_pydantic_patch
apply_pydantic_patch()

import pytest
from fastapi.testclient import TestClient
from main import app
from core import config

client = TestClient(app)

def test_buscar_semantica_mock():
    """
    Verifica que el endpoint /search funcione correctamente en modo MOCK,
    retornando la estructura JSON esperada (RecomendacionResponse).
    """
    config.USE_MOCK = True
    payload = {
        "query": "quiero aprender java",
        "top_k": 3
    }
    
    response = client.post("/api/v1/search", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert "resultados" in data
    assert "trace_id" in data
    assert isinstance(data["resultados"], list)
    
    if len(data["resultados"]) > 0:
        primer_resultado = data["resultados"][0]
        assert "doc_id" in primer_resultado
        assert "title" in primer_resultado
        assert "similarity_score" in primer_resultado

def test_buscar_parecido_mock():
    """
    Verifica que el endpoint /recommend funcione correctamente en modo MOCK,
    buscando por ID de documento.
    """
    config.USE_MOCK = True
    payload = {
        "doc_id": "documento_falso_123",
        "top_k": 2
    }
    
    response = client.post("/api/v1/recommend", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert "resultados" in data
    assert isinstance(data["resultados"], list)
    
def test_search_validation_error():
    """
    Verifica que se levante 422 si falta el query.
    """
    payload = {
        "top_k": 5
    }
    response = client.post("/api/v1/search", json=payload)
    assert response.status_code == 422
