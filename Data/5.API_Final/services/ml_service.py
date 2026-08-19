import os
import joblib
import numpy as np
import pandas as pd
import onnxruntime as ort
from tokenizers import Tokenizer
import hashlib

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
ONNX_MODEL_DIR = os.path.join(MODELS_DIR, 'onnx_model_quantized')

# Cargar artefactos
try:
    raw_dataset = joblib.load(os.path.join(MODELS_DIR, 'dataset_reference.joblib'))
    
    # Normalización del dataset: Si es un diccionario (ej. {'metadata_docs': [...]}), convertirlo a DataFrame
    if isinstance(raw_dataset, dict):
        if 'metadata_docs' in raw_dataset:
            dataset_ref = pd.DataFrame(raw_dataset['metadata_docs'])
        else:
            dataset_ref = pd.DataFrame(raw_dataset)
    elif isinstance(raw_dataset, pd.DataFrame):
        dataset_ref = raw_dataset
    else:
        dataset_ref = pd.DataFrame(list(raw_dataset))

    # Determinar columnas flexibles de título y texto
    col_titulo = next((c for c in ['title', 'titulo', 'name', 'nombre'] if c in dataset_ref.columns), dataset_ref.columns[0])
    col_texto = next((c for c in ['clean_text', 'text', 'texto', 'content', 'clean_content'] if c in dataset_ref.columns), col_titulo)

    # Parche ADR-002: Generar doc_id determinista con MD5 si el dataset no lo incluye
    if 'doc_id' not in dataset_ref.columns:
        dataset_ref['doc_id'] = dataset_ref.apply(
            lambda row: hashlib.md5((str(row.get(col_titulo, '')) + str(row.get(col_texto, ''))).encode('utf-8')).hexdigest(),
            axis=1
        )

    if 'source_type' not in dataset_ref.columns:
        dataset_ref['source_type'] = "Documento_Referencia"
        
    corpus_embeddings = np.load(os.path.join(ONNX_MODEL_DIR, 'corpus_embeddings.npy'))
    
    # Normalizar la matriz de corpus para que el producto punto sea una Similitud de Coseno real (0 a 1)
    corpus_norms = np.linalg.norm(corpus_embeddings, axis=1, keepdims=True)
    corpus_embeddings = corpus_embeddings / np.clip(corpus_norms, a_min=1e-9, a_max=None)
    
    # Cargar IA ONNX
    tokenizer = Tokenizer.from_file(os.path.join(ONNX_MODEL_DIR, "tokenizer.json"))
    session = ort.InferenceSession(os.path.join(ONNX_MODEL_DIR, "model_quantized.onnx"))

except Exception as e:
    dataset_ref, corpus_embeddings, tokenizer, session = None, None, None, None
    print(f"Advertencia: No se pudieron cargar los modelos ONNX o dataset. Detalle: {e}")

def mean_pooling(model_output, attention_mask):
    """Promedia los vectores de cada palabra (token) prestando atención a la máscara"""
    token_embeddings = model_output
    input_mask_expanded = np.expand_dims(attention_mask, -1)
    input_mask_expanded = np.broadcast_to(input_mask_expanded, token_embeddings.shape)
    
    sum_embeddings = np.sum(token_embeddings * input_mask_expanded, axis=1)
    sum_mask = np.clip(np.sum(input_mask_expanded, axis=1), a_min=1e-9, a_max=None)
    return sum_embeddings / sum_mask

def get_embedding(text: str):
    """Genera el vector embedding multilingüe usando ONNX (sin PyTorch)"""
    encoded = tokenizer.encode(text)
    inputs = {
        "input_ids": np.array([encoded.ids], dtype=np.int64),
        "attention_mask": np.array([encoded.attention_mask], dtype=np.int64),
        "token_type_ids": np.array([encoded.type_ids], dtype=np.int64)
    }
    
    # Inferencia ultra-rápida en CPU
    outputs = session.run(None, inputs)
    
    # Mean Pooling
    sentence_embeddings = mean_pooling(outputs[0], inputs['attention_mask'])
    
    # Normalización (L2) para que el Producto Punto actúe como Similitud de Coseno
    norm = np.linalg.norm(sentence_embeddings, axis=1, keepdims=True)
    sentence_embeddings = sentence_embeddings / np.clip(norm, a_min=1e-9, a_max=None)
    
    return sentence_embeddings[0]

def registrar_documento(doc_id: str, titulo: str, texto: str):
    """
    Registra dinámicamente un documento nuevo en el espacio vectorial en memoria
    para que esté disponible inmediatamente en búsquedas y recomendaciones.
    """
    global dataset_ref, corpus_embeddings
    if session is None or dataset_ref is None or corpus_embeddings is None:
        return
    
    # Evitar duplicados
    if (dataset_ref['doc_id'].astype(str) == str(doc_id)).any():
        return
        
    try:
        vector = get_embedding(texto)
        nuevo_doc = pd.DataFrame([{
            'doc_id': str(doc_id),
            'titulo': str(titulo),
            'source_type': 'Documento_Usuario',
            'texto': str(texto)
        }])
        dataset_ref = pd.concat([dataset_ref, nuevo_doc], ignore_index=True)
        corpus_embeddings = np.vstack([corpus_embeddings, vector.reshape(1, -1)])
    except Exception as e:
        print(f"Error al registrar documento vectorial: {e}")

def buscar_similares(keywords: str, top_k: int = 5):
    """
    Busca los documentos más relevantes comparando el vector de la pregunta
    contra la matriz pre-calculada de toda la base de datos.
    """
    if session is None or corpus_embeddings is None or dataset_ref is None:
        return {"error": "El modelo ONNX, el dataset o los embeddings no están cargados."}
    
    # Identificar columnas
    col_titulo = next((c for c in ['title', 'titulo', 'name', 'nombre'] if c in dataset_ref.columns), dataset_ref.columns[0])
    col_texto = next((c for c in ['clean_text', 'text', 'texto', 'content', 'clean_content'] if c in dataset_ref.columns), col_titulo)

    # 1. Convertir la consulta a Vector Semántico
    query_vector = get_embedding(keywords)
    
    # 2. Calcular la similitud con la matriz del corpus
    similitudes = np.dot(corpus_embeddings, query_vector)
    
    # 3. Obtener los índices con mayor similitud
    indices_top = similitudes.argsort()[::-1][:top_k]
    
    # 4. Armar la respuesta
    resultados = []
    for idx in indices_top:
        score = float(similitudes[idx])
        if score > 0.0:
            row = dataset_ref.iloc[idx]
            texto_full = str(row.get(col_texto, ''))
            resultados.append({
                "doc_id": str(row['doc_id']),
                "title": str(row.get(col_titulo, 'Sin título')),
                "source_type": str(row.get('source_type', 'Documento_Referencia')),
                "similarity_score": round(score, 4),
                "preview": texto_full[:200] + "..." if len(texto_full) > 200 else texto_full
            })
            
    return {"resultados": resultados}

def buscar_por_id(doc_id: str, top_k: int = 3):
    """
    Busca documentos similares a un documento existente dado su doc_id.
    Reutiliza el vector matemático pre-calculado, sin pasar por la red neuronal.
    Si el doc_id no existe, retorna una lista vacía de forma elegante.
    """
    if session is None or corpus_embeddings is None or dataset_ref is None:
        return {"error": "El modelo ONNX, el dataset o los embeddings no están cargados."}
        
    col_titulo = next((c for c in ['title', 'titulo', 'name', 'nombre'] if c in dataset_ref.columns), dataset_ref.columns[0])
    col_texto = next((c for c in ['clean_text', 'text', 'texto', 'content', 'clean_content'] if c in dataset_ref.columns), col_titulo)

    # Encontrar el índice del documento
    coincidencias = dataset_ref.index[dataset_ref['doc_id'].astype(str) == str(doc_id)].tolist()
    if not coincidencias:
        # Fallback elegante: si no se encuentra en el índice estático, retornar vacío sin error 500/404
        return {"resultados": []}
        
    idx_referencia = coincidencias[0]
    vector_ref = corpus_embeddings[idx_referencia]
    
    # Calcular similitud (producto punto)
    similitudes = np.dot(corpus_embeddings, vector_ref)
    
    # Anular el documento consigo mismo
    similitudes[idx_referencia] = -1.0
    
    # Obtener Top K
    indices_top = similitudes.argsort()[::-1][:top_k]
    
    resultados = []
    for idx in indices_top:
        score = float(similitudes[idx])
        if score > 0.0:
            row = dataset_ref.iloc[idx]
            texto_full = str(row.get(col_texto, ''))
            resultados.append({
                "doc_id": str(row['doc_id']),
                "title": str(row.get(col_titulo, 'Sin título')),
                "source_type": str(row.get('source_type', 'Documento_Referencia')),
                "similarity_score": round(score, 4),
                "preview": texto_full[:200] + "..." if len(texto_full) > 200 else texto_full
            })
            
    return {"resultados": resultados}