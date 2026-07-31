> **Proyecto:** TechMind – Organización Inteligente del Conocimiento Técnico  
> **Hackathon ONE G9 | Oracle Next Education + Alura Latam**
> 
> Integrantes del equipo Data: Nairobi Betancourt, Rodrigo Muñoz, Maximiliano Rodriguez  


## Fase 2
## Descripción

Esta fase corresponde al proceso de auditoría, limpieza, normalización y enriquecimiento del dataset utilizado por **TechMind**.

Su objetivo es transformar el conjunto de datos original en un dataset consistente, validado y preparado para la generación de embeddings, garantizando la calidad de la información antes de la etapa de búsqueda semántica.

El resultado de este proceso constituye la entrada oficial para la siguiente fase del proyecto, donde se generan las representaciones vectoriales utilizadas por el motor de recuperación de información.

---

# Objetivos

Durante esta fase se busca:

- Auditar el estado inicial del dataset.
- Detectar problemas de calidad de datos.
- Limpiar y normalizar el contenido textual.
- Enriquecer cada documento con metadatos relevantes.
- Generar identificadores estables para mantener la trazabilidad entre componentes.
- Preparar un dataset optimizado para la generación de embeddings.

---

# Proceso realizado

El notebook implementa el siguiente pipeline.

## 1. Auditoría inicial

Se analiza el estado del dataset verificando:

- Estructura general.
- Tipos de datos.
- Registros duplicados.
- Valores nulos.
- Distribución de documentos.
- Longitud promedio de los textos.
- Presencia de HTML, URLs y caracteres especiales.

Esta etapa permite conocer la calidad del conjunto de datos antes de aplicar cualquier transformación.

---

## 2. Limpieza del texto

Sobre el contenido textual se aplican procesos de normalización, entre ellos:

- Eliminación de etiquetas HTML.
- Eliminación de URLs.
- Normalización de espacios en blanco.
- Eliminación de saltos de línea y tabulaciones.
- Eliminación de registros vacíos.
- Eliminación de documentos duplicados.

El objetivo es conservar únicamente el contenido útil para el procesamiento posterior.

---

## 3. Enriquecimiento

Cada documento es complementado con información adicional utilizada por las siguientes fases.

Se generan automáticamente:

- **doc_id** determinístico basado en el contenido del documento mediante SHA-256.
- Idioma detectado automáticamente.
- Longitud del documento en caracteres.
- Longitud del documento en palabras.

El uso de un identificador determinístico garantiza que un mismo documento conserve siempre el mismo ID, incluso si el notebook se ejecuta nuevamente, permitiendo mantener sincronizados los distintos componentes del sistema.

---

## 4. Preparación para Embeddings

Finalmente se construye el dataset definitivo que será utilizado por la fase de generación de embeddings.

En esta etapa se:

- Crea un título corto para identificar rápidamente cada documento.
- Seleccionan únicamente las columnas necesarias.
- Renombran los campos para mantener una estructura uniforme.
- Se valida la unicidad de todos los identificadores (`doc_id`).

---

# Estructura del dataset de salida

El archivo `dataset_techmind_ready.csv` contiene la siguiente estructura:

| Columna | Descripción |
|----------|-------------|
| **doc_id** | Identificador único y determinístico del documento |
| **titulo** | Título corto generado automáticamente |
| **source_type** | Tipo o procedencia del documento |
| **texto** | Texto limpio utilizado para generar embeddings |
| **language** | Idioma detectado |
| **clean_length_chars** | Longitud del texto en caracteres |
| **clean_length_words** | Longitud del texto en palabras |

---

# Archivos generados

## `dataset_techmind_clean.csv`

Versión limpia y normalizada del dataset original.

Se conserva como respaldo del proceso de depuración y auditoría.

---

## `dataset_techmind_ready.csv`

Salida oficial de la **Fase 2**.

Este archivo constituye la entrada de la **Fase 3**, donde se generan los embeddings utilizados por el motor de búsqueda semántica.

---

# Flujo de procesamiento

```text
dataset_techmind_original.csv
            │
            ▼
      Auditoría
            │
            ▼
 Limpieza y Normalización
            │
            ▼
     Enriquecimiento
            │
            ▼
dataset_techmind_clean.csv
            │
            ▼
 Preparación para Embeddings
            │
            ▼
dataset_techmind_ready.csv
```

---

# Validaciones finales

Antes de generar el dataset definitivo se verifican automáticamente:

- Ausencia de documentos duplicados.
- Ausencia de valores nulos en las columnas principales.
- Unicidad de todos los `doc_id`.
- Distribución de idiomas.
- Distribución por tipo de documento.
- Estadísticas descriptivas de longitud del texto.

Estas validaciones garantizan la consistencia del dataset antes de ser utilizado por el motor de embeddings.

---

# Resultado de la fase

Al finalizar esta fase se obtiene un dataset estructurado, consistente y validado, compuesto por **1008 documentos técnicos**, listo para alimentar la fase de generación de embeddings y el motor de búsqueda semántica de **TechMind**.

La salida de esta fase asegura la estabilidad de los identificadores, la calidad del contenido procesado y la interoperabilidad con las etapas posteriores del proyecto, incluyendo la generación de embeddings, la búsqueda semántica, la API de Inteligencia Artificial y la integración con el backend.
