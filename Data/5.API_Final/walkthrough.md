# Resumen de Cambios: Transición a Arquitectura ONNX (Fase 5.1)

Hemos concluido con éxito la refactorización arquitectónica del motor de búsqueda de la API. El objetivo principal era mantener el potente acierto multilingüe del modelo de Machine Learning desarrollado en las Fases 3 y 4, pero eliminando la dependencia de `PyTorch` (que consumía más de 2.5GB de RAM) para permitir un despliegue gratuito y de bajo costo.

## 🛠️ Cambios Implementados

### 1. Cuantización de Modelo
*   Se creó el script `scratch/quantize_model.py` para descargar el modelo `paraphrase-multilingual-MiniLM-L12-v2` de HuggingFace.
*   Se convirtió el modelo a formato **ONNX** y se aplicó cuantización dinámica a 8-bits.
*   **Resultado:** El modelo pasó de pesar cientos de megabytes y requerir PyTorch, a pesar poco más de ~100MB, optimizado para ejecutarse nativamente en CPU.

### 2. Refactorización del Backend (`ml_service.py`)
*   Se eliminó por completo el código legado que utilizaba `scikit-learn` y matrices TF-IDF.
*   Se implementó lógica manual de **Tokenización** y **Mean Pooling** utilizando la librería `tokenizers` y `onnxruntime`.
*   [VER CÓDIGO REFACTORIZADO](file:///C:/Users/Maxi.DESKTOP-8LJC287/Desktop/Entornos_Antigravity/W5(Varios)/techmind/Repo/(2)/Data/5.API_Final/services/ml_service.py)

### 3. Limpieza de Dependencias
*   Se actualizaron las dependencias en `requirements.txt`.
*   [ELIMINADO] `scikit-learn`
*   [AÑADIDO] `onnxruntime`, `tokenizers`, `numpy`

### Scripts Utilizados
- `test_ml.py`: Validó las métricas de inferencia y los resultados del motor.
- `generate_embeddings.py`: Construyó la matriz vectorial offline.

---

## Fase 5.2: Endpoints FastAPI y Contrato Spring Boot

Hemos adaptado completamente nuestra API para que funcione de manera transparente y segura junto a la arquitectura Java Spring Boot desarrollada por Juan.

### 1. Refactorización de Schemas (`models/schemas.py`)
Modificamos el contrato JSON de respuesta (`AnalisisResponse`) para respetar **estrictamente** las variables requeridas por el backend:
- Cambiamos `categoria` a `Categoria`, `probabilidad` a `probabilidadCategoria` y `dificultad` a `Nivel`.
- Agregamos la clave `version: "1.0"` y devolvemos los datos originales `Titulo` y `Texto`.

### 2. Búsqueda y Recomendaciones (`routers/recomendar.py` y `services/ml_service.py`)
Separamos la lógica para cumplir con el MVP del Frontend:
- **`POST /api/v1/search`**: Recibe texto y busca similitud semántica.
- **`POST /api/v1/recommend`**: Creado nuevo soporte matemático `buscar_por_id`. El usuario (o frontend) envía un `doc_id` y el motor busca los vectores similares usando producto punto rápido, devolviendo los Top-K parecidos y evitando mostrar el documento a sí mismo.

### 3. Independencia de la Base de Datos
Si el equipo de Datos (Nairo/Rodrigo) cambia la lógica de los Hash o UUID, nuestra API no se rompe. Extraemos los textos, limpiamos, y regeneramos nuestro diccionario `dataset_reference.joblib` offline. La API consume este diccionario y sus vectores de manera totalmente aislada.

### Verificación
Ejecutamos un script local de FastAPI (`test_api_endpoints.py`) y comprobamos:
- Código HTTP 200 en las búsquedas semánticas.
- Código HTTP 200 en la búsqueda por ID con retorno adecuado de metadata (`similarity_score`, `doc_id`, `title`).
- Código HTTP 404 manejado correctamente cuando se envía un `doc_id` inexistente.

---

> [!TIP]
> **Rendimiento Comprobado**
> Las pruebas locales arrojan resultados exitosos tanto en consultas en español como en inglés, haciendo match semántico mediante Producto Punto y devolviendo resultados en milisegundos sin sobrecargar la memoria.

## ✅ Próximos Pasos (Tu Turno)

1.  Hacer el commit y push de esta rama (`develop`) a GitHub.
2.  Iniciar la integración del `@RestController` en Java (si aplica) o directamente preparar los endpoints de `FastAPI`.
