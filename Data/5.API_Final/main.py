from core.patch import apply_pydantic_patch
apply_pydantic_patch()

from fastapi import FastAPI
from routers import analizar, recomendar

app = FastAPI(
    title="TechMind AI API",
    description="Motor de Inteligencia Artificial para TechMind (Clasificación, Similitud y Extracción)",
    version="1.0.0"
)

# Conectar los "modulos" (routers)
app.include_router(analizar.router, prefix="/api/v1")
app.include_router(recomendar.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "TechMind AI API is running. Go to /docs for Swagger."}

@app.get("/health/ready")
def health_ready():
    """Endpoint requerido por Oracle Cloud para saber si el contenedor está listo"""
    # Aquí podríamos verificar conexión a base de datos, pero en nuestro caso siempre está listo
    return {"status": "ready"}
