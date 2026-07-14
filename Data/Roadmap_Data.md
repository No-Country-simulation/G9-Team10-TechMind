# 🗺️ Roadmap: Equipo de Datos (TechMind)

Este documento define la ruta de trabajo exclusiva para nuestro sub-equipo de Data. Aquí detallamos cuál es nuestro objetivo, qué pasos seguiremos para lograrlo y, lo más importante, **qué le vamos a entregar al equipo de Desarrollo (Backend/Frontend) como producto final**.

---

## 🎯 Nuestro Producto Final (El Entregable)
Nosotros no hacemos la interfaz gráfica ni la gestión de base de datos de usuarios. Nuestro trabajo consiste en crear el "Cerebro" de la aplicación. 

El objetivo final es entregarle al Backend un **Pipeline (Motor) empaquetado** en una función de Python sencilla. El Backend solo debe preocuparse por pasarnos un texto, y nosotros le devolvemos la magia.

**Ejemplo de lo que el Backend espera de nuestro equipo:**
```python
# El backend nos pasará algo como esto (recibido desde el frontend):
texto_crudo = "<p>Tutorial de Python: <code>print('Hola')</code></p>"

# Nuestro motor procesará el texto y debe devolverles un JSON como este:
resultado = motor_techmind.procesar(texto_crudo)
/*
{
  "categoria_principal": "Tutorial de Programación",
  "lenguaje_detectado": "Python",
  "tags": ["tutorial", "python", "hola mundo"],
  "resumen_llm": "Breve tutorial introductorio sobre impresión en Python.",
  "documentos_similares": [id_45, id_89]
}
*/
```

---

## 🚀 Fases del Proyecto (Data Team)

### Fase 1: Ingesta de Datos (Completada ✅)
- **Objetivo:** Recolectar datos heterogéneos y ruidosos (GitHub, arXiv, tutoriales, HTML) para simular el mundo real.
- **Salida:** `dataset_techmind_raw.csv`.

### Fase 2: Limpieza de Datos (Data Wrangling)
- **Objetivo:** Escribir algoritmos (usando Pandas, Regex, BeautifulSoup) que tomen el CSV crudo y normalicen los textos. Hay que remover ruido web pero preservar el contexto técnico.
- **Salida:** `dataset_techmind_clean.csv`.

### Fase 3: Integración del LLM (Clasificación Inteligente)
- **Objetivo:** Ya que acordamos usar un LLM, no necesitamos entrenar redes neuronales desde cero para NLP clásico. Usaremos **Prompt Engineering** y llamadas a APIs (ej. Gemini/OpenAI) para extraer las entidades clave (Tags, Categoría, Resumen) de los textos limpios.
- **Reto:** Optimizar los Prompts para que el LLM siempre responda en formato JSON predecible.

### Fase 4: Motor de Similitud (Clustering y Recomendación)
- **Objetivo:** Para cumplir con la funcionalidad de *"organización y recomendación"*, necesitamos que el sistema sepa qué textos se parecen entre sí.
- **Cómo hacerlo:** Convertiremos los textos a vectores matemáticos (Embeddings del LLM o métodos rápidos como TF-IDF) y calcularemos la Distancia del Coseno.

### Fase 5: Empaquetado (El "Hand-off" al Backend)
- **Objetivo:** Encapsular las Fases 2, 3 y 4 en un solo archivo de Python (ej. `ai_pipeline.py`).
- **Éxito:** El equipo de Backend lo importa en su servidor (FastAPI/Django/Flask) sin necesidad de entender cómo funcionan los vectores o el LLM por debajo.
