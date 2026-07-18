import google.generativeai as genai
import json
from core.config import GEMINI_API_KEY

# Configurar API
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
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
    DEBES responder ÚNICAMENTE con un objeto JSON válido, sin Markdown (sin ```json) y sin texto adicional.
    
    El formato exacto debe ser:
    {{
        "categoria": "Backend, Frontend, Data o DevOps",
        "probabilidad": 0.95,
        "dificultad": "Principiante, Intermedio o Avanzado",
        "tags": ["tag1", "tag2", "tag3"]
    }}
    
    Nota: En 'probabilidad', coloca un número decimal entre 0.0 y 1.0 que represente tu confianza en la categoría asignada.
    
    Texto a analizar:
    {texto_entrada}
    """
    
    try:
        respuesta = model.generate_content(prompt)
        respuesta_limpia = respuesta.text.strip().replace('```json', '').replace('```', '')
        return json.loads(respuesta_limpia)
    except Exception as e:
        # Fallback de degradación elegante: Si Gemini falla, no rompemos el backend
        print(f"[Error Gemini]: {str(e)}")
        return {
            "categoria": "Desconocida",
            "probabilidad": 0.0,
            "dificultad": "Desconocida",
            "tags": ["Sin tags"]
        }
