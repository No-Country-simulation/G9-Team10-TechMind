from fastapi import APIRouter
from models.schemas import RecomendacionInput, RecomendacionResponse
from services import ml_service

import uuid
from core.config import USE_MOCK

router = APIRouter()

@router.post("/buscar_parecido", response_model=RecomendacionResponse)
async def buscar_parecido(entrada: RecomendacionInput):
    """
    Recibe una cadena de keywords y devuelve los 5 documentos más similares usando TF-IDF.
    """
    trace_id = str(uuid.uuid4())
    
    if USE_MOCK:
        # Mock de recomendaciones
        mock_data = [
            {"title": "Documento Mock 1", "similarity_score": 0.95, "preview": "Texto de prueba 1..."},
            {"title": "Documento Mock 2", "similarity_score": 0.82, "preview": "Texto de prueba 2..."}
        ]
        return RecomendacionResponse(recomendaciones=mock_data, trace_id=trace_id)
        
    # Conectar con ml_service para buscar en la matriz TF-IDF
    resultados = ml_service.buscar_similares(entrada.keywords, top_k=5)
    
    if "error" in resultados:
        return RecomendacionResponse(recomendaciones=[], trace_id=trace_id)
        
    return RecomendacionResponse(recomendaciones=resultados["resultados"], trace_id=trace_id)
