import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
import os

# Paths
DATASET_PATH = r"C:\Users\Maxi.DESKTOP-8LJC287\Desktop\Entornos_Antigravity\W5(Varios)\techmind\ai_engine\dataset_techmind_mvp.csv"
OUTPUT_DIR = r"C:\Users\Maxi.DESKTOP-8LJC287\Desktop\Entornos_Antigravity\W5(Varios)\techmind\Repo\Data\5.API_Final\models"

def main():
    print("Cargando dataset...")
    df = pd.read_csv(DATASET_PATH)
    
    # Fill NaN values just in case
    df['clean_text'] = df['clean_text'].fillna("")
    
    print("Entrenando TfidfVectorizer...")
    # Initialize TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
    
    # Fit and transform the clean text
    tfidf_matrix = vectorizer.fit_transform(df['clean_text'])
    
    print(f"Matriz TF-IDF creada con forma: {tfidf_matrix.shape}")
    
    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("Exportando modelos a .joblib...")
    # Export the vectorizer
    joblib.dump(vectorizer, os.path.join(OUTPUT_DIR, 'tfidf_vectorizer.joblib'))
    
    # Export the TF-IDF matrix
    joblib.dump(tfidf_matrix, os.path.join(OUTPUT_DIR, 'tfidf_matrix.joblib'))
    
    # Export the dataset (so the API can map index to titles/texts)
    # We only need title and maybe the text for the API response
    df_export = df[['title', 'clean_text']].copy()
    joblib.dump(df_export, os.path.join(OUTPUT_DIR, 'dataset_reference.joblib'))
    
    print("¡Entrenamiento y exportación completados con éxito!")

if __name__ == "__main__":
    main()
