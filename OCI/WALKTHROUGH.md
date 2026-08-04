# 🚀 Walkthrough: Despliegue de Infraestructura OCI

Este documento es una guía paso a paso (Tutorial) que documenta exactamente cómo se construyó la infraestructura en la nube para el proyecto TechMind. Cualquier integrante del equipo puede seguir estos pasos para replicar el entorno de producción.

---

## FASE 1: Redes (Networking)

### Paso 1: Crear la VCN
1. En la consola de OCI, navega a **Networking > Virtual Cloud Networks**.
2. Clic en **Create VCN**.
3. Nombre: `TechMind-VCN`.
4. IPv4 CIDR Block: `10.0.0.0/16`.

### Paso 2: Crear Subredes
1. Dentro de la VCN, clic en **Create Subnet**.
2. **Subred Pública:** 
   * Nombre: `public subnet-TechMind-VCN`.
   * Tipo: Regional.
   * CIDR: `10.0.0.0/24`.
   * Tipo de Subred: Pública.
3. **Subred Privada:**
   * Nombre: `private subnet-TechMind-VCN`.
   * Tipo: Regional.
   * CIDR: `10.0.1.0/24`.
   * Tipo de Subred: Privada.

### Paso 3: Gateways y Tablas de Enrutamiento
1. **Internet Gateway (IGW):** Crear uno llamado `TechMind-IGW`. 
   * Ir a la Tabla de Enrutamiento de la Subred Pública y añadir una regla: Destino `0.0.0.0/0`, Target: `TechMind-IGW`.
2. **NAT Gateway:** Crear uno llamado `TechMind-NAT`.
   * Ir a la Tabla de Enrutamiento de la Subred Privada y añadir una regla: Destino `0.0.0.0/0`, Target: `TechMind-NAT`.

---

## FASE 2: Servidores (Compute)

### Paso 4: Aprovisionar VM Spring Boot (Bastion Host)
1. Navegar a **Compute > Instances > Create Instance**.
2. Nombre: `TechMind-API-VM`.
3. Imagen: Ubuntu 24.04 LTS.
4. Shape: `VM.Standard.A1.Flex` (1 OCPU, 6GB RAM).
5. Networking: Seleccionar `TechMind-VCN` y `public subnet`. Asignar IP Pública.
6. SSH Keys: Generar y descargar la llave privada (Ej. `llave_publica.key`).

### Paso 5: Aprovisionar VM Base de Datos
1. Crear nueva instancia: `TechMind-DB-VM`.
2. Shape: `VM.Standard.A1.Flex` (1 OCPU, 6GB RAM).
3. Networking: Seleccionar `TechMind-VCN` y **`private subnet`**. **NO ASIGNAR IP PÚBLICA**.
4. SSH Keys: Generar y descargar la llave privada (Ej. `llave_db.key`).

### Paso 6: Aprovisionar VM Motor IA (FastAPI)
1. Crear nueva instancia: `TechMind-IA-VM`.
2. Shape: `VM.Standard.A1.Flex` (2 OCPU, 12GB RAM).
3. Networking: Seleccionar `TechMind-VCN` y **`private subnet`**. **NO ASIGNAR IP PÚBLICA**.
4. SSH Keys: Generar y descargar la llave (Ej. `llave_ia.key`).

---

## FASE 3: Seguridad y Acceso (SSH Jump)

Debido a que la Base de Datos y la IA no tienen IP pública, es imposible atacarlas directamente desde internet. Para acceder a ellas para mantenimiento, usamos la técnica de SSH Jump:

1. Subir la llave privada de la máquina interna a la máquina pública:
   ```bash
   scp -i llave_publica.key llave_ia.key ubuntu@<IP_PUBLICA_SPRINGBOOT>:/home/ubuntu/
   ```
2. Entrar a la máquina pública:
   ```bash
   ssh -i llave_publica.key ubuntu@<IP_PUBLICA_SPRINGBOOT>
   ```
3. Desde adentro de la máquina pública, proteger la llave y saltar a la privada:
   ```bash
   chmod 600 llave_ia.key
   ssh -i llave_ia.key ubuntu@10.0.1.X
   ```

---

## FASE 4: Entornos y Dependencias

Una vez dentro de las máquinas correspondientes, ejecutar los comandos de configuración:

### Para el Motor IA (Ubuntu Private VM):
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-venv -y
python3 -m venv techmind_env
source techmind_env/bin/activate
pip install fastapi uvicorn scikit-learn pandas pydantic oci joblib numpy
```

### Para el Backend (Ubuntu Public VM):
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install openjdk-17-jdk -y
```

*(Fin del manual operativo. Las fases posteriores involucran el despliegue del código fuente en sí).*
