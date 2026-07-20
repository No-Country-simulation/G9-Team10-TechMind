from fastapi import APIRouter, HTTPException
from models.schemas import SearchRequest, RecommendRequest, RecomendacionResponse, DocumentoSimilitud
from services import ml_service

import uuid
from core.config import USE_MOCK

router = APIRouter()

@router.post("/search", response_model=RecomendacionResponse)
async def buscar_semantica(entrada: SearchRequest):
    """
    Busca documentos relacionados a una query de texto natural (Español o Inglés).
    """
    trace_id = str(uuid.uuid4())
    
    if USE_MOCK:
        mock_data = [
            DocumentoSimilitud(doc_id="mock-1", title="Mock Document", source_type="PDF", similarity_score=0.99, preview="Mock text"),
        ]
        return RecomendacionResponse(resultados=mock_data, trace_id=trace_id)
        
    resultados = ml_service.buscar_similares(entrada.query, top_k=entrada.top_k)
    
    if "error" in resultados:
        raise HTTPException(status_code=500, detail=resultados["error"])
        
    return RecomendacionResponse(resultados=resultados["resultados"], trace_id=trace_id)


@router.post("/recommend", response_model=RecomendacionResponse)
async def buscar_parecido(entrada: RecommendRequest):
    """
    Busca documentos similares a un documento existente usando su doc_id.
    """
    trace_id = str(uuid.uuid4())
    
    if USE_MOCK:
        mock_data = [
            DocumentoSimilitud(doc_id="mock-2", title="Related Mock", source_type="TXT", similarity_score=0.88, preview="Related mock text"),
        ]
        return RecomendacionResponse(resultados=mock_data, trace_id=trace_id)
        
    resultados = ml_service.buscar_por_id(entrada.doc_id, top_k=entrada.top_k)
    
    if "error" in resultados:
        if "no encontrado" in resultados["error"].lower():
            raise HTTPException(status_code=404, detail=resultados["error"])
        raise HTTPException(status_code=500, detail=resultados["error"])
        
    return RecomendacionResponse(resultados=resultados["resultados"], trace_id=trace_id)
