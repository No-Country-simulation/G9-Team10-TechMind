import os
import joblib
import numpy as np
import onnxruntime as ort
from tokenizers import Tokenizer
import pandas as pd

def mean_pooling(model_output, attention_mask):
    token_embeddings = model_output
    input_mask_expanded = np.expand_dims(attention_mask, -1)
    input_mask_expanded = np.broadcast_to(input_mask_expanded, token_embeddings.shape)
    
    sum_embeddings = np.sum(token_embeddings * input_mask_expanded, axis=1)
    sum_mask = np.clip(np.sum(input_mask_expanded, axis=1), a_min=1e-9, a_max=None)
    return sum_embeddings / sum_mask

def main():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    MODELS_DIR = os.path.abspath(os.path.join(current_dir, "..", "models"))
    ONNX_MODEL_DIR = os.path.join(MODELS_DIR, 'onnx_model_quantized')
    
    print("[*] Cargando modelo ONNX local...")
    tokenizer = Tokenizer.from_file(os.path.join(ONNX_MODEL_DIR, "tokenizer.json"))
    session = ort.InferenceSession(os.path.join(ONNX_MODEL_DIR, "model_quantized.onnx"))
    
    print("[*] Cargando base de datos de texto (dataset_reference.joblib)...")
    dataset_path = os.path.join(MODELS_DIR, 'dataset_reference.joblib')
    if not os.path.exists(dataset_path):
        print(f"[-] ERROR: No se encontró el dataset en {dataset_path}")
        return
        
    dataset_ref = joblib.load(dataset_path)
    textos = dataset_ref['clean_text'].tolist()
    
    total = len(textos)
    print(f"[*] Generando embeddings para {total} documentos. Esto tomará un par de minutos...")
    corpus_embeddings = []
    
    # Procesar uno por uno
    for i, text in enumerate(textos):
        if i > 0 and i % 500 == 0:
            print(f"    -> Procesados {i}/{total} documentos...")
        # Asegurar que sea string
        text = str(text)
        
        encoded = tokenizer.encode(text)
        inputs = {
            "input_ids": np.array([encoded.ids], dtype=np.int64),
            "attention_mask": np.array([encoded.attention_mask], dtype=np.int64),
            "token_type_ids": np.array([encoded.type_ids], dtype=np.int64)
        }
        
        outputs = session.run(None, inputs)
        sentence_embeddings = mean_pooling(outputs[0], inputs['attention_mask'])
        
        # Normalizar vector
        norm = np.linalg.norm(sentence_embeddings, axis=1, keepdims=True)
        sentence_embeddings = sentence_embeddings / np.clip(norm, a_min=1e-9, a_max=None)
        
        corpus_embeddings.append(sentence_embeddings[0])
        
    print("[*] Guardando la matriz vectorial...")
    corpus_matrix = np.array(corpus_embeddings)
    save_path = os.path.join(MODELS_DIR, 'corpus_embeddings.npy')
    np.save(save_path, corpus_matrix)
    
    print(f"[+] ¡COMPLETADO! Matriz guardada en: {save_path}")

if __name__ == "__main__":
    main()
