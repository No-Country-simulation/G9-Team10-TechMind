from pydantic import BaseModel
from typing import List

# --- CONTRATO DE ENTRADA ---
class TextoInput(BaseModel):
    titulo: str
    texto: str

class RecomendacionInput(BaseModel):
    keywords: str

# --- CONTRATO DE SALIDA ---
class AnalisisResponse(BaseModel):
    categoria: str
    probabilidad: float
    dificultad: str
    informacion_adicional: List[str]
    trace_id: str

class RecomendacionResponse(BaseModel):
    recomendaciones: List[dict] # Lista de dicts con titulo, score y preview
    trace_id: str
