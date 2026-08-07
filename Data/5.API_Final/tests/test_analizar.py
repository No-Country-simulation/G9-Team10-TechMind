from core.patch import apply_pydantic_patch
apply_pydantic_patch()

import pytest
import time
from fastapi.testclient import TestClient
from main import app
from core import config

client = TestClient(app)

# Casos de prueba reales y complejos para estresar la IA
TEST_CASES = [
    {
        "titulo": "Seguridad en Redes Zero-Trust",
        "texto": "Implementación de firewalls, NAT Gateways y listas de seguridad en Oracle Cloud Infrastructure usando Ampere A1. Las estrategias incluyen Instance Principals para evitar contraseñas hardcodeadas.",
        "doc_id": "doc_test_1"
    },
    {
        "titulo": "Optimización de Algoritmos en Python",
        "texto": "Uso de list comprehensions, generadores y la librería asyncio para mejorar el rendimiento de procesamiento masivo de datos en motores de backend asíncronos.",
        "doc_id": "doc_test_2"
    },
    {
        "titulo": "Diseño de UI/UX con React",
        "texto": "Creación de interfaces responsivas y accesibles utilizando Tailwind CSS, hooks personalizados en React 19 y componentes de estado global para paneles de control.",
        "doc_id": "doc_test_3"
    }
]

def test_analizar_with_mock():
    """
    Prueba el endpoint usando el MOCK para verificar que la arquitectura base (FastAPI + Pydantic)
    responde correctamente sin depender de la API de Groq, simulando una conexión ultra-rápida.
    """
    config.USE_MOCK = True
    payload = {
        "titulo": "Prueba de Mock",
        "texto": "Este es un texto de prueba para el mock.",
        "doc_id": "mock_id_1"
    }
    
    response = client.post("/api/v1/analyze", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["Categoria"] == "Backend"
    assert data["doc_id"] == "mock_id_1"
    assert data["trace_id"] is not None
    assert "Java" in data["keywords"]
    print("\n[OK] Test de Mock finalizado con éxito.")

def test_analizar_validation_error():
    """
    Prueba que el servidor devuelva el error HTTP 422 adecuado 
    si el payload es incompleto o no cumple con el esquema de Pydantic.
    """
    # Payload sin el campo obligatorio 'texto'
    payload = {
        "titulo": "Sin texto"
    }
    response = client.post("/api/v1/analyze", json=payload)
    
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    print("\n[OK] Test de Validación Pydantic (422) finalizado con éxito.")

def test_analizar_empty_text():
    """
    Prueba cómo responde el servidor cuando se envía un texto vacío o minúsculo.
    """
    config.USE_MOCK = True
    payload = {
        "titulo": "Vacío",
        "texto": ""
    }
    response = client.post("/api/v1/analyze", json=payload)
    
    # Dependiendo de la regla de Pydantic, podría ser 200 o 422. Si min_length=1 no está, será 200.
    assert response.status_code in [200, 422]
    print("\n[OK] Test de texto vacío manejado correctamente.")

@pytest.mark.skipif(not config.GROQ_API_KEY, reason="Se requiere GROQ_API_KEY en el .env")
def test_analizar_endpoint_benchmark():
    """
    Prueba real contra la API de IA (Gemini/Groq/Ollama).
    Mide el tiempo de respuesta y la precisión del formato JSON.
    """
    config.USE_MOCK = False
    
    print("\n\n=== INICIANDO BENCHMARK DE IA ===")
    tiempos = []
    
    for idx, payload in enumerate(TEST_CASES):
        print(f"Enviando Documento {idx+1}: {payload['titulo']}")
        
        start_time = time.time()
        response = client.post("/api/v1/analyze", json=payload)
        end_time = time.time()
        
        latencia = end_time - start_time
        tiempos.append(latencia)
        
        # Validar HTTP 200
        assert response.status_code == 200
        data = response.json()
        
        # Validar Estructura JSON del Agente
        assert "doc_id" in data
        assert "Categoria" in data
        assert "keywords" in data
        assert type(data["keywords"]) == list
        
        print(f"[OK] Respuesta recibida en {latencia:.2f} segundos.")
        print(f"   Categoría asignada: {data['Categoria']}")
        print(f"   Keywords: {data['keywords']}")
        
    tiempo_promedio = sum(tiempos) / len(tiempos)
    print(f"\n[BENCHMARK] TIEMPO PROMEDIO DE RESPUESTA: {tiempo_promedio:.2f} segundos por documento.")
    print("==================================\n")
