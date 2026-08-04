<div align="center">
  
# ☁️ TechMind Cloud Infrastructure (OCI)

**Enterprise-Grade Zero-Trust Architecture deployed on Oracle Cloud Infrastructure**

<p align="center">
  <img src="https://img.shields.io/badge/Oracle_Cloud-F80000?style=for-the-badge&logo=oracle&logoColor=white" alt="Oracle Cloud" />
  <img src="https://img.shields.io/badge/Ubuntu-E95420?style=for-the-badge&logo=ubuntu&logoColor=white" alt="Ubuntu" />
  <img src="https://img.shields.io/badge/ARM_Ampere-0091BD?style=for-the-badge&logo=arm&logoColor=white" alt="ARM" />
  <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
</p>

</div>

## 🎯 OVERVIEW

The TechMind Cloud Infrastructure repository contains the architectural blueprints and configurations for deploying a highly secure, multi-tier application environment on Oracle Cloud Infrastructure (OCI). Designed to support a React frontend, a Spring Boot API Gateway, and a heavy-compute FastAPI AI engine, this infrastructure solves the common pitfalls of cloud deployments by prioritizing strict network isolation and identity-based access control.

By leveraging OCI's Ampere A1 Compute instances and implementing a strict Zero-Trust network topology, the system ensures that critical data and machine learning workloads remain completely isolated from the public internet while maximizing cost-efficiency through the OCI Always Free/PAYG tier.

## 🏆 ENTERPRISE SUCCESS CRITERIA

- **Zero-Trust Network Topology:** Segregation of workloads into Public and Private Subnets. Only the Spring Boot API Gateway is exposed to the internet. The AI Engine (FastAPI) and the MySQL Database reside in a Private Subnet without public IP addresses, effectively shielding them from external threat actors.
- **Identity & Access Management (IAM):** Eradication of hardcoded credentials via OCI Dynamic Groups and Instance Principals. The AI Engine is granted autonomous read-access to Object Storage models purely through cryptographic machine-identity policies.
- **Cost-Optimized High Performance:** Strategic allocation of ARM Ampere A1 compute resources (4 OCPUs, 24GB RAM total) to handle heavy Scikit-Learn matrix computations natively in memory without incurring operational costs.
- **Secure Egress Traffic:** Implementation of a NAT Gateway allowing private instances to securely fetch OS updates and Python packages without exposing ingress endpoints.
- **Bastion Host Architecture:** Secure administrative access to private instances is achieved exclusively via SSH Jump routing through the public API Gateway.

## 🛠️ TECH STACK

**Cloud Provider:** Oracle Cloud Infrastructure (OCI)  
**Compute:** VM.Standard.A1.Flex (ARM Ampere), Canonical Ubuntu 24.04 LTS  
**Networking:** Virtual Cloud Network (VCN), Internet Gateway, NAT Gateway, Public/Private Subnets, Security Lists  
**Storage:** OCI Object Storage (Public Frontend Bucket, Private AI Models Bucket)  
**Security:** IAM Policies, Dynamic Groups, Instance Principals, Bastion Host SSH  
**Workloads:** Spring Boot (Java 17+), FastAPI (Python 3.12), MySQL Server  

## 📦 LOCAL SETUP / QUICKSTART

This infrastructure was provisioned via OCI Console following a strict runbook. To replicate or access this environment, follow these administrative steps:

1. **Access the Public API Gateway (Bastion Host):**
   Ensure you have the private SSH key securely stored locally.
   ```bash
   ssh -i /path/to/public-vm-key.key ubuntu@<PUBLIC_IP>
   ```

2. **Access Private Resources (Database & AI Engine):**
   Utilize the Bastion Host to securely jump into the private subnet.
   ```bash
   # 1. Securely transfer the private subnet key to the Bastion
   scp -i /path/to/public-vm-key.key /path/to/private-vm-key.key ubuntu@<PUBLIC_IP>:/home/ubuntu/

   # 2. Connect to the Bastion
   ssh -i /path/to/public-vm-key.key ubuntu@<PUBLIC_IP>

   # 3. Restrict key permissions and Jump
   chmod 600 private-vm-key.key
   ssh -i private-vm-key.key ubuntu@<PRIVATE_IP>
   ```

3. **Service Management (systemd):**
   All core applications are managed via Linux `systemd` to ensure automatic restarts and high availability.
   ```bash
   # Check API status
   sudo systemctl status techmind-api
   
   # Check Database status
   sudo systemctl status mysql
   ```
