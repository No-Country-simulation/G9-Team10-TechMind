# CELL 3
import pandas as pd
import numpy as np
import re
import html
import uuid
# !pip install langdetect
from langdetect import detect, LangDetectException

# CELL 4
df = pd.read_csv("dataset_techmind_original.csv")
df.columns = [c.strip().lower() for c in df.columns]

print("Filas:", df.shape[0])
print("Columnas:", df.shape[1])
print(df.head())

# CELL 6
print("=== ESTRUCTURA GENERAL ===")
print("Dimensión:", df.shape)
print("Columnas:", list(df.columns))
print()

print("=== TIPOS DE DATOS ===")
print(df.dtypes)
print()

print("=== VALORES NULOS ===")
print(df.isnull().sum().sort_values(ascending=False))
print()

print("=== DUPLICADOS ===")
print("Filas duplicadas:", df.duplicated().sum())
print()

print("=== MUESTRA DE REGISTROS ===")
print(df.sample(5, random_state=42))

# CELL 7
# Detectar columna principal de texto
text_candidates = [c for c in df.columns if df[c].dtype in ["object", "string", "str"]]
print("Columnas de tipo texto:", text_candidates)

text_col = "rawtext" if "rawtext" in df.columns else (text_candidates[-1] if text_candidates else None)
print("Columna de texto usada:", text_col)

# CELL 8
if text_col:
    df[text_col] = df[text_col].fillna("").astype(str)
    df["text_length_chars"] = df[text_col].apply(len)
    df["text_length_words"] = df[text_col].apply(lambda x: len(x.split()))

    print("=== LONGITUD DEL TEXTO ===")
    print("Promedio caracteres:", round(df["text_length_chars"].mean(), 2))
    print("Mediana caracteres:", round(df["text_length_chars"].median(), 2))
    print("Promedio palabras:", round(df["text_length_words"].mean(), 2))
    print("Mediana palabras:", round(df["text_length_words"].median(), 2))

# CELL 9
# Distribución de posibles categorías
possible_category_cols = [c for c in ["sourcetype", "category", "label", "type", "class"] if c in df.columns]

print("=== COLUMNAS CATEGÓRICAS POSIBLES ===")
print(possible_category_cols)

for col in possible_category_cols:
    print(f"\nDistribución de {col}:")
    print(df[col].value_counts(dropna=False))

# CELL 10
# Ruido básico
if text_col:
    urls_count = df[text_col].str.contains(r"http[s]?://|www\.", regex=True, na=False).sum()
    html_count = df[text_col].str.contains(r"<[^>]+>", regex=True, na=False).sum()

    special_chars = df[text_col].apply(lambda x: len(re.findall(r"[^\w\sáéíóúÁÉÍÓÚñÑüÜ.,;:()\-\/]", x)))

    print("=== RUIDO BÁSICO ===")
    print("Filas con URLs:", urls_count)
    print("Filas con HTML:", html_count)
    print("Promedio de caracteres especiales raros:", round(special_chars.mean(), 2))

# CELL 12
def clean_text(text):
    if pd.isna(text):
        return ""

    text = str(text)
    text = html.unescape(text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"http[s]?://\S+|www\.\S+", " ", text)
    text = re.sub(r"[\r\n\t]+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

# CELL 13
df_clean = df.copy()

# Eliminar filas vacías y duplicados
df_clean = df_clean.dropna(how="all")
df_clean = df_clean.drop_duplicates()

# Limpiar texto
if text_col:
    df_clean[f"{text_col}_clean"] = df_clean[text_col].apply(clean_text)
    df_clean[f"{text_col}_clean"] = df_clean[f"{text_col}_clean"].str.replace(r"\s+", " ", regex=True).str.strip()

    # Eliminar textos vacíos
    df_clean = df_clean[df_clean[f"{text_col}_clean"].str.len() > 0].copy()

print("Filas después de limpieza:", df_clean.shape[0])
print(df_clean.head())

# CELL 15
def detect_language_safe(text):
    try:
        if not text or len(text.strip()) < 10:
            return "unknown"
        return detect(text)
    except LangDetectException:
        return "unknown"
    except Exception:
        return "unknown"

# CELL 16
if text_col:
    df_clean["doc_id"] = [str(uuid.uuid4()) for _ in range(len(df_clean))]
    df_clean["language"] = df_clean[f"{text_col}_clean"].apply(detect_language_safe)
    df_clean["clean_length_chars"] = df_clean[f"{text_col}_clean"].str.len()
    df_clean["clean_length_words"] = df_clean[f"{text_col}_clean"].str.split().apply(len)

print(df_clean[[col for col in ["doc_id", "language", "clean_length_chars", "clean_length_words"]
        if col in df_clean.columns]].head())

# CELL 17
print("=== DISTRIBUCIÓN DE IDIOMA ===")
print(df_clean["language"].value_counts(dropna=False))

# CELL 19
# Preparación para Embeddings

print("Preparando dataset para generación de embeddings...")

df_embeddings = df_clean.copy()

# Crear un título corto usando las primeras palabras
df_embeddings["titulo"] = (
    df_embeddings[f"{text_col}_clean"]
    .fillna("")
    .astype(str)
    .str.split()
    .str[:6]
    .str.join(" ")
)

# Seleccionar únicamente las columnas necesarias
dataset_embeddings = (
    df_embeddings[
        [
            "doc_id",
            "titulo",
            "source_type",
            f"{text_col}_clean",
            "language",
            "clean_length_chars",
            "clean_length_words"
        ]
    ]
    .rename(columns={f"{text_col}_clean": "texto"})
)

print("Dataset listo para la siguiente etapa (Generación de Embeddings).")
print(dataset_embeddings.head())

# CELL 21
# Dataset limpio
df_clean.to_csv(
    "dataset_techmind_clean.csv",
    index=False
)

# Dataset listo para generar embeddings - entrada del Notebook ML
dataset_embeddings.to_csv(
    "dataset_techmind_ready.csv",
    index=False
)

print("✔ dataset_techmind_clean.csv generado")
print("✔ dataset_techmind_ready.csv generado")

# CELL 23
# Control Final

print("\n========== VALIDACIÓN FINAL ==========")

print(f"\nTotal de documentos: {len(dataset_embeddings)}")
print(f"Duplicados: {dataset_embeddings.duplicated().sum()}")

print("\nValores nulos por columna:")
print(dataset_embeddings.isnull().sum())

print("\nIdiomas detectados:")
print(dataset_embeddings["language"].value_counts())

print("\nTipos de documento:")
print(dataset_embeddings["source_type"].value_counts())

print("\nEstadísticas de longitud del texto (palabras):")
print(dataset_embeddings["clean_length_words"].describe().round(2))

print("\nDataset listo para la generación de embeddings.")
