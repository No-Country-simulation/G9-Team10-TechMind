import pandas as pd
import os
import sys
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from sklearn.metrics import classification_report

# Solución para problemas de codificación en consola de Windows
sys.stdout.reconfigure(encoding='utf-8')

def main():
    print("🧠 Iniciando Prototipo de Clasificador ML Clásico...")
    
    # 1. Cargar una muestra del dataset crudo
    dataset_path = os.path.join(os.path.dirname(__file__), '..', '1.Armado_Dataset_Crudo', 'dataset_techmind_raw.csv')
    
    if not os.path.exists(dataset_path):
        print(f"❌ No se encontró el dataset en: {dataset_path}")
        return

    print("📥 Cargando datos...")
    df = pd.read_csv(dataset_path)
    
    # Limpieza "al vuelo" básica para el prototipo (eliminamos nulos)
    df = df.dropna(subset=['text', 'source_type'])
    
    # Usaremos solo una muestra pequeña para que entrene en segundos (ej. 500 registros)
    df_sample = df.sample(min(500, len(df)), random_state=42)
    
    X = df_sample['text']
    y = df_sample['source_type'] # Usaremos la fuente como "Categoría" temporal
    
    print(f"📊 Entrenando modelo con {len(X)} registros de prueba...")
    
    # 2. Dividir en entrenamiento y prueba
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 3. Crear el Pipeline (Vectorización TF-IDF + Clasificador Naive Bayes)
    # Naive Bayes es rapidísimo y excelente como modelo baseline para texto.
    modelo = make_pipeline(
        TfidfVectorizer(max_features=1000, stop_words='english'),
        MultinomialNB()
    )
    
    # 4. Entrenar el modelo
    modelo.fit(X_train, y_train)
    print("✅ Modelo entrenado exitosamente.")
    
    # 5. Evaluar el modelo (opcional, para ver qué tan bueno es)
    y_pred = modelo.predict(X_test)
    print("\n📈 Reporte de Clasificación (Prueba Interna):")
    print(classification_report(y_test, y_pred, zero_division=0))
    
    # 6. Prueba en vivo
    print("\n🔮 PRUEBA EN VIVO:")
    texto_prueba = "In this tutorial we will learn how to build a REST API using Python, FastAPI and connect it to a PostgreSQL database."
    print(f"Texto entrante: '{texto_prueba}'")
    
    prediccion = modelo.predict([texto_prueba])[0]
    probabilidad = max(modelo.predict_proba([texto_prueba])[0]) * 100
    
    print(f"➡️ Categoría predicha: {prediccion}")
    print(f"➡️ Probabilidad (Confianza): {probabilidad:.2f}%")

if __name__ == "__main__":
    main()
