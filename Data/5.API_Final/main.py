from core.patch import apply_pydantic_patch
apply_pydantic_patch()

from fastapi import FastAPI
from routers import analizar, recomendar
from core import config
from core.logger import get_logger

logger = get_logger(__name__)

app = FastAPI(
    title="TechMind AI API",
    description="Motor de Inteligencia Artificial para TechMind (Clasificación, Similitud y Extracción)",
    version="1.0.0"
)

# Conectar los "modulos" (routers)
app.include_router(analizar.router, prefix="/api/v1")
app.include_router(recomendar.router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    """
    Fast Fail: Valida que los modelos estén cargados al iniciar, 
    de lo contrario el servidor aborta el inicio en producción.
    """
    logger.info("Iniciando secuencia de arranque de la API...")
    if not config.USE_MOCK:
        from services import ml_service
        if ml_service.corpus_embeddings is None or ml_service.session is None:
            logger.critical("❌ ERROR CRÍTICO: Los modelos ONNX o los embeddings no fueron encontrados en la carpeta 'models/onnx_model_quantized'. Abortando inicio por seguridad (Fast Fail).")
            raise RuntimeError("Modelos matemáticos faltantes. No se puede iniciar la API en producción.")
        logger.info("✅ Modelos matemáticos (ONNX) cargados exitosamente.")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "TechMind AI API is running. Go to /docs for Swagger."}

@app.get("/health/ready")
def health_ready():
    """Endpoint requerido por Oracle Cloud para saber si el contenedor está listo"""
    # Aquí podríamos verificar conexión a base de datos, pero en nuestro caso siempre está listo
    return {"status": "ready"}
