import json
from groq import AsyncGroq
from core.config import GROQ_API_KEY, GROQ_MODEL
from tenacity import retry, wait_exponential, stop_after_attempt
from core.logger import get_logger

logger = get_logger(__name__)

# Configurar API asíncrona
if GROQ_API_KEY:
    client = AsyncGroq(api_key=GROQ_API_KEY)
else:
    client = None

@retry(wait=wait_exponential(multiplier=1, min=2, max=10), stop=stop_after_attempt(3))
async def extraer_metadata(texto_entrada: str):
    """
    Se comunica con Groq para extraer Keywords, Categoría y Dificultad (Principiante / Intermedio / Avanzado).
    Implementa reintentos automáticos y es completamente ASÍNCRONO.
    """
    if not client:
        return {"error": "API Key de Groq no configurada"}
        
    prompt = f"""
    Eres un experto arquitecto de software y clasificador automático de conocimiento técnico.
    Analiza el siguiente contenido técnico y extrae la información solicitada con máxima precisión.

    DEBES responder ÚNICAMENTE con un objeto JSON válido (RFC 8259), sin bloques Markdown ni texto explicativo adicional.
    Estructura exacta requerida:
    {{
        "categoria": "Backend",
        "probabilidad": 0.95,
        "dificultad": "Intermedio",
        "tags": ["tag1", "tag2", "tag3"]
    }}
    
    Criterios de clasificación:
    1. 'categoria': Categoría técnica principal (ej: Backend, Frontend, DevOps, IA, Data Science, Ciberseguridad, Cloud, Base de Datos, Mobile, Testing, etc.).
    2. 'probabilidad': Número decimal entre 0.0 y 1.0 que exprese tu grado de certeza.
    3. 'dificultad': Nivel de complejidad conceptual y técnica. DEBES elegir ESTRICTAMENTE uno de estos 3 valores exactos:
       - "Principiante" (conceptos introductorios, tutoriales básicos, sintaxis elemental, definiciones).
       - "Intermedio" (aplicación práctica, integración de frameworks, APIs REST, consultas a bases de datos, patrones de diseño).
       - "Avanzado" (arquitectura distribuida, optimización de bajo nivel, algoritmos complejos, computación cuántica, modelos profundos, escalabilidad masiva).
    4. 'tags': Lista de 3 a 5 palabras clave técnicas más representativas del texto.
    
    Texto a analizar:
    {texto_entrada}
    """
    
    try:
        chat_completion = await client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a JSON generating machine. You only output valid JSON. No markdown formatting."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model=GROQ_MODEL,
            temperature=0.0,
            response_format={"type": "json_object"}
        )
        data = json.loads(chat_completion.choices[0].message.content)
        
        # Validar y normalizar el nivel de dificultad
        nivel = str(data.get("dificultad", "Intermedio")).strip().capitalize()
        if nivel not in ["Principiante", "Intermedio", "Avanzado"]:
            # Normalización inteligente
            if any(w in nivel.lower() for w in ["basic", "principiante", "facil", "intro"]):
                nivel = "Principiante"
            elif any(w in nivel.lower() for w in ["avanzad", "complex", "expert", "hard"]):
                nivel = "Avanzado"
            else:
                nivel = "Intermedio"
        data["dificultad"] = nivel
        
        return data
    except Exception as e:
        logger.error(f"Fallo crítico en Groq API ({GROQ_MODEL}) al analizar documento: {str(e)}")
        return {
            "categoria": "Desconocida",
            "probabilidad": 0.0,
            "dificultad": "Desconocida",
            "tags": ["Sin tags"]
        }
