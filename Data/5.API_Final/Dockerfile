# Usa una imagen ligera de Python oficial
FROM python:3.11-slim

# Define el directorio de trabajo dentro del contenedor
WORKDIR /app

# Instala dependencias del sistema necesarias para ONNX y demás librerías
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copia los archivos de requerimientos primero para cachear la capa de Docker
COPY requirements.txt .

# Instala las dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo el código fuente y modelos a la carpeta de trabajo
COPY . .

# Expone el puerto 8000 para FastAPI
EXPOSE 8000

# Comando para ejecutar la aplicación (usando Uvicorn)
CMD ["uvicorn", "core.main:app", "--host", "0.0.0.0", "--port", "8000"]
