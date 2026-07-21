# TechMind — Motor de Búsqueda Semántica

Proyecto de Ciencia de Datos para la Hackathon ONE (Alura + Oracle) — Equipo G9-LATAM-Team 10.

Este notebook implementa el componente de **recuperación de información** de TechMind: dado un texto libre o el ID de un documento existente, encuentra los contenidos más similares dentro de la base de conocimiento técnico, usando embeddings semánticos multilingües.

**Integrantes de la parte de datos:** Rodrigo Muñoz, Maximiliano Rodriguez, Nairobi Betancourt

---

## Arquitectura del proyecto

El sistema se divide en dos responsabilidades separadas dentro del servicio de datos en Python:

- **`/analizar_texto`** → resuelto con Gemini (LLM): dado un texto, devuelve categoría, nivel de dificultad y keywords. No requiere modelo entrenado propio.
- **`/buscar_parecido`** → resuelto en este notebook: dado un texto libre o un `doc_id`, devuelve los 3 documentos más similares del corpus, usando embeddings + similitud de coseno.

```
Frontend (React) → Backend (Spring Boot + MySQL) → Servicio Python (FastAPI)
                                                          ├── /analizar_texto   → Gemini
                                                          └── /buscar_parecido  → este notebook
```

Spring Boot maneja persistencia, endpoints, validación y despliegue (Docker + OCI). El servicio Python solo recibe texto/ID y devuelve resultados — no maneja base de datos ni login.

---

## Descripción general

El motor de búsqueda:
1. Recibe un texto libre **o** el `doc_id` de un documento ya existente en la base.
2. Si es texto, lo codifica con un modelo de embeddings multilingüe; si es `doc_id`, reutiliza el embedding ya calculado del corpus (sin volver a pasar por el modelo).
3. Calcula similitud de coseno contra los 1008 documentos del corpus.
4. Devuelve los 3 documentos más similares en JSON.

---

## Estructura del notebook

| Paso | Contenido |
|---|---|
| 1 | Inicialización de dependencias |
| 2 | Carga del corpus real (`dataset_techmind_ready.csv`, 1008 documentos) |
| 3 | Análisis Exploratorio de Datos (EDA) |
| 4 | Limpieza ligera de texto (preserva contexto para el modelo de embeddings) |
| 5 | Generación de embeddings multilingües (Sentence Transformers) |
| 6a | Motor de búsqueda por texto libre |
| 6b | Motor de búsqueda por `doc_id` (reutiliza embeddings ya calculados) |
| 7 | `buscar_parecido`: función unificada que detecta automáticamente texto vs. `doc_id` |
| 8 | Serialización (`joblib`) |

---

## Dependencias y versiones

Ejecutable en Google Colab. Librerías utilizadas:

```
pandas
numpy
scikit-learn
sentence-transformers
matplotlib
seaborn
joblib
```

Si se ejecuta fuera de Colab, instalar con:
```bash
pip install pandas numpy scikit-learn sentence-transformers matplotlib seaborn joblib
```

**Nota importante:** la primera ejecución descarga el modelo `paraphrase-multilingual-MiniLM-L12-v2` desde Hugging Face (~450MB). El servicio que consuma el `.joblib` final (Backend/Maxi) necesita tener `sentence-transformers` instalado y el mismo modelo cargado — el archivo `.joblib` **no** es autosuficiente como lo sería un pipeline de scikit-learn puro, porque los embeddings de queries nuevos deben generarse con el mismo modelo que generó los del corpus.

---

## Cómo ejecutar el proyecto

1. Abrir el notebook en Google Colab.
2. Ejecutar las celdas en orden secuencial (Paso 1 al 8).
3. Al finalizar el Paso 8, los embeddings y metadata quedan serializados en `techmind_busqueda_v2.joblib`, listo para ser cargado por el servicio de Backend.

---

## Decisiones de diseño y resultados

### De TF-IDF a embeddings multilingües
La primera versión de este notebook usaba TF-IDF + Regresión Logística para clasificación temática. El equipo pivotó a un enfoque híbrido: Gemini resuelve la clasificación (evitando etiquetar manualmente 1008 documentos), y este notebook se enfocó solo en búsqueda semántica.

En pruebas con TF-IDF puro se detectó un problema real: **consultas en español devolvían 0 resultados** cuando no había coincidencia léxica exacta con el corpus (mayoritariamente en inglés — 976 de 1008 documentos). Ejemplo verificado: la consulta *"necesito automatizar el despliegue de contenedores en la nube"* obtuvo similitud 0.0 contra los 1008 documentos, porque TF-IDF compara palabras exactas y ninguna de esas palabras en español existía en el vocabulario del corpus en inglés.

Se migró a embeddings densos con el modelo **`paraphrase-multilingual-MiniLM-L12-v2`**, que compara significado en vez de palabras exactas, resolviendo el problema de raíz. Validado con la función `buscar_por_id`: una consulta de referencia obtuvo documentos relacionados con similitud 0.7–0.8, todos temáticamente coherentes.

### Limitaciones conocidas
- **Cobertura temática desigual del corpus:** algunos temas están muy poco representados (por ejemplo, solo 2–3 de 1008 documentos mencionan "cloud"/"docker"/"container"). Consultas sobre temas con baja cobertura pueden devolver resultados de relevancia limitada, aunque el motor de búsqueda esté funcionando correctamente — es una limitación de los datos, no del modelo.
- El campo `titulo` del dataset no es un título real: son las primeras 6 palabras del texto limpio (generado así por el equipo de datos durante la limpieza), por lo que puede leerse abrupto en la demo.
- El corpus mezcla varios idiomas (97% inglés, con francés, español y catalán en menor proporción); no se hizo normalización de idioma más allá de lo que resuelve el propio modelo multilingüe.

### Exploración adicional (crédito: Nairobi Betancourt)
Antes de definir el enfoque final, Nairobi construyó dos notebooks exploratorios probando embeddings con el modelo `all-MiniLM-L6-v2` (entrenado mayormente en inglés). Ese trabajo fue clave para detectar tempranamente el riesgo de mismatch de idioma entre queries en español y un modelo/corpus en inglés, lo que llevó a elegir directamente un modelo multilingüe en la versión final en vez de descubrir el problema más tarde. Notebooks disponibles en el repositorio como referencia para futuras iteraciones.

### Correcciones aplicadas tras revisión cruzada del equipo
Una revisión de Maximiliano sobre los notebooks de Datos detectó tres problemas antes de la integración final, ya corregidos:

- **`doc_id` inestables:** la versión inicial de Nairobi generaba `doc_id` con `uuid.uuid4()` (aleatorio en cada ejecución), lo que desincronizaba los embeddings de este notebook si el dataset se regeneraba. Se corrigió a un hash SHA256 determinístico de 16 caracteres sobre el texto del documento — el mismo contenido siempre produce el mismo `doc_id`, sin importar cuántas veces se ejecute el notebook de origen.
- **Limpieza redundante:** este notebook volvía a remover URLs y HTML que el dataset de Nairobi ya entrega limpio, gastando cómputo innecesario. Se simplificó a solo remover bloques de código (paso específico de este notebook) y normalizar espacios.
- **Umbral de búsqueda estricto:** una similitud mínima fija (`0.3`) podía devolver una lista vacía en consultas ambiguas. Se eliminó el filtro — las funciones de búsqueda siempre devuelven el top-N más cercano, dejando que el consumidor (Backend/Frontend) decida cómo tratar un score bajo.

---

## Ejemplos de solicitud y respuesta

**Ejemplo 1 — búsqueda por texto libre**

Entrada:
```json
{ "entrada": "cómo buscar texto dentro de archivos" }
```

Salida (`buscar_parecido`):
```json
{
  "resultados_similares": [
    {
      "doc_id": "1deb6d98e1a7a3fb",
      "titulo": "Contexto: Search for word in files",
      "source_type": "Tutorial_Codigo",
      "similitud_score": 0.808
    },
    {
      "doc_id": "7e5db7c2a4871191",
      "titulo": "Contexto: List all text files in",
      "source_type": "Tutorial_Codigo",
      "similitud_score": 0.767
    },
    {
      "doc_id": "645016857cf59706",
      "titulo": "Contexto: Search for a file named",
      "source_type": "Tutorial_Codigo",
      "similitud_score": 0.727
    }
  ]
}
```

**Ejemplo 2 — búsqueda por `doc_id`**

Entrada:
```json
{ "entrada": "dd7091be0f4a5017" }
```

Salida: mismo formato que el Ejemplo 1 — la función `buscar_parecido` detecta automáticamente si la entrada es un `doc_id` (hash hexadecimal de 16 caracteres) o texto libre, sin necesidad de un parámetro adicional. *(Nota: el formato de `doc_id` cambió de UUID a hash de 16 caracteres tras la corrección de estabilidad — ver sección de correcciones arriba.)*

**Ejemplo 3 — tema con baja cobertura en el corpus (limitación documentada)**

Entrada:
```json
{ "entrada": "necesito automatizar el despliegue de contenedores en la nube" }
```

Este caso ilustra la limitación de cobertura temática señalada arriba: el corpus tiene muy pocos documentos sobre cloud/DevOps, por lo que los resultados devueltos, aunque calculados correctamente, pueden tener relevancia temática limitada.

---

## Integración con OCI

El artefacto `techmind_busqueda_v2.joblib` (embeddings + metadata + nombre del modelo) está pensado para almacenarse en **OCI Object Storage** y ser cargado por el contenedor del servicio Python al iniciar. A diferencia de un pipeline de scikit-learn, este servicio también necesita tener instalado `sentence-transformers` y descargar el modelo `paraphrase-multilingual-MiniLM-L12-v2` en tiempo de build o arranque del contenedor.

---

## Roadmap

```
Fase 1.0 (MVP actual)         → Embeddings multilingües + búsqueda por coseno (este notebook)
                                  + clasificación vía Gemini (Maximiliano)
Fase 2.0 (Cobertura de datos) → Ampliar el corpus en temas subrepresentados (cloud, DevOps)
Fase 3.0 (Bases Vectoriales)  → OCI OpenSearch para búsqueda a escala
Fase 4.0 (Arquitectura RAG)   → Integración de LLMs sobre base documental de Alura
```
