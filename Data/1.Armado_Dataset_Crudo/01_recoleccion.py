import os
import random
import pandas as pd
from datasets import load_dataset
import sys
import requests

def fetch_github_readmes():
    """Descarga READMEs reales de repositorios populares para tener Markdown real."""
    repos = [
        "tiangolo/fastapi/master/README.md",
        "pandas-dev/pandas/main/README.md",
        "facebook/react/main/README.md",
        "huggingface/transformers/main/README.md",
        "django/django/main/README.rst"
    ]
    readmes = []
    for repo in repos:
        url = f"https://raw.githubusercontent.com/{repo}"
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                readmes.append({"source_type": "GitHub_README", "is_synthetic_noise": False, "raw_text": response.text})
        except:
            continue
    return readmes

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    print("🚀 Iniciando recolección de múltiples fuentes de datos...")
    
    # 1. Semilla reproducible (Mejora de Oro)
    random.seed(42)
    
    combined_texts = []
    
    # Fuente 1: Artículos Académicos (Textos formales)
    try:
        ds1 = load_dataset("CShorten/ML-ArXiv-Papers", split="train[:500]")
        combined_texts.extend([{"source_type": "Articulo_Academico", "is_synthetic_noise": False, "raw_text": row["abstract"]} for row in ds1])
        print("✅ Fuente 1 cargada: ML-ArXiv-Papers (Artículos formales)")
    except Exception as e:
        print(f"⚠️ Error cargando Fuente 1: {e}")
        
    # Fuente 2: Código y Tutoriales
    try:
        ds2 = load_dataset("flytech/python-codes-25k", split="train[:500]")
        for row in ds2:
            tutorial_text = f"Contexto: {row['instruction']}\n\nCódigo de ejemplo:\n```python\n{row['output']}\n```"
            combined_texts.extend([{"source_type": "Tutorial_Codigo", "is_synthetic_noise": False, "raw_text": tutorial_text}])
        print("✅ Fuente 2 cargada: python-codes-25k (Tutoriales y código)")
    except Exception as e:
        print(f"⚠️ Error cargando Fuente 2: {e}")
        
    # Fuente 3: Documentación Real de GitHub (Mejora de Perplexity)
    print("🔍 Descargando READMEs reales de GitHub...")
    readmes = fetch_github_readmes()
    combined_texts.extend(readmes)
    print(f"✅ Fuente 3 cargada: {len(readmes)} READMEs de GitHub (FastAPI, React, etc.)")

    # Mezclar todo (con semilla fija)
    random.shuffle(combined_texts)
    
    df = pd.DataFrame(combined_texts)
    
    # 2. Separar Ruido Sintético con un Flag (Mejora de Oro)
    print("🧩 Inyectando ruido del mundo real (HTML, URLs rotas, errores)...")
    ruidos_extra = [
        {"source_type": "Ruido_Web", "is_synthetic_noise": True, "raw_text": "<h2>Instalación</h2> <p>Para instalar correr: <code>pip install techmind</code></p> Para más info ver http://fakesite.com/docs/v1"},
        {"source_type": "Ruido_Web", "is_synthetic_noise": True, "raw_text": "Error 404: The page you are looking for does not exist. Please go back to homepage."},
        {"source_type": "Ruido_Web", "is_synthetic_noise": True, "raw_text": "Este es un texto con caracteres raros: Ã©xito y un link falso https://github.com/404"}
    ]
    df = pd.concat([df, pd.DataFrame(ruidos_extra)], ignore_index=True)
    
    # 3. Deduplicar registros idénticos antes de exportar (Mejora de Oro)
    print("🧹 Deduplicando registros exactos...")
    initial_count = len(df)
    df = df.drop_duplicates(subset=['raw_text']).reset_index(drop=True)
    print(f"   Se eliminaron {initial_count - len(df)} registros duplicados.")
    
    # Guardar en CSV
    output_path = os.path.join(os.path.dirname(__file__), "dataset_techmind_raw.csv")
    df.to_csv(output_path, index=False, encoding='utf-8')
    
    print(f"🎉 Dataset heterogéneo guardado con {len(df)} registros en: {output_path}")

if __name__ == "__main__":
    main()
