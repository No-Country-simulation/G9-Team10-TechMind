from fastapi import APIRouter
from models.schemas import TextoInput, AnalisisResponse
# from services import gemini_service

import uuid
from core import config

import hashlib
import re
from core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()

def generate_doc_id(text: str) -> str:
    text = re.sub(r"\s+", " ", str(text).strip())
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]

@router.post("/analyze", response_model=AnalisisResponse)
async def analizar_texto(entrada: TextoInput):
    """
    Recibe un texto nuevo, lo clasifica y extrae metadata (Groq/Llama 3.1).
    Responde estrictamente con el contrato esperado por Spring Boot.
    """
    trace_id = str(uuid.uuid4())
    doc_id = entrada.doc_id if entrada.doc_id else generate_doc_id(entrada.texto)
    
    logger.info(f"[Trace: {trace_id}] Iniciando análisis para documento doc_id={doc_id}")
    
    if config.USE_MOCK:
        logger.info(f"[Trace: {trace_id}] Devolviendo respuesta MOCK (Sin coste)")
        return AnalisisResponse(
            Titulo=entrada.titulo,
            Texto=entrada.texto,
            Categoria="Backend",
            probabilidadCategoria=0.89,
            Nivel="Intermedio",
            keywords=["Java", "Spring Boot", "API REST"],
            version="1.0",
            trace_id=trace_id,
            doc_id=doc_id
        )
        
    # Llamada real a Groq (Fase 5.3)
    from services.groq_service import extraer_metadata
    logger.info(f"[Trace: {trace_id}] Solicitando clasificación a Groq API...")
    metadata_gemini = await extraer_metadata(entrada.texto)
    
    logger.info(f"[Trace: {trace_id}] Análisis completado. Categoría asignada: {metadata_gemini.get('categoria')}")
    return AnalisisResponse(
        Titulo=entrada.titulo,
        Texto=entrada.texto,
        Categoria=metadata_gemini.get("categoria", "Desconocida"),
        probabilidadCategoria=metadata_gemini.get("probabilidad", 0.0),
        Nivel=metadata_gemini.get("dificultad", "Desconocida"),
        keywords=metadata_gemini.get("tags", []),
        version="1.0",
        trace_id=trace_id,
        doc_id=doc_id
    )
