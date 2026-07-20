from fastapi import APIRouter
from models.schemas import TextoInput, AnalisisResponse
# from services import gemini_service

import uuid
from core.config import USE_MOCK

router = APIRouter()

@router.post("/analyze", response_model=AnalisisResponse)
async def analizar_texto(entrada: TextoInput):
    """
    Recibe un texto nuevo, lo clasifica y extrae metadata (Gemini).
    Responde estrictamente con el contrato esperado por Spring Boot.
    """
    trace_id = str(uuid.uuid4())
    
    if USE_MOCK:
        return AnalisisResponse(
            Titulo=entrada.titulo,
            Texto=entrada.texto,
            Categoria="Backend",
            probabilidadCategoria=0.89,
            Nivel="Intermedio",
            keywords=["Java", "Spring Boot", "API REST"],
            version="1.0",
            trace_id=trace_id
        )
        
    # Llamada real a Gemini (Fase 5.3)
    from services.gemini_service import extraer_metadata
    metadata_gemini = extraer_metadata(entrada.texto)
    
    return AnalisisResponse(
        Titulo=entrada.titulo,
        Texto=entrada.texto,
        Categoria=metadata_gemini.get("categoria", "Desconocida"),
        probabilidadCategoria=metadata_gemini.get("probabilidad", 0.0),
        Nivel=metadata_gemini.get("dificultad", "Desconocida"),
        keywords=metadata_gemini.get("tags", []),
        version="1.0",
        trace_id=trace_id
    )
