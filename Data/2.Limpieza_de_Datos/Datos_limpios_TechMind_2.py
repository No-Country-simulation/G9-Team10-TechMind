# CELL 3
import pandas as pd
import numpy as np
import re
import html
import hashlib
# !pip install -q langdetect
from langdetect import detect, LangDetectException

# CELL 4
df = pd.read_csv("dataset_techmind_original.csv")
df.columns = [c.strip().lower() for c in df.columns]

# Normalizar nombres de columnas
if "sourcetype" in df.columns:
    df.rename(columns={"sourcetype": "source_type"}, inplace=True)

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

if "raw_text" not in df.columns:
    raise ValueError("No se encontró la columna 'raw_text'.")

text_col = "raw_text"
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
# Ruido básico
if text_col:
    urls_count = df[text_col].str.contains(r"http[s]?://|www\.", regex=True, na=False).sum()
    html_count = df[text_col].str.contains(r"<[^>]+>", regex=True, na=False).sum()

    special_chars = df[text_col].apply(lambda x: len(re.findall(r"[^\w\sáéíóúÁÉÍÓÚñÑüÜ.,;:()\-\/]", x)))

    print("=== RUIDO BÁSICO ===")
    print("Filas con URLs:", urls_count)
    print("Filas con HTML:", html_count)
    print("Promedio de caracteres especiales raros:", round(special_chars.mean(), 2))

# CELL 11
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

# CELL 12
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

# CELL 14
def generate_doc_id(text):
    """
    Genera un ID determinístico a partir del contenido del documento.
    El mismo texto siempre tendrá el mismo ID.
    """
    text = re.sub(r"\s+", " ", str(text).strip())
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]


def detect_language_safe(text):
    try:
        if not text or len(text.strip()) < 10:
            return "unknown"
        return detect(text)
    except LangDetectException:
        return "unknown"


if text_col:

    # ID estable
    df_clean["doc_id"] = (
        df_clean[f"{text_col}_clean"]
        .apply(generate_doc_id)
    )

    # Idioma
    df_clean["language"] = (
        df_clean[f"{text_col}_clean"]
        .apply(detect_language_safe)
    )

    # Longitudes
    df_clean["clean_length_chars"] = (
        df_clean[f"{text_col}_clean"]
        .str.len()
    )

    df_clean["clean_length_words"] = (
        df_clean[f"{text_col}_clean"]
        .str.split()
        .apply(len)
    )

print(
    df_clean[
        [
            "doc_id",
            "language",
            "clean_length_chars",
            "clean_length_words"
        ]
    ].head()
)

print("=== DISTRIBUCIÓN DE IDIOMA ===")
print(df_clean["language"].value_counts(dropna=False))

# CELL 16
# Preparación para Embeddings

print("Preparando dataset para generación de embeddings...")

df_embeddings = df_clean.copy()

# Crear título usando las primeras palabras
df_embeddings["titulo"] = (
    df_embeddings[f"{text_col}_clean"]
    .fillna("")
    .astype(str)
    .str.split()
    .str[:6]
    .str.join(" ")
)

# Construir dataset final
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

# Validar que no existan IDs repetidos
assert dataset_embeddings["doc_id"].is_unique, "Existen doc_id duplicados"

print("OK IDs únicos verificados")

print("Dataset listo para la siguiente etapa (Generación de Embeddings).")
print(dataset_embeddings.head())

# CELL 18
# Salida Fase 2
# Dataset limpio para auditoría y respaldo
df_clean.to_csv(
    "dataset_techmind_clean.csv",
    index=False
)

# Entrada oficial para la Fase 3 (Embeddings)
dataset_embeddings.to_csv(
    "dataset_techmind_ready.csv",
    index=False
)

print("OK dataset_techmind_clean.csv generado")
print("OK dataset_techmind_ready.csv generado")

# CELL 20
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
