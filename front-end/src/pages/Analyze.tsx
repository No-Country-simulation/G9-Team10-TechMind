import { useState, useRef } from 'react';
import { Sparkles, ArrowRight, Code2, Tag, Eye, EyeOff, Brain, Settings } from 'lucide-react';
import { contentService } from '@/services/api';
import { mockAnalysisResult, generateMockAnalysis } from '@/utils/mockData';
import { CATEGORY_COLORS } from '@/utils/constants';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import type { ContentInput, ContentAnalysisResult } from '@/types';
import './Analyze.css';

const EXAMPLES: ContentInput[] = [
  {
    titulo: 'Introducción a Spring Boot',
    texto: 'En este contenido se presentan los conceptos básicos para la creación de APIs REST utilizando Java y Spring Boot, incluyendo configuración de dependencias Maven y anotaciones.',
  },
  {
    titulo: 'Redes Neuronales con PyTorch',
    texto: 'Exploración de técnicas de deep learning con PyTorch: construcción de modelos, funciones de pérdida, optimizadores y entrenamiento de redes convolucionales para clasificación de imágenes.',
  },
  {
    titulo: 'CI/CD con GitHub Actions',
    texto: 'Implementación de pipelines de integración y despliegue continuo usando GitHub Actions, Docker y Kubernetes. Automatización de tests, builds y deploys en ambientes cloud.',
  },
  {
    titulo: 'React Hooks avanzados',
    texto: 'Uso avanzado de hooks en React: useCallback, useMemo, useReducer y hooks personalizados para gestión de estado complejo, optimización de renders y comunicación con APIs REST.',
  },
];

function getConfidenceLabel(p: number) {
  if (p >= 0.9) return 'Alta confianza';
  if (p >= 0.75) return 'Confianza media';
  return 'Confianza baja';
}

function JsonView({ result }: { result: ContentAnalysisResult }) {
  const json = JSON.stringify({
    categoria: result.categoria,
    probabilidad: result.probabilidad,
    informacion_adicional: result.informacion_adicional,
  }, null, 2);

  return (
    <pre className="json-block">
      {json.split('\n').map((line, i) => {
        const keyMatch = line.match(/^(\s*)"([^"]+)":/);
        const strMatch = line.match(/: "([^"]+)"/);
        const numMatch = line.match(/: ([\d.]+)/);
        if (keyMatch) {
          const rest = line.slice(keyMatch[0].length);
          return (
            <span key={i}>
              {keyMatch[1]}
              <span className="json-key">"{keyMatch[2]}"</span>:{rest}
              {'\n'}
            </span>
          );
        }
        if (strMatch) return <span key={i}>{line}{'\n'}</span>;
        if (numMatch) return <span key={i}><span className="json-num">{line}</span>{'\n'}</span>;
        return <span key={i}>{line}{'\n'}</span>;
      })}
    </pre>
  );
}

export function Analyze() {
  const [input, setInput] = useState<ContentInput>({ titulo: '', texto: '' });
  const [result, setResult] = useState<ContentAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.titulo.trim() || !input.texto.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await contentService.analyze(input);
      setResult(res);
    } catch {
      // Demo fallback
      await new Promise(r => setTimeout(r, 1200));
      setResult(generateMockAnalysis(input.titulo, input.texto));
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (ex: ContentInput) => {
    setInput(ex);
    setResult(null);
    textareaRef.current?.focus();
  };

  const catColor = result ? (CATEGORY_COLORS[result.categoria] ?? '#6366f1') : '#6366f1';

  return (
    <main className="page-container">
      <header className="page-header">
        <h1 className="page-title">Analizar Contenido</h1>
        <p className="page-description">
          Ingresa tu contenido técnico y el modelo de IA lo clasificará automáticamente
        </p>
      </header>

      <div className="analyze-grid">
        {/* ── Input Panel ── */}
        <form onSubmit={handleSubmit}>
          <div className="analyze-input-panel">
            <div className="panel-title">
              <Sparkles size={18} style={{ color: 'var(--clr-primary)' }} />
              Entrada de Contenido
            </div>
            <p className="panel-subtitle">
              Proporciona el título y el texto del contenido técnico a clasificar
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="titulo">
                Título del contenido
              </label>
              <input
                id="titulo"
                type="text"
                className="input"
                placeholder="ej. Introducción a Spring Boot"
                value={input.titulo}
                onChange={e => setInput(p => ({ ...p, titulo: e.target.value }))}
                maxLength={200}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="texto">
                Texto / Descripción
                <span className="char-count">{input.texto.length} / 2000</span>
              </label>
              <textarea
                id="texto"
                ref={textareaRef}
                className="input textarea"
                placeholder="Pega aquí la descripción, documentación, apuntes o contenido del curso…"
                value={input.texto}
                onChange={e => setInput(p => ({ ...p, texto: e.target.value }))}
                maxLength={2000}
                required
              />
            </div>

            {error && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                color: 'var(--clr-danger)',
                marginBottom: 12,
              }}>
                {error}
              </div>
            )}

            <button
              id="btn-analyze"
              type="submit"
              className="btn btn-primary btn-lg analyze-btn"
              disabled={loading || !input.titulo || !input.texto}
            >
              {loading ? (
                <>
                  <div className="btn-spinner" />
                  Analizando…
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Analizar con IA
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Examples */}
            <div className="examples-section">
              <div className="examples-title">Ejemplos rápidos</div>
              <div className="example-chips">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.titulo}
                    type="button"
                    className="example-chip"
                    onClick={() => loadExample(ex)}
                  >
                    {ex.titulo}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* ── Result Panel ── */}
        <div className="analyze-result-panel">
          {!result && !loading ? (
            <div className="result-empty">
              <div className="result-empty-icon"><Brain size={48} strokeWidth={1.5} /></div>
              <div className="result-empty-title">Listo para analizar</div>
              <p className="result-empty-text">
                Ingresa tu contenido técnico y presiona "Analizar con IA" para ver los resultados de clasificación
              </p>
            </div>
          ) : loading ? (
            <div className="result-empty">
              <div className="result-empty-icon" style={{ animation: 'spin-slow 1.5s linear infinite' }}><Settings size={48} strokeWidth={1.5} /></div>
              <div className="result-empty-title">Procesando…</div>
              <p className="result-empty-text">El modelo está clasificando tu contenido</p>
            </div>
          ) : result ? (
            <div className="result-card">
              <div className="result-header">
                <div
                  className="result-category-badge"
                  style={{
                    background: `${catColor}18`,
                    borderColor: `${catColor}35`,
                    color: catColor,
                  }}
                >
                  <CategoryIcon category={result.categoria} size={16} />
                  {result.categoria}
                </div>
                <div className="result-titulo">{result.titulo}</div>
              </div>

              <div className="result-body">
                {/* Confidence */}
                <div className="confidence-section">
                  <div className="confidence-label">
                    <span className="confidence-name">Confianza del Modelo</span>
                    <span className="confidence-value">{(result.probabilidad * 100).toFixed(1)}%</span>
                  </div>
                  <div className="confidence-bar-wrap">
                    <div
                      className="confidence-bar"
                      style={{
                        width: `${result.probabilidad * 100}%`,
                        background: result.probabilidad >= 0.85
                          ? 'var(--grad-success)'
                          : result.probabilidad >= 0.65
                          ? 'var(--grad-warning)'
                          : 'var(--grad-danger)',
                      }}
                    />
                  </div>
                  <div className="confidence-desc">{getConfidenceLabel(result.probabilidad)}</div>
                </div>

                {/* Keywords */}
                {result.informacion_adicional?.length > 0 && (
                  <div className="keywords-section">
                    <div className="section-label">
                      <Tag size={11} style={{ display: 'inline', marginRight: 5 }} />
                      Palabras Clave Identificadas
                    </div>
                    <div className="keywords-wrap">
                      {result.informacion_adicional.map((kw, i) => (
                        <span
                          key={kw}
                          className="keyword-tag"
                          style={{ animationDelay: `${i * 0.06}s` }}
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview */}
                {result.texto_preview && (
                  <div className="preview-section">
                    <div className="section-label">Texto Analizado</div>
                    <div className="preview-text">"{result.texto_preview}"</div>
                  </div>
                )}

                {/* JSON */}
                <div>
                  <button
                    type="button"
                    className="json-toggle"
                    onClick={() => setShowJson(v => !v)}
                    id="btn-toggle-json"
                  >
                    <Code2 size={13} />
                    {showJson ? 'Ocultar' : 'Ver'} respuesta JSON
                    {showJson ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  {showJson && <JsonView result={result} />}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
