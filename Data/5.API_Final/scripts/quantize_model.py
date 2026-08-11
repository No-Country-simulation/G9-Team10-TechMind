import os
from optimum.onnxruntime import ORTModelForFeatureExtraction, ORTQuantizer
from optimum.onnxruntime.configuration import AutoQuantizationConfig
from transformers import AutoTokenizer

def main():
    model_id = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    # Guardamos en ../models/onnx_model_quantized
    current_dir = os.path.dirname(os.path.abspath(__file__))
    save_dir = os.path.abspath(os.path.join(current_dir, "..", "models", "onnx_model_quantized"))
    
    print(f"[*] Descargando y exportando modelo a ONNX: {model_id}...")
    # Descargar modelo original y convertirlo al vuelo a ONNX
    model = ORTModelForFeatureExtraction.from_pretrained(model_id, export=True)
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    
    print("[*] Aplicando Cuantización Dinámica a 8-bits...")
    # Crear cuantizador
    quantizer = ORTQuantizer.from_pretrained(model)
    
    # Configurar cuantización dinámica (la más segura y óptima para texto)
    dqconfig = AutoQuantizationConfig.avx2(is_static=False, per_channel=False)
    
    # Ejecutar la reducción matemática y guardar
    quantizer.quantize(save_dir=save_dir, quantization_config=dqconfig)
    
    # Guardar también el tokenizador (vocabulario) en la misma carpeta
    tokenizer.save_pretrained(save_dir)
    
    print(f"\n[+] ¡ÉXITO! Modelo optimizado guardado en: {save_dir}")
    print("    Ya puedes correr generate_embeddings.py o arrancar la API.")

if __name__ == "__main__":
    main()
