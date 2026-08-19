# CELL 2
import re
import json
import time
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

import nltk
from nltk.corpus import stopwords
nltk.download('stopwords', quiet=True)

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

import joblib

sns.set_theme(style="whitegrid")
print("Entorno inicializado.")

# CELL 4
df = pd.read_csv("dataset_techmind_ready.csv")
print("Filas:", df.shape[0])
df.head()

# CELL 5
print(df.columns.tolist())
print(df.shape)

# CELL 7
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

sns.countplot(data=df, x='source_type', hue='source_type', legend=False, palette='Blues_r', ax=axes[0])
axes[0].set_title('Distribución por tipo de documento', fontweight='bold')
axes[0].tick_params(axis='x', rotation=30)

sns.boxplot(data=df, x='source_type', y='clean_length_words', hue='source_type', legend=False, palette='Blues', ax=axes[1])
axes[1].set_title('Longitud de texto por tipo de documento', fontweight='bold')
axes[1].tick_params(axis='x', rotation=30)

plt.tight_layout()
plt.show()

print(df['language'].value_counts())

# CELL 9
def limpiar_texto_ligero(texto: str) -> str:
    if not isinstance(texto, str):
        return ""
    texto = re.sub(r'```.*?```', '', texto, flags=re.DOTALL)  # quita bloques de código, no aportan semántica
    texto = re.sub(r'\s+', ' ', texto).strip()
    return texto

df['texto_para_embedding'] = df['texto'].apply(limpiar_texto_ligero)
df[['titulo', 'texto_para_embedding']].head(3)

# CELL 11
# !pip install -q sentence-transformers
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

embeddings = model.encode(
    df['texto_para_embedding'].tolist(),
    show_progress_bar=True,
    batch_size=32
)
print("Shape de embeddings:", embeddings.shape)

# CELL 13
def buscar_por_texto(query_texto: str, top_n: int = 3):
    vector_query = model.encode([query_texto])
    puntuaciones = cosine_similarity(vector_query, embeddings).flatten()
    indices = np.argsort(puntuaciones)[-top_n:][::-1]

    resultados = []
    for i in indices:
        resultados.append({
            'doc_id': df.iloc[i]['doc_id'],
            'titulo': df.iloc[i]['titulo'],
            'source_type': df.iloc[i]['source_type'],
            'similitud_score': round(float(puntuaciones[i]), 3)
        })
    return resultados

# CELL 15
def buscar_por_id(doc_id: str, top_n: int = 3):
    # 1. Localizar la posición del documento de referencia
    coincidencias = df.index[df['doc_id'] == doc_id]
    if len(coincidencias) == 0:
        return {'error': f'doc_id no encontrado: {doc_id}'}
    indice_referencia = coincidencias[0]

    # 2. Reutilizamos el embedding ya calculado, sin volver a pasar por el modelo
    vector_referencia = embeddings[indice_referencia].reshape(1, -1)
    puntuaciones = cosine_similarity(vector_referencia, embeddings).flatten()

    # 3. Excluimos el propio documento del resultado (siempre tendría score 1.0 consigo mismo)
    puntuaciones[indice_referencia] = -1

    indices = np.argsort(puntuaciones)[-top_n:][::-1]
    resultados = []
    for i in indices:
        resultados.append({
            'doc_id': df.iloc[i]['doc_id'],
            'titulo': df.iloc[i]['titulo'],
            'source_type': df.iloc[i]['source_type'],
            'similitud_score': round(float(puntuaciones[i]), 3)
        })
    return resultados

# Prueba: buscar documentos parecidos al primero del dataset
print(json.dumps(buscar_por_id(df.iloc[0]['doc_id']), indent=2, ensure_ascii=False))

# CELL 17
def es_doc_id_valido(entrada: str) -> bool:
    # El nuevo formato de doc_id de Nairo: hash SHA256 truncado a 16 caracteres hex, sin guiones
    return bool(re.fullmatch(r'[0-9a-fA-F]{16}', entrada.strip()))

def buscar_parecido(entrada: str, top_n: int = 3) -> str:
    if es_doc_id_valido(entrada):
        resultados = buscar_por_id(entrada, top_n=top_n)
    else:
        resultados = buscar_por_texto(entrada, top_n=top_n)
    return json.dumps({"resultados_similares": resultados}, indent=2, ensure_ascii=False)

# Prueba 1: por texto en español (el caso que antes fallaba)
print(buscar_parecido("necesito automatizar el despliegue de contenedores en la nube"))

# Prueba 2: por doc_id
print(buscar_parecido(df.iloc[0]['doc_id']))

# CELL 19
artefacto_busqueda = {
    'embeddings': embeddings,
    'metadata_docs': df[['doc_id', 'titulo', 'source_type']],
    'model_name': 'paraphrase-multilingual-MiniLM-L12-v2'
}
joblib.dump(artefacto_busqueda, "techmind_busqueda_v2.joblib")
print("OK techmind_busqueda_v2.joblib generado")

# CELL 20
# 1. Verificar que el ID de referencia corresponde al documento que esperamos
print(df[df['doc_id'] == 'dd7091be0f4a5017'][['doc_id', 'titulo', 'texto']].to_string())
print()

# 2. Verificar que df y embeddings tienen el mismo tamaño (alineación básica)
print("Filas en df:", len(df))
print("Filas en embeddings:", embeddings.shape[0])
print("¿Coinciden?", len(df) == embeddings.shape[0])
print()

# 3. Verificar la posición exacta y que el embedding en esa posición es consistente
idx = df.index[df['doc_id'] == 'dd7091be0f4a5017'][0]
print("Posición encontrada:", idx)
print("Título en esa posición:", df.iloc[idx]['titulo'])

# CELL 22
print(buscar_parecido("dd7091be0f4a5017"))

# CELL 23

