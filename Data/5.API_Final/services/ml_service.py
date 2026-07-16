import joblib
import os

# Ruta donde esperaremos que Rodrigo coloque su modelo final
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'techmind_pipeline_v2.joblib')

# TODO: Cargar el modelo de Rodrigo
# try:
#     pipeline = joblib.load(MODEL_PATH)
# except FileNotFoundError:
#     pipeline = None

def predecir_categoria(texto: str):
    """
    Usa el modelo de Regresión Logística + TF-IDF para predecir.
    """
    # if not pipeline: return "Desconocido", 0.0
    pass

def obtener_similitudes(id_documento: int):
    """
    Usa Similitud del Coseno para encontrar los 3 más parecidos.
    """
    pass
