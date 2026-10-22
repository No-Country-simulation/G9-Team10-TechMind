# 🧠 TechMind — Data Cleaning & Preparation for Embeddings

Phase 2 · Data Auditing · Text Normalization · Metadata Enrichment · Data Quality

## Project Context

TechMind — Intelligent Organization of Technical Knowledge — is a collaborative project developed for the Hackathon ONE G9, organized by Oracle Next Education and Alura Latam.

The platform is designed to organize technical content and support knowledge retrieval through semantic search.

This directory documents the data preparation stage. It focuses on transforming raw technical documents into a structured, validated dataset for downstream embedding generation.


## 🎯 Phase Objective

Audit, clean, normalize and enrich the source dataset to provide reliable input for TechMind's embedding generation and semantic search components.

The output of this phase serves as the official input for Phase 3, where documents are converted into vector representations.

### Key Objectives

- Assess the initial structure and quality of the dataset.
- Identify missing values, duplicate documents and text formatting issues.
- Clean and normalize document content.
- Enrich documents with relevant metadata.
- Generate content-based identifiers to support traceability.
- Export a consistent dataset ready for embedding generation.

## ⚙️ Data Preparation Pipeline

### 1. Initial Data Audit

The notebook examines the source dataset before applying transformations.

The audit covers:

- Dataset structure and column data types.
- Duplicate records.
- Missing values.
- Distribution of document types.
- Average text length.
- Presence of HTML, URLs and special characters.

This step establishes the initial condition of the data and identifies the issues addressed during cleaning.

### 2. Text Cleaning & Normalization

The text processing stage includes:

- Removing HTML tags.
- Removing URLs.
- Normalizing whitespace.
- Removing line breaks and tab characters.
- Removing records with empty text.
- Removing duplicate documents.

The goal is to retain usable document content in a consistent format for downstream processing.

### 3. Metadata Enrichment

Each document is enriched with additional fields to support traceability and downstream integration:

- A deterministic `doc_id` generated from document content using SHA-256.
- Automatically detected language.
- Text length in characters.
- Text length in words.

Content-based identifiers support consistent references across system components. When the same document content is processed using the same normalization and hashing procedure, it produces the same identifier.

### 4. Preparation for Embedding Generation

The final transformation stage prepares the official dataset for Phase 3.

This includes:

- Creating a short title for each document.
- Selecting the required output columns.
- Renaming fields to maintain a consistent schema.
- Validating the uniqueness of all `doc_id` values.
- Exporting the embedding-ready dataset.

Embedding generation is performed in the next phase and is outside the scope of this directory.

## 🗂️ Output Dataset Schema

The final file, `dataset_techmind_ready.csv`, contains the following columns.

Original field names are preserved to maintain compatibility with downstream components.

| Column | Description |
|---|---|
| `doc_id` | Unique, deterministic identifier generated from document content. |
| `titulo` | Automatically generated short document title. |
| `source_type` | Document type or source category. |
| `texto` | Cleaned document text used as input for embedding generation. |
| `language` | Automatically detected document language. |
| `clean_length_chars` | Length of the cleaned text in characters. |
| `clean_length_words` | Length of the cleaned text in words. |

## 📦 Generated Files

### `dataset_techmind_clean.csv`

Cleaned and normalized version of the source dataset.

This file is retained as an intermediate output to support review, auditing and traceability of the preparation process.

### `dataset_techmind_ready.csv`

Official output of Phase 2 and input for Phase 3.

This file contains the selected fields and validated identifiers required for downstream embedding generation.

## 🔄 Processing Flow

```text
dataset_techmind_original.csv
              |
              v
       Initial Data Audit
              |
              v
 Text Cleaning & Normalization
              |
              v
     Metadata Enrichment
              |
              v
 dataset_techmind_clean.csv
              |
              v
 Preparation for Embeddings
              |
              v
 dataset_techmind_ready.csv
              |
              v
 Phase 3: Embedding Generation
```

## ✅ Final Data Quality Checks

Before exporting the final dataset, the notebook checks:

- Absence of duplicate documents.
- Absence of missing values in the main columns.
- Uniqueness of all `doc_id` values.

It also reviews:

- Language distribution.
- Distribution by document type.
- Descriptive statistics for text length.

Together, these checks document the condition of the output dataset before it is passed to the next stage.

## 📊 Phase Results

The final output contains 1,008 technical documents in a structured, cleaned and validated dataset, ready for embedding generation.

This phase provides:

- Normalized text for downstream processing.
- Content-based document identifiers for traceability.
- Metadata to support document inspection and integration.
- A consistent schema for handoff to the next development stage.

The prepared dataset supports subsequent work on embedding generation, semantic search, the AI API and backend integration.

## 💼 Business & Technical Value

This phase turns raw technical content into a consistent data asset that other project components can consume.

Its contribution focuses on:

- Data quality: addressing missing values, duplicates and formatting issues before downstream processing.
- Traceability: linking processed documents through deterministic identifiers.
- Integration readiness: providing a defined output schema for the next phase.
- Team handoff: documenting the transformation process and its deliverables.

## 🔎 Scope of This Phase

### Included

- Data auditing.
- Text cleaning and normalization.
- Metadata enrichment.
- Deterministic identifier generation.
- Dataset validation and CSV export.

### Handled in Other Project Phases

- Embedding generation.
- Semantic search implementation.
- AI API development.
- Frontend and backend application development.

## 👥 Credits

Developed as part of the TechMind collaborative project.

Data Team: Nairobi Betancourt, Rodrigo Muñoz and Maximiliano Rodriguez.

Hackathon ONE G9 | Oracle Next Education + Alura Latam

👤 Autor
Nairobi Betancourt
Data Science | Oracle ONE Alura | Agosto 2026



> **Proyecto:** TechMind – Organización Inteligente del Conocimiento Técnico  
> **Hackathon ONE G9 | Oracle Next Education + Alura Latam**
> 
> Integrantes del equipo Data: Nairobi Betancourt, Rodrigo Muñoz, Maximiliano Rodriguez
>
> 


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
