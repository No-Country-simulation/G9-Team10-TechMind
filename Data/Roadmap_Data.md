# 🗺️ TechMind: Área de Datos (README + Roadmap)

Bienvenidos al repositorio central del equipo de Data. Este documento sirve como guía, documentación y hoja de ruta para entender cómo transformamos texto crudo en un "Cerebro" de Inteligencia Artificial que alimentará a toda la aplicación.

Si eres de Backend (Juan) o Frontend (Alexis), este es el lugar para entender qué hacemos y cómo conectarte a nosotros.

---

## 👥 Nuestro Equipo (Célula de Datos)

Para trabajar de forma ágil y profesional, dividimos la responsabilidad de la ciencia de datos en fases especializadas:

- **Nairo:** Especialista en Data Wrangling y Limpieza de Datos. (Encargada de sanitizar el texto y dejar los datos legibles para la IA).
- **Rodrigo:** Especialista en Machine Learning y Matemáticas. (Encargado de los modelos TF-IDF, Naive Bayes y Similitud del Coseno).
- **Maxi:** Arquitectura de Datos e Integración de IA. (Encargado de la recolección inicial, conexión con LLMs y despliegue de la API final).

---

## 📊 Diagrama General del Flujo de Trabajo

Este diagrama explica de forma sencilla cómo viajan los datos desde la recolección hasta llegar al servidor de Backend, para que cualquier miembro del equipo lo pueda entender.

```mermaid
graph TD
    subgraph Fase 0: Preparación del Cerebro (Trabajo Interno)
        A[Datos Crudos - 1000 docs<br/>Responsable: Maxi] -->|Regex & Filtrado| B[Datos Limpios<br/>Responsable: Nairo]
        B -->|Entrenamiento ML| C[(Modelo Matemático .joblib<br/>Responsable: Rodrigo)]
    end

    subgraph Fase de Producción: La Micro-API (Nuestro Entregable)
        D[Petición desde Spring Boot<br/>Responsable: Juan] --> E{API FastAPI<br/>Responsable: Maxi}
        
        E -->|1. /analizar_texto| F[Modelo Clásico + LLM Gemini]
        F --> G[JSON: Categoría, Dificultad, Keywords]
        
        E -->|2. /buscar_parecido| H[Matemática: Similitud del Coseno]
        H --> I[JSON: Top 3 IDs Relacionados]
    end
```

---

## 🚀 Fases del Proyecto y Estado Actual

### Fase 1: Ingesta de Datos (✅ Completada por Maxi)
- **Objetivo:** Evitar el "arranque en frío" del proyecto recolectando 1000 documentos técnicos (GitHub, arXiv, etc.).
- **Resultado:** Archivo `dataset_techmind_raw.csv`.

### Fase 2: Limpieza de Datos / Data Wrangling (✅ Completada por Nairo)
- **Objetivo:** Transformar el texto ruidoso limpiando etiquetas HTML, URLs y unificando formatos para que la máquina no se confunda. 
- **Resultado:** Notebook `Datos_limpios.ipynb` que genera texto puro para el modelo.

### Fase 3: Clasificación e Integración del LLM (⏳ En Progreso por Rodrigo y Maxi)
- **Objetivo (Rodrigo):** Entrenar un modelo de Machine Learning clásico (TF-IDF + Regresión) con los datos limpios de Nairo para predecir la **Categoría** del texto entrante.
- **Objetivo (Maxi):** Integrar la API de Gemini para leer el texto y extraer el nivel de **Dificultad** y **Palabras Clave (Tags)** humanos.

### Fase 4: Búsqueda Semántica / Recomendación (⏳ En Progreso por Rodrigo)
- **Objetivo:** Vectorizar los textos y usar *Similitud del Coseno*. Cuando entre un texto nuevo, la matemática comparará ese vector contra nuestra "Fase 0" y encontrará los 3 documentos que apuntan en la misma dirección semántica.

### Fase 5: API Final Modular (⏳ En Progreso por Maxi)
- **Objetivo:** Encapsular los modelos de Rodrigo y Gemini dentro de una API web rápida (FastAPI). 
- **Decisión de Arquitectura (Importante):** No exponer nuestra API a internet público. Será una "Micro-API" de uso interno. El Backend (Spring Boot de Juan) será el único que le hablará a nuestra API internamente para obtener los cálculos.
- **Estado Actual:** Estructura de código modular ya construida (`routers`, `services`). Actualmente devolviendo *Mock Data* (datos de prueba estáticos) para desbloquear a los equipos de Backend y Frontend.

---

## 🔌 El Contrato de API (Para el equipo de Backend)

Juan, así es exactamente como debes conectarte a nosotros desde tu código Java:

### 1. Endpoint: Clasificación de Contenido
`POST /api/v1/analizar_texto`

**Lo que nos tienes que enviar:**
```json
{
  "titulo": "Introducción a Spring Boot",
  "texto": "En este contenido se presentan los conceptos básicos para crear APIs REST en Java..."
}
```

**Lo que nosotros te devolveremos:**
```json
{
  "categoria": "Backend",
  "probabilidad": 0.89,
  "dificultad": "Principiante",
  "informacion_adicional": ["Java", "Spring Boot", "API REST"]
}
```

### 2. Endpoint: Recomendación (Contenido Relacionado)
`POST /api/v1/buscar_parecido`

**Lo que nos tienes que enviar:**
```json
{
  "id_documento": 105
}
```

**Lo que nosotros te devolveremos:**
```json
{
  "recomendaciones": [101, 12, 45]
}
```
