from pydantic import BaseModel
from typing import List

# --- CONTRATO DE ENTRADA ---
class TextoInput(BaseModel):
    titulo: str
    texto: str

class RecomendacionInput(BaseModel):
    id_documento: int

# --- CONTRATO DE SALIDA ---
class AnalisisResponse(BaseModel):
    categoria: str
    probabilidad: float
    dificultad: str
    informacion_adicional: List[str]
    trace_id: str

class RecomendacionResponse(BaseModel):
    recomendaciones: List[int] # Ejemplo: [101, 105, 204]
    trace_id: str
