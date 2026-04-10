/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, CheckCircle2, AlertCircle, ExternalLink, Info, Zap, DollarSign, ShieldCheck, X, Bookmark, History, HelpCircle, ChevronRight, BookOpen, Bot } from 'lucide-react';
import { getAIRecommendations } from './services/geminiService';
import { AIAnalysisResponse, AIRecommendation } from './types';

export default function App() {
  const [task, setTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [result, setResult] = useState<AIAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedResults, setSavedResults] = useState<{task: string, result: AIAnalysisResponse, date: string}[]>([]);
  const [justSaved, setJustSaved] = useState(false);
  
  // Modal states
  const [showExplore, setShowExplore] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [exploreLimit, setExploreLimit] = useState(10);
  const [extraAIs, setExtraAIs] = useState<{name: string, desc: string, type: string, url: string}[]>([]);

  const baseAIs = [
    { name: 'ChatGPT (OpenAI)', desc: 'Líder en conversación y razonamiento general. Ideal para redacción, programación y análisis de datos.', type: 'Gratis / Pago', url: 'https://chat.openai.com' },
    { name: 'Claude (Anthropic)', desc: 'Conocido por su tono humano y gran ventana de contexto. Excelente para análisis de documentos largos y escritura creativa.', type: 'Gratis / Pago', url: 'https://claude.ai' },
    { name: 'Gemini (Google)', desc: 'Integrado con el ecosistema de Google. Potente en razonamiento multimodal y búsqueda de información en tiempo real.', type: 'Gratis / Pago', url: 'https://gemini.google.com' },
    { name: 'Midjourney', desc: 'La referencia en generación de imágenes artísticas y fotorrealistas mediante prompts.', type: 'Pago', url: 'https://www.midjourney.com' },
    { name: 'Perplexity', desc: 'Un motor de búsqueda potenciado por IA que cita fuentes en tiempo real. Ideal para investigación.', type: 'Gratis / Pago', url: 'https://www.perplexity.ai' },
    { name: 'Llama (Meta)', desc: 'Modelo de código abierto que permite a desarrolladores crear sus propias aplicaciones personalizadas.', type: 'Gratis', url: 'https://llama.meta.com' },
    { name: 'Stable Diffusion', desc: 'Generador de imágenes de código abierto con alto grado de personalización y control.', type: 'Gratis / Pago', url: 'https://stability.ai' },
    { name: 'Jasper', desc: 'Plataforma de IA enfocada en marketing y creación de contenido empresarial.', type: 'Pago', url: 'https://www.jasper.ai' },
    { name: 'Copy.ai', desc: 'Herramienta especializada en copywriting y automatización de procesos de marketing.', type: 'Gratis / Pago', url: 'https://www.copy.ai' },
    { name: 'Notion AI', desc: 'Asistente integrado en Notion para resumir, escribir y organizar información.', type: 'Pago', url: 'https://www.notion.so/product/ai' },
    { name: 'Runway', desc: 'Herramientas creativas de IA para edición y generación de video profesional.', type: 'Gratis / Pago', url: 'https://runwayml.com' },
    { name: 'Canva Magic Studio', desc: 'Suite de herramientas de diseño potenciadas por IA integradas en Canva.', type: 'Gratis / Pago', url: 'https://www.canva.com/magic-home/' },
    { name: 'GitHub Copilot', desc: 'Asistente de programación que sugiere código en tiempo real dentro del editor.', type: 'Pago', url: 'https://github.com/features/copilot' },
    { name: 'Adobe Firefly', desc: 'Modelos de IA generativa integrados en las aplicaciones de Adobe Creative Cloud.', type: 'Gratis / Pago', url: 'https://www.adobe.com/sensei/generative-ai/firefly.html' },
    { name: 'ElevenLabs', desc: 'La IA más avanzada en síntesis de voz y clonación de voz realista.', type: 'Gratis / Pago', url: 'https://elevenlabs.io' }
  ];

  const allAIs = [...baseAIs, ...extraAIs];

  const handleLoadMore = () => {
    if (exploreLimit + 5 > allAIs.length) {
      const prefixes = ['Vision', 'Logic', 'Creative', 'Data', 'Smart', 'Neural', 'Deep', 'Quick', 'Flow', 'Sync', 'Nexus', 'Quantum', 'Aura', 'Zenith', 'Pulse'];
      const suffixes = ['AI', 'Bot', 'Mind', 'Hub', 'Lab', 'Studio', 'Core', 'Link', 'Path', 'Grid', 'Engine', 'Sphere', 'Flow', 'Wave', 'Node'];
      const types = ['Gratis', 'Pago', 'Beta', 'Freemium', 'Enterprise'];
      
      const newBatch = Array.from({ length: 10 }).map((_, i) => ({
        name: `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]} ${allAIs.length + i + 1}`,
        desc: 'Herramienta experimental de IA diseñada para automatizar flujos de trabajo complejos y potenciar la productividad creativa.',
        type: types[Math.floor(Math.random() * types.length)],
        url: '#'
      }));
      setExtraAIs(prev => [...prev, ...newBatch]);
    }
    setExploreLimit(prev => prev + 5);
  };

  // Load saved results from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('equilibria_saved_results');
    if (saved) {
      try {
        setSavedResults(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing saved results', e);
      }
    }
  }, []);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getAIRecommendations(task);
      setResult(data);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (err) {
      console.error(err);
      setError('Hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentResult = () => {
    if (!result) return;
    
    // Check if already saved to avoid duplicates
    const isAlreadySaved = savedResults.some(s => s.task === task && s.result.topRecommendation.name === result.topRecommendation.name);
    if (isAlreadySaved) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
      return;
    }

    const newSaved = [
      { 
        task, 
        result, 
        date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
      },
      ...savedResults
    ];
    
    setSavedResults(newSaved);
    localStorage.setItem('equilibria_saved_results', JSON.stringify(newSaved));
    
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const deleteSaved = (index: number) => {
    const newSaved = savedResults.filter((_, i) => i !== index);
    setSavedResults(newSaved);
    localStorage.setItem('equilibria_saved_results', JSON.stringify(newSaved));
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-6 px-6 md:px-12 flex justify-between items-center bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => {setResult(null); setTask('');}}>
          <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-brand-dark">
            Encuentra tu <span className="text-brand-secondary">IA</span>
          </span>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 text-sm font-semibold text-brand-gray">
          <button onClick={() => setShowExplore(true)} className="hover:text-brand-dark transition-colors">Explorar IAs</button>
          <button onClick={() => setShowHowItWorks(true)} className="hover:text-brand-dark transition-colors">Cómo funciona</button>
          <button onClick={() => setShowSaved(true)} className="flex items-center gap-2 hover:text-brand-dark transition-colors">
            <History className="w-4 h-4" />
            Mis Guardados
          </button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-brand-dark"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <X className="w-6 h-6" /> : <div className="space-y-1.5"><div className="w-6 h-0.5 bg-brand-dark"></div><div className="w-6 h-0.5 bg-brand-dark"></div><div className="w-6 h-0.5 bg-brand-dark"></div></div>}
        </button>

        {/* Mobile Nav Drawer */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 flex flex-col gap-6 shadow-xl md:hidden"
            >
              <button 
                onClick={() => { setShowExplore(true); setShowMobileMenu(false); }} 
                className="flex items-center gap-3 text-lg font-bold text-brand-dark"
              >
                <Zap className="w-5 h-5 text-brand-primary" />
                Explorar IAs
              </button>
              <button 
                onClick={() => { setShowHowItWorks(true); setShowMobileMenu(false); }} 
                className="flex items-center gap-3 text-lg font-bold text-brand-dark"
              >
                <HelpCircle className="w-5 h-5 text-brand-secondary" />
                Cómo funciona
              </button>
              <button 
                onClick={() => { setShowSaved(true); setShowMobileMenu(false); }} 
                className="flex items-center gap-3 text-lg font-bold text-brand-dark"
              >
                <History className="w-5 h-5 text-brand-primary" />
                Mis Guardados
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 pb-20">
        {/* Hero Section */}
        <section className={`text-center transition-all duration-500 ${result ? 'py-8 md:py-12' : 'py-16 md:py-24'}`}>
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="badge-tech mb-8"
          >
            <Zap className="w-3 h-3" />
            Buscador de IA Inteligente
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-brand-dark mb-6 leading-[1.1] tracking-tight"
          >
            Encuentra la <span className="text-gradient">IA perfecta</span> <br /> 
            para tu próxima tarea
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-brand-gray max-w-2xl mx-auto mb-12 font-medium"
          >
            Describe lo que necesitas hacer y nuestro motor de búsqueda inteligente analizará 
            cientos de herramientas para darte la mejor recomendación.
          </motion.p>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto flex items-center bg-white border border-slate-200 rounded-2xl p-2 shadow-xl shadow-slate-200/50"
          >
            <input 
              type="text" 
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Ej: Crear un logo minimalista..."
              className="flex-1 bg-transparent border-none px-4 py-3 text-lg focus:outline-none focus:ring-0 text-brand-dark"
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !task.trim()}
              className="btn-primary flex items-center gap-2 overflow-hidden min-w-[120px] justify-center h-12"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    <div className="relative w-5 h-5">
                      <motion.div
                        animate={{ 
                          rotateY: [0, 180, 360],
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <BookOpen className="w-4 h-4 text-white" />
                      </motion.div>
                    </div>
                    <span className="text-[10px] font-bold">Buscando...</span>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span className="text-sm">Buscar</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.form>

          {/* Success Message */}
          <AnimatePresence>
            {showSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 flex items-center justify-center gap-2 text-brand-primary font-bold"
              >
                <div className="bg-brand-primary/10 p-2 rounded-full">
                  <Bot className="w-5 h-5" />
                </div>
                <span>¡Ya tenemos el resultado! Mira abajo 👇</span>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl flex items-center gap-3 mb-12"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-16"
            >
              {/* Reasoning Banner */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/20 p-8 md:p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center mt-4 gap-6"
              >
                <div className="flex items-center gap-4 flex-wrap justify-center">
                  <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-black text-white">
                    {result.topRecommendation.pricing}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand-primary bg-white/50 px-4 py-1.5 rounded-full border border-brand-primary/10">
                    <Zap className="w-4 h-4" />
                    {result.topRecommendation.pros[0]}
                  </div>
                </div>
                <p className="text-[32px] text-brand-dark font-black leading-tight max-w-4xl tracking-tight">
                  {result.reasoning}
                </p>
              </motion.div>

              {/* Top Recommendation */}
              <section>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                  <div className="flex items-center gap-4 flex-1">
                    <h2 className="text-3xl font-black text-brand-dark">Recomendación Principal</h2>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={saveCurrentResult}
                    className={`flex items-center gap-2 px-6 py-3 border rounded-2xl text-sm font-bold transition-all shadow-sm ${
                      justSaved 
                        ? 'bg-green-50 border-green-200 text-green-600' 
                        : 'bg-white border-slate-200 text-brand-dark hover:bg-slate-50'
                    }`}
                  >
                    {justSaved ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        ¡Guardado!
                      </>
                    ) : (
                      <>
                        <Bookmark className={`w-4 h-4 ${savedResults.some(s => s.task === task) ? 'fill-brand-secondary text-brand-secondary' : 'text-brand-secondary'}`} />
                        Guardar Resultado
                      </>
                    )}
                  </motion.button>
                </div>

                <RecommendationCard 
                  recommendation={result.topRecommendation} 
                  isMain 
                />
              </section>

              {/* Alternatives */}
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <h2 className="text-3xl font-black text-brand-dark">Otras Alternativas</h2>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {result.alternatives.map((alt, idx) => (
                    <div key={alt.name}>
                      <RecommendationCard 
                        recommendation={alt} 
                        index={idx + 2}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* New Query Button */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center pt-8"
              >
                <button 
                  onClick={() => {
                    setResult(null);
                    setTask('');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn-primary px-10 py-4 text-lg flex items-center gap-3 shadow-xl shadow-brand-primary/20 hover:scale-105 transition-transform"
                >
                  <Sparkles className="w-5 h-5" />
                  Hacer nueva consulta
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100 text-center text-brand-gray text-sm font-medium">
        <p>© 2026 Encuentra tu IA. Diseñado para la armonía entre tecnología y creatividad.</p>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {showExplore && (
          <Modal title="Explorar IAs" onClose={() => { setShowExplore(false); setExploreLimit(10); }}>
            <div className="space-y-6">
              <p className="text-brand-gray font-medium">
                El ecosistema de Inteligencia Artificial está en constante evolución. Aquí tienes un resumen de las herramientas más potentes actualmente:
              </p>
              <div className="grid gap-4">
                {allAIs.slice(0, exploreLimit).map((ai) => (
                  <div key={ai.name} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-primary/30 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-brand-dark">{ai.name}</h4>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-slate-200 px-2 py-1 rounded-md">{ai.type}</span>
                    </div>
                    <p className="text-sm text-brand-gray mb-4">{ai.desc}</p>
                    <a 
                      href={ai.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary hover:text-brand-dark transition-colors"
                    >
                      Visitar sitio oficial
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={handleLoadMore}
                className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-brand-dark hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                Cargar más IAs
                <ChevronRight className="w-4 h-4 rotate-90" />
              </button>
            </div>
          </Modal>
        )}

        {showHowItWorks && (
          <Modal title="Cómo funciona Encuentra tu IA" onClose={() => setShowHowItWorks(false)}>
            <div className="space-y-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                  <HelpCircle className="text-white w-8 h-8" />
                </div>
                <p className="text-brand-gray font-medium">
                  Nuestra misión es simplificar tu acceso a la tecnología más avanzada.
                </p>
              </div>
              
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Describe tu necesidad', desc: 'Escribe en lenguaje natural qué tarea quieres realizar, sin importar lo compleja que sea.' },
                  { step: '2', title: 'Análisis Inteligente', desc: 'Nuestro motor analiza los requisitos técnicos, creativos y de presupuesto de tu solicitud.' },
                  { step: '3', title: 'Match Perfecto', desc: 'Comparamos tu tarea con las capacidades actualizadas de cientos de modelos de IA.' },
                  { step: '4', title: 'Resultados Estructurados', desc: 'Te presentamos la mejor opción y alternativas viables con sus pros, contras y precios.' }
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-brand-dark text-white flex items-center justify-center font-black flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-dark mb-1">{item.title}</h4>
                      <p className="text-sm text-brand-gray">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        )}

        {showSaved && (
          <Modal title="Mis Guardados" onClose={() => setShowSaved(false)}>
            {savedResults.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-brand-gray font-medium">Aún no tienes resultados guardados.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {savedResults.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-brand-primary transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.date}</span>
                      <button onClick={() => deleteSaved(idx)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <h4 className="font-bold text-brand-dark mb-1 line-clamp-1">{item.task}</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-brand-gray">Recomendado: <span className="font-bold text-brand-secondary">{item.result.topRecommendation.name}</span></p>
                      <button 
                        onClick={() => {
                          setResult(item.result);
                          setTask(item.task);
                          setShowSaved(false);
                        }}
                        className="text-xs font-black text-brand-primary flex items-center gap-1 hover:gap-2 transition-all"
                      >
                        Ver detalle <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-brand-dark/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-2xl font-black text-brand-dark tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-brand-gray" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-100px)]">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

interface RecommendationCardProps {
  recommendation: AIRecommendation;
  isMain?: boolean;
  index?: number;
}

function RecommendationCard({ 
  recommendation, 
  isMain = false,
  index
}: RecommendationCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`glass-card overflow-hidden flex flex-col ${isMain ? 'md:flex-row' : ''}`}
    >
      {/* Badge/Number */}
      <div className={`p-8 flex flex-col justify-between ${isMain ? 'md:w-1/3 bg-brand-dark text-white' : 'bg-slate-50'}`}>
        <div>
          {isMain ? (
            <div className="flex flex-col gap-6 mb-6">
              <div className="inline-flex items-center gap-2 bg-gradient-brand px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] self-start">
                <Zap className="w-3 h-3" />
                La Mejor Opción
              </div>
              {recommendation.logoUrl && (
                <div 
                  className={`w-16 h-16 rounded-2xl p-3 shadow-xl flex items-center justify-center border border-slate-100/10`}
                  style={{ backgroundColor: '#00d0ff' }}
                >
                  <img 
                    src={recommendation.logoUrl} 
                    alt={recommendation.name} 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.opacity = '1';
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Fallback to a generic icon if clearbit fails
                      if (!target.src.includes('ui-avatars')) {
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(recommendation.name)}&background=00D2FF&color=fff&bold=true`;
                      }
                    }}
                    style={{ opacity: 0, transition: 'opacity 0.3s' }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-between items-start mb-6">
              <div className="text-5xl font-black text-slate-200">0{index}</div>
              {recommendation.logoUrl && (
                <div 
                  className={`w-12 h-12 rounded-xl p-2 shadow-sm flex items-center justify-center border border-slate-100`}
                  style={{ backgroundColor: index === 2 ? '#8400ff' : '#8700ff' }}
                >
                  <img 
                    src={recommendation.logoUrl} 
                    alt={recommendation.name} 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.opacity = '1';
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('ui-avatars')) {
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(recommendation.name)}&background=7B2FF7&color=fff&bold=true`;
                      }
                    }}
                    style={{ opacity: 0, transition: 'opacity 0.3s' }}
                  />
                </div>
              )}
            </div>
          )}
          <h3 className={`text-4xl font-black mb-3 leading-tight ${isMain ? 'text-white' : 'text-brand-dark'}`}>
            {recommendation.name}
          </h3>
          <p className={`text-base font-medium leading-relaxed mb-8 ${isMain ? 'text-slate-400' : 'text-brand-gray'}`}>
            {recommendation.description}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isMain ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
              <DollarSign className={`w-4 h-4 ${isMain ? 'text-brand-primary' : 'text-brand-secondary'}`} />
            </div>
            <span className="text-sm font-bold">{recommendation.pricing}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isMain ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
              <ShieldCheck className={`w-4 h-4 ${isMain ? 'text-brand-primary' : 'text-brand-secondary'}`} />
            </div>
            <span className="text-sm font-bold">{recommendation.bestFor}</span>
          </div>
          {recommendation.url && (
            <a 
              href={recommendation.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 text-sm font-bold mt-4 transition-colors ${isMain ? 'text-brand-primary hover:text-white' : 'text-brand-secondary hover:text-brand-dark'}`}
            >
              Sitio oficial
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-10 flex-1 bg-white">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Capabilities */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-6">Capacidades</h4>
            <div className="flex flex-wrap gap-2">
              {recommendation.capabilities.map(cap => (
                <span key={cap} className="bg-slate-100 text-brand-dark text-[11px] px-4 py-2 rounded-xl font-bold border border-slate-200/50">
                  {cap}
                </span>
              ))}
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="space-y-8">
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Ventajas
              </h4>
              <ul className="text-base space-y-3 text-brand-gray font-medium">
                {recommendation.pros.map(pro => (
                  <li key={pro} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                Limitaciones
              </h4>
              <ul className="text-base space-y-3 text-brand-gray font-medium">
                {recommendation.cons.map(con => (
                  <li key={con} className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
