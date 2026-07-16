import os
import sys
import json
import google.generativeai as genai

# Solución para problemas de codificación en consola de Windows
sys.stdout.reconfigure(encoding='utf-8')

from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# IMPORTANTE: La API Key ahora se lee de un archivo .env seguro
API_KEY = os.environ.get("GEMINI_API_KEY")

def main():
    print("🤖 Iniciando Prototipo de Extracción con LLM (Gemini)...")
    
    if not API_KEY:
        print("⚠️ ALERTA: No has configurado tu API_KEY.")
        print("Por favor, crea un archivo llamado '.env' en la raíz de la carpeta Repo y agrega la línea:")
        print("GEMINI_API_KEY=tu_clave_aqui")
        return

    # Configurar la API
    genai.configure(api_key=API_KEY)
    
    # Usar el modelo rápido y gratuito de Gemini 1.5 Flash
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
    except Exception as e:
        print(f"❌ Error al cargar el modelo: {e}")
        return

    # Texto de prueba
    texto_entrada = """
    React es una biblioteca de JavaScript para construir interfaces de usuario. 
    A diferencia de otros frameworks, React usa un Virtual DOM para mejorar el rendimiento 
    y permite crear componentes reutilizables. Hoy usaremos Vite y TailwindCSS para acelerar el desarrollo.
    """
    
    print("📩 Enviando texto al LLM...")
    
    # Ingeniería de Prompts (El secreto del éxito)
    prompt = f"""
    Eres un experto arquitecto de datos. Analiza el siguiente texto técnico y extrae la información requerida.
    DEBES responder ÚNICAMENTE con un objeto JSON válido, sin Markdown (sin ```json) y sin texto adicional.
    
    El formato exacto debe ser:
    {{
        "categoria_principal": "Frontend, Backend, IA, DevOps o Data",
        "dificultad": "Principiante, Intermedio o Avanzado",
        "tags": ["tag1", "tag2", "tag3"],
        "resumen_corto": "Resumen de una sola línea del texto"
    }}
    
    Texto a analizar:
    {texto_entrada}
    """
    
    try:
        # Llamar al modelo
        respuesta = model.generate_content(prompt)
        
        # Limpiar la respuesta (por si el modelo devuelve Markdown)
        respuesta_limpia = respuesta.text.strip().replace('```json', '').replace('```', '')
        
        # Parsear como JSON para verificar que sea estructurado
        datos_json = json.loads(respuesta_limpia)
        
        print("\n✅ Respuesta estructurada recibida del LLM:")
        print(json.dumps(datos_json, indent=4, ensure_ascii=False))
        
    except json.JSONDecodeError:
        print("❌ Error: El modelo no devolvió un JSON válido.")
        print("Respuesta cruda:", respuesta.text)
    except Exception as e:
        print(f"❌ Error de conexión con Gemini: {e}")

if __name__ == "__main__":
    main()
