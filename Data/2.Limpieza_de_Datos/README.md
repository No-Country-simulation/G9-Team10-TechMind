# Fase 2: Limpieza y Preparación de Datos

Esta fase transforma el dataset original del proyecto **TechMind** en un conjunto de datos limpio, consistente y listo para la generación de embeddings que serán utilizados en el motor de búsqueda semántica y recuperación de información.

## Objetivo

Realizar la auditoría, limpieza, normalización y enriquecimiento del dataset para garantizar la calidad de los datos antes de la fase de Machine Learning.

## Actividades realizadas

* Auditoría inicial del dataset (estructura, tipos de datos, valores nulos y duplicados).
* Limpieza de etiquetas HTML y contenido no relevante.
* Eliminación de URLs, espacios innecesarios y caracteres inconsistentes.
* Eliminación de registros vacíos y duplicados.
* Normalización de nombres de columnas.
* Generación de identificadores únicos y determinísticos (`doc_id`) a partir del contenido del documento, garantizando estabilidad entre ejecuciones.
* Detección automática del idioma de cada documento.
* Cálculo de métricas de longitud del texto (caracteres y palabras).
* Creación de un título corto para facilitar la identificación de cada documento.
* Preparación del dataset final con la estructura requerida para la generación de embeddings.

## Archivos generados

### `dataset_techmind_clean.csv`

Versión limpia del dataset original. Conserva toda la información procesada y sirve como respaldo del proceso de limpieza.

### `dataset_techmind_ready.csv`

Dataset oficial de salida de la Fase 2 y entrada de la Fase 3 (Machine Learning).

Contiene únicamente las columnas necesarias para generar embeddings:

* `doc_id`
* `titulo`
* `source_type`
* `texto`
* `language`
* `clean_length_chars`
* `clean_length_words`

## Estructura del pipeline

```
dataset_techmind_original.csv
            │
            ▼
 Auditoría y Limpieza
            │
            ▼
dataset_techmind_clean.csv
            │
            ▼
Preparación para Embeddings
            │
            ▼
dataset_techmind_ready.csv
            │
            ▼
Generación de Embeddings
            │
            ▼
Vectores
            │
            ▼
Cosine Similarity
            │
            ▼
Top 3 documentos relacionados
```

## Resultado

Al finalizar esta fase se obtiene un dataset validado, sin registros duplicados, con identificadores estables, metadatos enriquecidos y una estructura optimizada para alimentar la etapa de generación de embeddings y el motor de búsqueda semántica de TechMind.
