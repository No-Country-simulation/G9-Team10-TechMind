# 🚀 Microservicio de IA Bilingüe (TechMind)

Bienvenido al núcleo de Inteligencia Artificial de TechMind. Este microservicio, escrito en **Python (FastAPI)**, actúa como el cerebro semántico del backend principal desarrollado en **Spring Boot (Java)**. 

---

## 🏗️ Arquitectura Definitiva

Tras múltiples iteraciones y optimizaciones de consumo, logramos implementar un motor de búsqueda ultra-ligero y rápido, que puede ejecutarse incluso en servidores gratuitos (Free Tier) de bajo rendimiento.

### 1. 🧠 Motor de Similitud Semántica (ONNX)
Eliminamos la masiva dependencia de **PyTorch** (>2GB) y convertimos nuestro modelo NLP (`paraphrase-multilingual-MiniLM-L12-v2`) en un binario matemático puro usando **ONNX Runtime Cuantizado a 8-Bits (Int8)**. 
- **Peso de RAM:** Se redujo de 440MB a **110MB**.
- **Performance:** Inferencias en < 50 milisegundos.
- **Mecanismo:** Procesamos la tokenización a mano y calculamos el producto punto de los vectores embebidos generados *offline* (`dataset_reference.joblib`). El motor puede mapear textos en español con respuestas en inglés y viceversa de manera nativa sin usar traductores.

### 2. 🤖 IA Generativa y Clasificación (Gemini RAG)
Integramos **Google Gemini 1.5 Flash** para procesar los textos puros (sin estructurar) que envía Spring Boot y devolver la metadata rica, limpiamente empaquetada. 
- **Contrato JSON Estricto:** Obligamos a Gemini a emitir respuestas en formato JSON puro (`response_mime_type="application/json"`), eliminando fallas de parseo en Java.

---

## 🔌 API Endpoints (Contrato Spring Boot)

### 1. `POST /api/v1/analyze` (Clasificación Automática)
Recibe un título y texto y usa IA Generativa (Gemini) para devolver la categoría y metadata.
* **Envío (Spring Boot):**
```json
{
  "titulo": "Introducción a Kubernetes",
  "texto": "Kubernetes es una plataforma de código abierto..."
}
```
* **Respuesta (Python):**
```json
{
  "Titulo": "Introducción a Kubernetes",
  "Texto": "Kubernetes es una plataforma de código abierto...",
  "Categoria": "DevOps",
  "probabilidadCategoria": 0.96,
  "Nivel": "Intermedio",
  "keywords": ["Kubernetes", "Despliegue", "Contenedores"],
  "version": "1.0",
  "trace_id": "abc-123"
}
```

### 2. `POST /api/v1/search` (Búsqueda por Texto)
Transforma un string (ej: "quiero aprender a desplegar en la nube") en vectores matemáticos para devolver una recomendación semántica bilingüe. Devuelve los IDs de los artículos relevantes.

### 3. `POST /api/v1/recommend` (Recomendación Matemática)
Busca en milisegundos documentos similares basados en un `doc_id` enviado por el frontend. Hace el cálculo usando producto punto contra los `corpus_embeddings.npy` de forma directa sin pasar por el LLM.

---

## ⚙️ Despliegue con Docker (OCI / Nube)

El proyecto está 100% contenerizado.

### Requisito previo
Debes crear un archivo `.env` en este directorio con tu clave de Google Gemini:
```env
GEMINI_API_KEY=AIzaSyTuClaveDeGeminiAqui
USE_MOCK=False
```
*(Nota: Si pones `USE_MOCK=True`, el servicio no consumirá cuota de Gemini y devolverá respuestas fijas instántaneas).*

### Construir y Ejecutar
Solo debes posicionarte en esta carpeta (`5.API_Final`) y ejecutar:
```bash
docker-compose up --build -d
```
La API estará corriendo y escuchando peticiones en `http://localhost:8000`. 
Puedes probarla interactivamente visitando `http://localhost:8000/docs`.
