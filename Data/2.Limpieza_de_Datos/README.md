# 🧠 TechMind — Automated ETL Pipeline & Text Data Preparation

**Phase 2 · Data Auditing · Text Normalization · Metadata Enrichment · Data Quality**

## 🚀 Project Overview
High-quality AI outputs and deep text analytics rely entirely on clean data. **TechMind** (Intelligent Organization of Technical Knowledge) is an AI-powered platform designed to organize technical content and support knowledge retrieval through semantic search. 

This repository isolates the **Data Preparation & ETL stage**. It focuses on transforming raw, unstructured technical documents into a strictly validated dataset ready for downstream machine learning and embedding generation.

## 🎯 Phase Objective & Business Value
The goal of this pipeline is to audit, clean, normalize, and enrich the source dataset to provide a mathematically reliable input for TechMind's vector representations. 

By addressing missing values, duplicates, and formatting anomalies early, this pipeline ensures high data quality, strict traceability (via deterministic IDs), and a seamless handoff to the AI & semantic search components.

## ⚙️ Data Preparation Pipeline

### 1. Initial Data Audit
The pipeline begins by examining the source dataset before applying transformations, covering:
*   Dataset structure and column data types.
*   Identification of duplicate records and missing values.
*   Distribution of document types and average text length.
*   Detection of HTML, URLs, and special characters.

### 2. Text Cleaning & Normalization
To ensure high-quality AI embeddings, the text processing stage executes:
*   Removal of HTML tags and URLs.
*   Whitespace normalization (removing line breaks and tab characters).
*   Elimination of empty records and duplicate documents.

### 3. Metadata Enrichment
Each document is enriched with actionable metadata to support traceability:
*   **Deterministic ID (`doc_id`):** Generated from document content using **SHA-256 cryptography**. When the same document content is processed, it produces the exact same identifier, ensuring data lineage across system components.
*   **Language Detection:** Automatically identified language tags.
*   **Length Metrics:** Character and word counts for downstream filtering.

### 4. Preparation for Embedding Generation
The final output is formatted to maintain a consistent schema for Phase 3 (Vectorization):
*   Creation of a short, readable title for each document.
*   Strict validation of `doc_id` uniqueness.
*   Export of the embedding-ready dataset.

---

## 🗂️ Output Dataset Schema

The final export (`dataset_techmind_ready.csv`) contains 1,008 strictly validated technical documents.

| Column | Description |
| :--- | :--- |
| `doc_id` | Unique, deterministic identifier generated via SHA-256. |
| `titulo` | Automatically generated short document title. |
| `source_type` | Document type or source category. |
| `texto` | Cleaned document text used as the exact input for embedding generation. |
| `language` | Automatically detected document language. |
| `clean_length_chars` | Length of the cleaned text in characters. |
| `clean_length_words` | Length of the cleaned text in words. |

---

## 🔄 Processing Flow

```text
 [ dataset_techmind_original.csv ]
                │
                ▼
        Initial Data Audit
                │
                ▼
   Text Cleaning & Normalization
                │
                ▼
       Metadata Enrichment
                │
                ▼
  [ dataset_techmind_clean.csv ] (Intermediate backup)
                │
                ▼
   Preparation for Embeddings
                │
                ▼
  [ dataset_techmind_ready.csv ] (Production-ready)
                │
                ▼
    Phase 3: Embedding Generation

👥 Credits

Developed as part of the TechMind collaborative project.

Data Team: Nairobi Betancourt, Rodrigo Muñoz and Maximiliano Rodriguez.

Hackathon ONE G9 | Oracle Next Education + Alura Latam

👤 Autor Nairobi Betancourt Data Science | Oracle ONE Alura | Agosto 2026
