import json
from groq import AsyncGroq
from core.config import GROQ_API_KEY
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
    Se comunica con Groq para extraer Keywords y Dificultad usando Llama 3.
    Implementa reintentos automáticos y es completamente ASÍNCRONO.
    """
    if not client:
        return {"error": "API Key de Groq no configurada"}
        
    prompt = f"""
    Eres un experto arquitecto de datos y clasificador automático. Analiza el siguiente texto técnico y extrae la información requerida.
    DEBES responder ÚNICAMENTE con un objeto JSON válido, sin Markdown, de este formato exacto:
    {{
        "categoria": "Backend",
        "probabilidad": 0.95,
        "dificultad": "Intermedio",
        "tags": ["tag1", "tag2", "tag3"]
    }}
    
    Instrucciones:
    1. 'categoria': Elige una categoría técnica principal que describa el texto (ej: Backend, Frontend, DevOps, IA, Ciberseguridad, Data Science, etc.). Si ninguna aplica bien, genera una nueva, pero debe ser de una sola palabra o dos como máximo.
    2. 'probabilidad': Un número decimal entre 0.0 y 1.0 indicando tu confianza.
    3. 'dificultad': Elige estrictamente entre "Principiante", "Intermedio" o "Avanzado".
    4. 'tags': Arreglo de 3 a 5 palabras clave exactas extraídas del texto.
    
    Analiza exclusivamente este texto:
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
            model="llama-3.1-8b-instant",
            temperature=0.0,
            response_format={"type": "json_object"}
        )
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        logger.error(f"Fallo crítico en Groq API al analizar documento: {str(e)}")
        return {
            "categoria": "Desconocida",
            "probabilidad": 0.0,
            "dificultad": "Desconocida",
            "tags": ["Sin tags"]
        }
