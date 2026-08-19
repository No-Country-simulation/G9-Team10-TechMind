from core.patch import apply_pydantic_patch
apply_pydantic_patch()

import asyncio
from services.groq_service import extraer_metadata

async def main():
    text = """La integración de algoritmos de Machine Learning con arquitecturas de computación cuántica representa uno de los paradigmas más disruptivos en la optimización de redes neuronales profundas (DNN). Tradicionalmente, el entrenamiento de modelos de Deep Learning a gran escala se ha visto limitado por cuellos de botella computacionales relacionados con el hardware clásico basado en silicio, específicamente en el procesamiento matricial intensivo y la propagación hacia atrás (backpropagation). En este contexto, el Quantum Machine Learning (QML) emerge como una solución algorítmica viable para mitigar la complejidad temporal exponencial de ciertos cálculos.

Investigaciones recientes sugieren que las redes neuronales cuánticas (QNNs), ejecutadas sobre simuladores cuánticos alojados en infraestructuras de Nube Híbrida (Hybrid Cloud), pueden aprovechar los estados de superposición y entrelazamiento cuántico para procesar el espacio de características con una dimensionalidad logarítmica respecto a su contraparte clásica. Modelos como las Máquinas de Boltzmann Cuánticas (QBM) han demostrado empíricamente una reducción significativa en los tiempos de inferencia al evaluar grandes volúmenes de datos no estructurados.

A nivel de arquitectura de software, la orquestación de estos flujos de trabajo se apoya fundamentalmente en contenedores Docker y clústeres de Kubernetes, permitiendo aislar la capa de procesamiento de datos clásicos (implementada generalmente en Python usando frameworks como TensorFlow o PyTorch) de los circuitos cuánticos parametrizados. Este enfoque modular garantiza la resiliencia del sistema frente a la decoherencia cuántica y facilita una integración continua (CI/CD) más fluida. No obstante, la viabilidad técnica a gran escala de estas sinergias aún requiere resolver desafíos inherentes a la mitigación de errores cuánticos (QEC) y a las latencias de red introducidas durante el paso de tensores entre el hardware clásico y el procesador cuántico (QPU)."""
    result = await extraer_metadata(text)
    print("RESULT:", result)

asyncio.run(main())
