# 🚀 Fase 5: API Final (Micro-API)

¡Bienvenidos a la carpeta de la Fase 5! 
Aquí es donde todo el trabajo de limpieza de datos (Nairo) y matemáticas/ML (Rodrigo) cobra vida y se conecta con el resto del proyecto.

## 🎯 ¿Qué hace esta API?
Esta es una **Micro-API interna** construida con **FastAPI**. Su único objetivo es hacer los cálculos pesados de Inteligencia Artificial de forma rápida y devolver respuestas en JSON. 

Esta API **no está expuesta a internet público**. El único que se comunica con ella es el Backend en Java (Spring Boot) gestionado por Juan. 

## 🏗️ Arquitectura y Modularidad
Para asegurar que nuestro código no se rompa el día de la presentación y sea fácil de escalar, dividimos el proyecto en módulos:

*   📂 **`routers/`**: Aquí están las URLs que Juan va a llamar (`/analizar_texto` y `/buscar_parecido`).
*   📂 **`services/`**: Aquí vive el "cerebro". La conexión con el modelo de Rodrigo (`ml_service.py`) y la conexión con el LLM (`gemini_service.py`).
*   📂 **`models/`**: Aquí validamos estrictamente los JSON de entrada y salida usando Pydantic (`schemas.py`).
*   📂 **`core/`**: Configuraciones críticas de seguridad (API Keys) y parches de compatibilidad.

## 🛡️ Mejoras Nivel "Hackathon Ganador" (Implementadas)
1.  **Modo Mock Dinámico:** Si la IA falla el día de la presentación, tenemos un "Botón de Pánico" en el archivo `.env` (`USE_MOCK=True`). Si se activa, la API devuelve datos falsos pero perfectos al instante. ¡La demo nunca se cae!
2.  **Degradación Elegante:** Si Gemini se confunde o devuelve un JSON roto, el sistema lo atrapa y devuelve un estado "Desconocido", evitando que la aplicación del Frontend explote.
3.  **Trazabilidad:** Cada respuesta de la API incluye un `trace_id` único. Si hay un bug, podemos rastrearlo en los logs al instante.
4.  **Health Checks:** Agregamos una ruta `/health/ready` necesaria para desplegar los contenedores en Oracle Cloud Infrastructure (OCI).

## 🚀 ¿Cómo ejecutarla en local?
1. Renombra el archivo de ejemplo `.env` (o crea uno) y coloca tu `GEMINI_API_KEY`.
2. Instala los requerimientos: `pip install -r requirements.txt`
3. Ejecuta el servidor: `python -m uvicorn main:app --reload`
4. Visita `http://127.0.0.1:8000/docs` para ver la interfaz de prueba (Swagger).
