import os
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env (en la raíz del repo)
load_dotenv()

# Acceder a la clave y modelo de Groq
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b")

# Modo Simulacro: Si es True, no llama a los modelos reales y devuelve datos fijos
USE_MOCK = os.environ.get("USE_MOCK", "False").lower() == "true"
