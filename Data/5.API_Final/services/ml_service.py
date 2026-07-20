import os
import joblib
import numpy as np
import onnxruntime as ort
from tokenizers import Tokenizer

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
ONNX_MODEL_DIR = os.path.join(MODELS_DIR, 'onnx_model_quantized')

import hashlib

# Cargar artefactos
try:
    dataset_ref = joblib.load(os.path.join(MODELS_DIR, 'dataset_reference.joblib'))
    
    # Parche ADR-002: Generar doc_id determinista con MD5 si el CSV base no lo incluye
    if 'doc_id' not in dataset_ref.columns:
        dataset_ref['doc_id'] = dataset_ref.apply(
            lambda row: hashlib.md5((str(row['title']) + str(row.get('clean_text', ''))).encode('utf-8')).hexdigest(),
            axis=1
        )
    if 'source_type' not in dataset_ref.columns:
        dataset_ref['source_type'] = "Documento_Referencia"
        
    corpus_embeddings = np.load(os.path.join(MODELS_DIR, 'corpus_embeddings.npy'))
    
    # Cargar IA ONNX
    tokenizer = Tokenizer.from_file(os.path.join(ONNX_MODEL_DIR, "tokenizer.json"))
    session = ort.InferenceSession(os.path.join(ONNX_MODEL_DIR, "model_quantized.onnx"))
except FileNotFoundError:
    dataset_ref, corpus_embeddings, tokenizer, session = None, None, None, None
    print("Advertencia: No se encontraron los modelos ONNX o los embeddings del corpus.")

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
    
    # Mean Pooling (El equivalente a lo que hace sentence-transformers internamente)
    sentence_embeddings = mean_pooling(outputs[0], inputs['attention_mask'])
    
    # Normalización (L2) para que el Producto Punto actúe como Similitud de Coseno
    norm = np.linalg.norm(sentence_embeddings, axis=1, keepdims=True)
    sentence_embeddings = sentence_embeddings / np.clip(norm, a_min=1e-9, a_max=None)
    
    return sentence_embeddings[0]

def buscar_similares(keywords: str, top_k: int = 5):
    """
    Busca los documentos más relevantes comparando el vector de la pregunta
    contra la matriz pre-calculada de toda la base de datos.
    """
    if session is None or corpus_embeddings is None:
        return {"error": "El modelo ONNX o los embeddings no están cargados."}
    
    # 1. Convertir la pregunta (Español) a Vector Semántico Universal
    query_vector = get_embedding(keywords)
    
    # 2. Calcular la similitud contra todos los documentos (Inglés) usando Producto Punto
    similitudes = np.dot(corpus_embeddings, query_vector)
    
    # 3. Obtener los índices con mayor similitud
    indices_top = similitudes.argsort()[::-1][:top_k]
    
    # 4. Armar la respuesta
    resultados = []
    for idx in indices_top:
        score = float(similitudes[idx])
        if score > 0.0:
            row = dataset_ref.iloc[idx]
            resultados.append({
                "doc_id": row['doc_id'],
                "title": row['title'],
                "source_type": row['source_type'],
                "similarity_score": round(score, 4),
                "preview": row['clean_text'][:200] + "..." if len(row['clean_text']) > 200 else row['clean_text']
            })
            
    return {"resultados": resultados}

def buscar_por_id(doc_id: str, top_k: int = 3):
    """
    Busca documentos similares a un documento existente dado su doc_id.
    Reutiliza el vector matemático pre-calculado, sin pasar por la red neuronal.
    """
    if session is None or corpus_embeddings is None:
        return {"error": "El modelo ONNX o los embeddings no están cargados."}
        
    # Encontrar el índice del documento
    coincidencias = dataset_ref.index[dataset_ref['doc_id'] == doc_id].tolist()
    if not coincidencias:
        return {"error": "doc_id no encontrado"}
        
    idx_referencia = coincidencias[0]
    vector_ref = corpus_embeddings[idx_referencia]
    
    # Calcular similitud (producto punto)
    similitudes = np.dot(corpus_embeddings, vector_ref)
    
    # Anular la similitud del documento consigo mismo para que no aparezca el primero
    similitudes[idx_referencia] = -1.0
    
    # Obtener los top K
    indices_top = similitudes.argsort()[::-1][:top_k]
    
    resultados = []
    for idx in indices_top:
        score = float(similitudes[idx])
        if score > 0.0:
            row = dataset_ref.iloc[idx]
            resultados.append({
                "doc_id": row['doc_id'],
                "title": row['title'],
                "source_type": row['source_type'],
                "similarity_score": round(score, 4),
                "preview": row['clean_text'][:200] + "..." if len(row['clean_text']) > 200 else row['clean_text']
            })
            
    return {"resultados": resultados}
