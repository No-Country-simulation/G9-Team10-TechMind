import { Link } from 'react-router-dom';
import { 
  Sparkles, Brain, LayoutDashboard, 
  ArrowRight, Database, Cpu, Layers, 
  ShieldCheck, Zap, Server, Code2, Compass
} from 'lucide-react';
import { ROUTES } from '@/utils/constants';
import './Welcome.css';

export function Welcome() {
  return (
    <div className="welcome-page page-container">
      {/* ── Background Decorative Orbs ── */}
      <div className="welcome-glow-orb orb-1" />
      <div className="welcome-glow-orb orb-2" />

      {/* ── Main Welcome Landing Screen (Pestaña de Bienvenida) ── */}
      <section className="welcome-hero fade-up">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div className="welcome-badge">
            <Sparkles size={14} className="welcome-badge-icon" />
            <span>TECHMIND PLATFORM</span>
          </div>
        </div>

        <h1 className="welcome-title">
          Organización Inteligente del <br />
          <span className="welcome-title-gradient">Conocimiento Técnico con IA</span>
        </h1>

        <p className="welcome-subtitle">
          Transforma documentación desestructurada en información clasificada y reutilizable mediante 
          <strong> Ciencia de Datos</strong>, <strong>Modelos ML</strong> y microservicios con <strong>soporte para OCI</strong>.
        </p>

        {/* Action CTAs */}
        <div className="welcome-cta-group">
          <Link to={ROUTES.HOME} className="welcome-btn welcome-btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
            <span>Ir a la aplicación</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── Feature Cards Grid (Capacidades de la Plataforma) ── */}
      <section className="welcome-section fade-up" style={{ animationDelay: '0.15s' }}>
        <div className="welcome-section-header">
          <h2 className="welcome-section-title">Capacidades de TechMind</h2>
          <p className="welcome-section-desc">
            Diseñado para resolver la clasificación y reutilización del conocimiento técnico mediante un motor modular.
          </p>
        </div>

        <div className="welcome-cards-grid">
          <div className="welcome-card">
            <div className="welcome-card-icon-wrap icon-cyan">
              <Brain size={24} />
            </div>
            <h3>Clasificación Multiclase con ML</h3>
            <p>
              Procesamiento de Lenguaje Natural (NLP) usando Scikit-Learn y TF-IDF para identificar categorías técnicas automáticamente.
            </p>
            <div className="welcome-card-tag">IA & NLP</div>
          </div>

          <div className="welcome-card">
            <div className="welcome-card-icon-wrap icon-purple">
              <Layers size={24} />
            </div>
            <h3>Extracción de Palabras Clave</h3>
            <p>
              Detección y ponderación de términos técnicos principales (Keywords) presentes en cada artículo o tutoría.
            </p>
            <div className="welcome-card-tag">Enriquecimiento</div>
          </div>

          <div className="welcome-card">
            <div className="welcome-card-icon-wrap icon-blue">
              <Compass size={24} />
            </div>
            <h3>Recomendación Contextual</h3>
            <p>
              Motor de recomendación por vector de similitud coseno para sugerir contenidos relacionados al instante.
            </p>
            <div className="welcome-card-tag">Similitud Coseno</div>
          </div>

          <div className="welcome-card">
            <div className="welcome-card-icon-wrap icon-green">
              <LayoutDashboard size={24} />
            </div>
            <h3>Dashboard en Tiempo Real</h3>
            <p>
              Visualizaciones dinámicas del corpus de conocimiento, métricas de categorías y distribución de palabras clave.
            </p>
            <div className="welcome-card-tag">Analítica Visual</div>
          </div>

          <div className="welcome-card">
            <div className="welcome-card-icon-wrap icon-orange">
              <Server size={24} />
            </div>
            <h3>Backend REST & Microservicios</h3>
            <p>
              API desarrollada en Java Spring Boot y Python FastAPI con salida estructurada en formato JSON para fácil consumo.
            </p>
            <div className="welcome-card-tag">Java + Python</div>
          </div>

          <div className="welcome-card">
            <div className="welcome-card-icon-wrap icon-pink">
              <Database size={24} />
            </div>
            <h3>Infraestructura y Alojamiento</h3>
            <p>
              Alojamiento distribuido con soporte para OCI (Oracle Cloud Infrastructure) y contenedores escalables.
            </p>
            <div className="welcome-card-tag">Soporte OCI</div>
          </div>
        </div>
      </section>



      {/* ── Tech Stack Badges Footer ── */}
      <section className="welcome-stack-section fade-up" style={{ animationDelay: '0.45s' }}>
        <span className="welcome-stack-title">TECNOLOGÍAS DE TECHMIND:</span>
        <div className="welcome-stack-badges">
          <span className="welcome-tech-badge"><Code2 size={13} /> Python FastAPI</span>
          <span className="welcome-tech-badge"><Cpu size={13} /> Scikit-Learn (TF-IDF)</span>
          <span className="welcome-tech-badge"><Server size={13} /> Java Spring Boot</span>
          <span className="welcome-tech-badge"><Zap size={13} /> React + TypeScript</span>
          <span className="welcome-tech-badge"><Database size={13} /> Soporte para OCI</span>
          <span className="welcome-tech-badge"><ShieldCheck size={13} /> Docker Containerized</span>
        </div>
      </section>
    </div>
  );
}
