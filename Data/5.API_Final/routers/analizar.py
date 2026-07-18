from fastapi import APIRouter
from models.schemas import TextoInput, AnalisisResponse
# from services import ml_service, gemini_service

import uuid
from core.config import USE_MOCK

router = APIRouter()

@router.post("/analizar_texto", response_model=AnalisisResponse)
async def analizar_texto(entrada: TextoInput):
    """
    Recibe un texto nuevo, lo clasifica (TF-IDF) y extrae metadata (Gemini).
    """
    trace_id = str(uuid.uuid4())
    
    if USE_MOCK:
        # Modo fallback/prueba: Devolvemos datos falsos estáticos
        return AnalisisResponse(
            categoria="Backend",
            probabilidad=0.89,
            dificultad="Intermedio",
            informacion_adicional=["Java", "Spring Boot", "API REST"],
            trace_id=trace_id
        )
        
    # Llamada real a Gemini
    from services.gemini_service import extraer_metadata
    metadata_gemini = extraer_metadata(entrada.texto)
    
    return AnalisisResponse(
        categoria=metadata_gemini.get("categoria", "Desconocida"),
        probabilidad=metadata_gemini.get("probabilidad", 0.0),
        dificultad=metadata_gemini.get("dificultad", "Desconocida"),
        informacion_adicional=metadata_gemini.get("tags", []),
        trace_id=trace_id
    )
