import google.generativeai as genai
import json
from core.config import GEMINI_API_KEY

# Configurar API
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-flash-latest')
else:
    model = None

def extraer_metadata(texto_entrada: str):
    """
    Se comunica con Gemini para extraer Keywords y Dificultad.
    """
    if not model:
        return {"error": "API Key no configurada"}
        
    prompt = f"""
    Eres un experto arquitecto de datos y clasificador automático. Analiza el siguiente texto técnico y extrae la información requerida.
    DEBES responder ÚNICAMENTE con un objeto JSON válido, sin Markdown.
    
    El formato exacto debe ser:
    {{
        "categoria": "Backend",
        "probabilidad": 0.95,
        "dificultad": "Intermedio",
        "tags": ["tag1", "tag2", "tag3"]
    }}
    
    Instrucciones:
    1. 'categoria': Elige una categoría técnica principal que describa el texto (ej: Backend, Frontend, DevOps, IA, Ciberseguridad, Data Science, etc.). Si ninguna aplica bien, genera una nueva, pero debe ser de una sola palabra o dos como máximo.
    2. 'probabilidad': Un número decimal entre 0.0 y 1.0 indicando tu confianza en la categoría asignada.
    3. 'dificultad': Elige estrictamente entre "Principiante", "Intermedio" o "Avanzado".
    4. 'tags': Arreglo de 3 a 5 palabras clave exactas extraídas del texto o relacionadas.
    
    Texto a analizar:
    {texto_entrada}
    """
    
    try:
        respuesta = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        return json.loads(respuesta.text)
    except Exception as e:
        # Fallback de degradación elegante: Si Gemini falla, no rompemos el backend
        print(f"[Error Gemini]: {str(e)}")
        return {
            "categoria": "Desconocida",
            "probabilidad": 0.0,
            "dificultad": "Desconocida",
            "tags": ["Sin tags"]
        }
