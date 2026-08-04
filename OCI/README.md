<div align="center">
  
# ☁️ TechMind Infraestructura Cloud (OCI)

**Arquitectura de Grado Enterprise Zero-Trust Desplegada en Oracle Cloud Infrastructure**

<p align="center">
  <img src="https://img.shields.io/badge/Oracle_Cloud-F80000?style=for-the-badge&logo=oracle&logoColor=white" alt="Oracle Cloud" />
  <img src="https://img.shields.io/badge/Ubuntu-E95420?style=for-the-badge&logo=ubuntu&logoColor=white" alt="Ubuntu" />
  <img src="https://img.shields.io/badge/ARM_Ampere-0091BD?style=for-the-badge&logo=arm&logoColor=white" alt="ARM" />
  <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
</p>

</div>

## 🎯 RESUMEN GENERAL

El repositorio de Infraestructura Cloud de TechMind contiene los planos arquitectónicos y configuraciones para desplegar un entorno de aplicaciones multi-capa altamente seguro en Oracle Cloud Infrastructure (OCI). Diseñado para soportar un frontend en React, un API Gateway en Spring Boot y un motor de IA intensivo en FastAPI, esta infraestructura resuelve las fallas comunes de los despliegues en la nube priorizando un aislamiento de red estricto y control de acceso basado en identidad.

Al aprovechar las instancias ARM Ampere A1 de OCI e implementar una topología de red Zero-Trust, el sistema garantiza que los datos críticos y las cargas de trabajo de Machine Learning permanezcan completamente aislados del internet público, maximizando la eficiencia de costos a través de la capa Always Free / PAYG de OCI.

## 🏆 CRITERIOS DE ÉXITO ARQUITECTÓNICO

- **Topología de Red Zero-Trust:** Segregación de cargas de trabajo en subredes Públicas y Privadas. Solo el API Gateway (Spring Boot) está expuesto a internet. El Motor de IA (FastAPI) y la Base de Datos MySQL residen en una subred privada sin direcciones IP públicas, blindándolos efectivamente contra atacantes externos.
- **Gestión de Identidad y Accesos (IAM):** Erradicación de credenciales en texto plano (hardcodeadas) mediante Grupos Dinámicos y *Instance Principals* de OCI. El motor de IA recibe acceso autónomo de lectura a los modelos en *Object Storage* mediante políticas criptográficas de identidad de máquina.
- **Alto Rendimiento Optimizado en Costos:** Asignación estratégica de recursos ARM Ampere A1 (4 OCPUs, 24GB RAM total) para procesar matrices complejas de Scikit-Learn de manera nativa en memoria sin incurrir en costos operativos.
- **Tráfico de Salida Seguro (Egress):** Implementación de un NAT Gateway que permite a las instancias privadas descargar de forma segura actualizaciones del OS y paquetes de Python sin exponer sus puertos de entrada a internet.
- **Arquitectura Bastion Host:** El acceso administrativo seguro a las instancias privadas se logra exclusivamente mediante saltos SSH (Jump) enrutados a través del API Gateway público.

## 🛠️ TECH STACK

**Proveedor Cloud:** Oracle Cloud Infrastructure (OCI)  
**Cómputo:** VM.Standard.A1.Flex (ARM Ampere), Canonical Ubuntu 24.04 LTS  
**Redes:** Virtual Cloud Network (VCN), Internet Gateway, NAT Gateway, Subredes Públicas/Privadas, Security Lists  
**Almacenamiento:** OCI Object Storage (Bucket Público para Frontend, Bucket Privado para Modelos de IA)  
**Seguridad:** IAM Policies, Grupos Dinámicos, Instance Principals, SSH via Bastion Host  
**Cargas de Trabajo:** Spring Boot (Java 17+), FastAPI (Python 3.12), Servidor MySQL  

## 📦 INSTALACIÓN LOCAL / GUÍA RÁPIDA

Esta infraestructura fue aprovisionada en la consola de OCI siguiendo un manual estricto. Para replicar o acceder a este entorno, sigue estos pasos administrativos:

1. **Acceso al API Gateway Público (Bastion Host):**
   Asegúrate de tener la llave SSH privada guardada localmente de forma segura.
   ```bash
   ssh -i /ruta/a/tu-llave-publica.key ubuntu@<IP_PUBLICA>
   ```

2. **Acceso a Recursos Privados (Base de Datos y Motor de IA):**
   Utiliza el Bastion Host para realizar un salto seguro (Jump) a la subred privada.
   ```bash
   # 1. Transfiere la llave de la máquina privada hacia el Bastion Host
   scp -i /ruta/a/tu-llave-publica.key /ruta/a/tu-llave-privada.key ubuntu@<IP_PUBLICA>:/home/ubuntu/

   # 2. Conéctate al Bastion Host
   ssh -i /ruta/a/tu-llave-publica.key ubuntu@<IP_PUBLICA>

   # 3. Restringe permisos de la llave y da el salto (Jump)
   chmod 600 tu-llave-privada.key
   ssh -i tu-llave-privada.key ubuntu@<IP_PRIVADA>
   ```

3. **Gestión de Servicios (systemd):**
   Todas las aplicaciones principales son administradas mediante `systemd` de Linux para garantizar reinicios automáticos y alta disponibilidad.
   ```bash
   # Revisar estado de la API
   sudo systemctl status techmind-api
   
   # Revisar estado de la Base de Datos
   sudo systemctl status mysql
   ```
