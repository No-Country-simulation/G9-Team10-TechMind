from fastapi import APIRouter
from models.schemas import RecomendacionInput, RecomendacionResponse
# from services import ml_service

import uuid
from core.config import USE_MOCK

router = APIRouter()

@router.post("/buscar_parecido", response_model=RecomendacionResponse)
async def buscar_parecido(entrada: RecomendacionInput):
    """
    Recibe el ID de un documento y devuelve los 3 IDs más similares (Similitud del Coseno).
    """
    trace_id = str(uuid.uuid4())
    
    if USE_MOCK:
        # Mock de recomendaciones
        return RecomendacionResponse(recomendaciones=[101, 12, 45], trace_id=trace_id)
        
    # TODO: Conectar con ml_service para cargar la matriz TF-IDF
    return RecomendacionResponse(recomendaciones=[], trace_id=trace_id)
