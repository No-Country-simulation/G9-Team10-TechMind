import os
import joblib
import numpy as np
import onnxruntime as ort
from tokenizers import Tokenizer

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
    
    dataset_path = os.path.join(MODELS_DIR, 'dataset_reference.joblib')
    if not os.path.exists(dataset_path):
        print(f"[-] ERROR: No se encontró el dataset en {dataset_path}")
        return
        
    print("[*] Cargando base de datos de texto (dataset_reference.joblib)...")
    dataset_ref = joblib.load(dataset_path)
    
    if isinstance(dataset_ref, dict) and 'embeddings' in dataset_ref:
        print("[*] ¡Embeddings precalculados detectados en el diccionario! Extrayendo...")
        corpus_matrix = np.array(dataset_ref['embeddings'])
        
        # Guardar en la ubicación final esperada por la API
        save_path = os.path.join(ONNX_MODEL_DIR, 'corpus_embeddings.npy')
        os.makedirs(ONNX_MODEL_DIR, exist_ok=True)
        np.save(save_path, corpus_matrix)
        
        # También se guarda en la carpeta models por compatibilidad
        np.save(os.path.join(MODELS_DIR, 'corpus_embeddings.npy'), corpus_matrix)
        
        print(f"[+] ¡COMPLETADO! Matriz exportada directamente a: {save_path}")
        return

    print("[*] Cargando modelo ONNX local...")
    tokenizer = Tokenizer.from_file(os.path.join(ONNX_MODEL_DIR, "tokenizer.json"))
    session = ort.InferenceSession(os.path.join(ONNX_MODEL_DIR, "model_quantized.onnx"))
    
    if isinstance(dataset_ref, dict) and 'metadata_docs' in dataset_ref:
        textos = [
            doc.get('clean_text') or doc.get('text') or doc.get('clean_content') or str(doc)
            for doc in dataset_ref['metadata_docs']
        ]
    elif hasattr(dataset_ref, 'columns'):
        text_col = next((col for col in ['clean_text', 'text', 'texto', 'clean_content'] if col in dataset_ref.columns), dataset_ref.columns[0])
        textos = dataset_ref[text_col].tolist()
    else:
        textos = list(dataset_ref)

    total = len(textos)
    print(f"[*] Generando embeddings para {total} documentos...")
    corpus_embeddings = []
    
    for i, text in enumerate(textos):
        if i > 0 and i % 500 == 0:
            print(f"    -> Procesados {i}/{total} documentos...")
            
        encoded = tokenizer.encode(str(text))
        inputs = {
            "input_ids": np.array([encoded.ids], dtype=np.int64),
            "attention_mask": np.array([encoded.attention_mask], dtype=np.int64),
            "token_type_ids": np.array([encoded.type_ids], dtype=np.int64)
        }
        
        outputs = session.run(None, inputs)
        sentence_embeddings = mean_pooling(outputs[0], inputs['attention_mask'])
        
        norm = np.linalg.norm(sentence_embeddings, axis=1, keepdims=True)
        sentence_embeddings = sentence_embeddings / np.clip(norm, a_min=1e-9, a_max=None)
        
        corpus_embeddings.append(sentence_embeddings[0])
        
    print("[*] Guardando la matriz vectorial...")
    corpus_matrix = np.array(corpus_embeddings)
    
    save_path = os.path.join(ONNX_MODEL_DIR, 'corpus_embeddings.npy')
    os.makedirs(ONNX_MODEL_DIR, exist_ok=True)
    np.save(save_path, corpus_matrix)
    np.save(os.path.join(MODELS_DIR, 'corpus_embeddings.npy'), corpus_matrix)
    
    print(f"[+] ¡COMPLETADO! Matriz guardada en: {save_path}")

if __name__ == "__main__":
    main()