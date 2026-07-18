import os
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env (en la raíz del repo)
load_dotenv()

# Acceder a la clave de Gemini
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

# Modo Simulacro: Si es True, no llama a los modelos reales y devuelve datos fijos
USE_MOCK = os.environ.get("USE_MOCK", "True").lower() == "true"
