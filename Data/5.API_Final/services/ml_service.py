import joblib
import os
from sklearn.metrics.pairwise import cosine_similarity

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')

# Cargar los modelos pre-entrenados
try:
    vectorizer = joblib.load(os.path.join(MODELS_DIR, 'tfidf_vectorizer.joblib'))
    tfidf_matrix = joblib.load(os.path.join(MODELS_DIR, 'tfidf_matrix.joblib'))
    dataset_ref = joblib.load(os.path.join(MODELS_DIR, 'dataset_reference.joblib'))
except FileNotFoundError:
    vectorizer, tfidf_matrix, dataset_ref = None, None, None
    print("Advertencia: No se encontraron los archivos .joblib de ML. Ejecute train_tfidf.py primero.")

def buscar_similares(keywords: str, top_k: int = 5):
    """
    Toma una cadena de keywords (ej: 'React Backend Authentication') 
    y devuelve los documentos más similares usando TF-IDF y Similitud de Coseno.
    """
    if vectorizer is None or tfidf_matrix is None or dataset_ref is None:
        return {"error": "El modelo de ML no está cargado. Entrene el modelo primero."}
    
    # 1. Transformar las keywords de entrada a vector
    query_vector = vectorizer.transform([keywords])
    
    # 2. Calcular la similitud del coseno contra toda la base de datos
    similitudes = cosine_similarity(query_vector, tfidf_matrix).flatten()
    
    # 3. Obtener los índices de los mayores puntajes
    indices_top = similitudes.argsort()[::-1][:top_k]
    
    # 4. Armar la respuesta
    resultados = []
    for idx in indices_top:
        score = float(similitudes[idx])
        if score > 0.0:  # Solo devolver si hay algo de similitud
            row = dataset_ref.iloc[idx]
            resultados.append({
                "title": row['title'],
                "similarity_score": round(score, 4),
                "preview": row['clean_text'][:200] + "..." if len(row['clean_text']) > 200 else row['clean_text']
            })
            
    return {"resultados": resultados}
