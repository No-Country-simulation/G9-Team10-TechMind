from pydantic import BaseModel, Field
from typing import List, Optional

# --- CONTRATO DE ENTRADA ---
class TextoInput(BaseModel):
    titulo: str
    texto: str
    doc_id: Optional[str] = None

class SearchRequest(BaseModel):
    query: str
    top_k: int = 5

class RecommendRequest(BaseModel):
    doc_id: str
    top_k: int = 3

# --- CONTRATO DE SALIDA (Alineado estrictamente con Spring Boot) ---
class AnalisisResponse(BaseModel):
    Titulo: str
    Texto: str
    Categoria: str
    probabilidadCategoria: float
    Nivel: str
    keywords: List[str]
    version: str = "1.0"
    trace_id: str
    doc_id: str

class DocumentoSimilitud(BaseModel):
    doc_id: str
    title: str
    source_type: str
    similarity_score: float
    preview: str

class RecomendacionResponse(BaseModel):
    resultados: List[DocumentoSimilitud]
    trace_id: str
