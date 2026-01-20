import React, { useState } from 'react';
import { SHAPE_DEFAULTS } from './MathHelper';

const RangeControl = ({ label, val, min, max, step, fn }) => (
    <div className="flex flex-col mb-3 group">
        <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider group-hover:text-cyan-400 transition-colors">
                {label}
            </span>
        </div>
        <div className="flex gap-2 items-center">
            <input 
                type="range" min={min} max={max} step={step} value={val || 0} 
                onChange={e => fn(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-cyan-600 hover:accent-cyan-500 transition-all"
            />
            <input 
                type="number" min={min} max={max} step={step} value={val || 0}
                onChange={e => fn(parseFloat(e.target.value))}
                className="w-14 bg-[#111] border border-gray-700 rounded text-[10px] text-center text-gray-200 focus:border-cyan-500 focus:text-cyan-500 outline-none p-1.5 font-mono"
            />
        </div>
    </div>
);

const Section = ({ title, icon, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-800">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-3 flex items-center justify-between bg-[#141414] hover:bg-[#1a1a1a] transition-colors"
            >
                <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                    <i className={`${icon} text-cyan-500`}></i> {title}
                </div>
                <i className={`ri-arrow-down-s-line text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {isOpen && <div className="p-3 bg-[#0a0a0a]">{children}</div>}
        </div>
    );
}

const Controls = ({ settings, setSettings, onSmartDownload, onCloseMobile, onSaveToLibrary }) => {
  const changeShape = (newShape) => {
      const defaults = SHAPE_DEFAULTS[newShape];
      setSettings(prev => ({
          ...prev,
          shapeMode: newShape,
          ...defaults 
      }));
  };

  const update = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));
  const togglePause = () => setSettings(prev => ({ ...prev, isPaused: !prev.isPaused }));

  return (
    <div className="w-full h-full flex flex-col bg-[#0f0f0f]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-800 bg-[#111] flex items-center justify-between flex-shrink-0">
             <div className="flex items-center gap-3">
                 {/* Botão Fechar Mobile */}
                 <button onClick={onCloseMobile} className="md:hidden text-gray-400 hover:text-white">
                    <i className="ri-close-line text-xl"></i>
                 </button>
                 <h2 className="text-sm font-extrabold text-gray-200 tracking-widest uppercase flex items-center gap-2">
                    <i className="ri-equalizer-line text-cyan-500"></i> Editor
                 </h2>
             </div>
             
             <button 
                onClick={togglePause}
                className={`w-8 h-8 rounded flex items-center justify-center border transition-all ${settings.isPaused ? 'bg-yellow-900/30 border-yellow-700 text-yellow-500' : 'bg-green-900/30 border-green-700 text-green-500'}`}
                title={settings.isPaused ? "Retomar" : "Pausar"}
             >
                 <i className={settings.isPaused ? "ri-play-fill" : "ri-pause-fill"}></i>
             </button>
        </div>

        {/* Conteúdo Scrollável */}
        <div className="flex-1 overflow-y-auto custom-scroll pb-20">
            
            {/* 1. SETUP */}
            <Section title="Forma & Cor" icon="ri-shape-2-line">
                <div className="mb-3">
                    <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Tipo</label>
                    <div className="grid grid-cols-5 gap-1">
                        {[
                            { id: 0, icon: "ri-focus-3-line", title: "Centro" },
                            { id: 1, icon: "ri-donut-chart-line", title: "Anel" },
                            { id: 2, icon: "ri-cloudy-line", title: "Nebulosa" },
                            { id: 3, icon: "ri-star-line", title: "Estrela" },
                            { id: 4, icon: "ri-shape-2-line", title: "Polígono" }
                        ].map(shape => (
                            <button
                                key={shape.id}
                                onClick={() => changeShape(shape.id)}
                                className={`
                                    h-9 rounded flex items-center justify-center transition-all border
                                    ${settings.shapeMode === shape.id 
                                        ? 'bg-cyan-600 border-cyan-500 text-white shadow' 
                                        : 'bg-[#1a1a1a] border-transparent text-gray-500 hover:border-gray-700 hover:text-gray-300'}
                                `}
                            >
                                <i className={`${shape.icon} text-lg`}></i>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2 items-center bg-[#161616] p-2 rounded border border-gray-800 mb-3">
                    <input type="color" value={settings.color} onChange={e => update('color', e.target.value)} className="h-6 w-8 cursor-pointer bg-transparent border-none p-0"/>
                    <span className="text-xs font-mono text-gray-400 uppercase flex-1 text-right">{settings.color}</span>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase">Resolução Output</label>
                    <select className="w-full bg-[#161616] border border-gray-800 rounded p-2 text-xs text-gray-300 outline-none focus:border-cyan-500" value={settings.pixelCount} onChange={(e) => update('pixelCount', parseFloat(e.target.value))}>
                        <option value={32.0}>32 px</option>
                        <option value={64.0}>64 px</option>
                        <option value={128.0}>128 px</option>
                        <option value={256.0}>256 px</option>
                        <option value={512.0}>512 px</option>
                        <option value={1024.0}>1024 px (HD)</option>
                    </select>
                </div>
            </Section>

            {/* 2. GEOMETRIA */}
            <Section title="Geometria" icon="ri-ruler-2-line">
                <RangeControl label="Tamanho Global" val={settings.scale} min={0.1} max={5.0} step={0.1} fn={v => update('scale', v)} />
                
                <div className="grid grid-cols-2 gap-3 mb-2">
                    <RangeControl label="Posição X" val={settings.posX} min={-2.0} max={2.0} step={0.01} fn={v => update('posX', v)} />
                    <RangeControl label="Posição Y" val={settings.posY} min={-2.0} max={2.0} step={0.01} fn={v => update('posY', v)} />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-2">
                    <RangeControl label="Esticar X" val={settings.sizeX} min={0.1} max={3} step={0.1} fn={v => update('sizeX', v)} />
                    <RangeControl label="Esticar Y" val={settings.sizeY} min={0.1} max={3} step={0.1} fn={v => update('sizeY', v)} />
                </div>

                {settings.shapeMode === 1 && (
                    <div className="mt-3 pt-3 border-t border-gray-800 bg-[#141414] p-2 rounded border border-dashed border-gray-700">
                        <label className="text-[9px] text-cyan-500 font-bold uppercase mb-2 block">Propriedades do Anel</label>
                        <RangeControl label="Raio" val={settings.ringRadius} min={0.1} max={1} step={0.01} fn={v => update('ringRadius', v)} />
                        <RangeControl label="Espessura" val={settings.ringWidth} min={0.01} max={0.3} step={0.01} fn={v => update('ringWidth', v)} />
                        <RangeControl label="Opacidade" val={settings.ringOpacity} min={0.0} max={1.0} step={0.05} fn={v => update('ringOpacity', v)} />
                    </div>
                )}

                {settings.shapeMode === 3 && (
                    <div className="mt-3 pt-3 border-t border-gray-800 bg-[#141414] p-2 rounded border border-dashed border-gray-700">
                        <label className="text-[9px] text-cyan-500 font-bold uppercase mb-2 block">Propriedades da Estrela</label>
                        <RangeControl label="Quantidade de Pontas" val={settings.points} min={3} max={20} step={1} fn={v => update('points', v)} />
                        <RangeControl label="Afiamento (Raio Interno)" val={settings.ringRadius} min={0.0} max={0.9} step={0.01} fn={v => update('ringRadius', v)} />
                    </div>
                )}

                {settings.shapeMode === 4 && (
                    <div className="mt-3 pt-3 border-t border-gray-800 bg-[#141414] p-2 rounded border border-dashed border-gray-700">
                        <label className="text-[9px] text-cyan-500 font-bold uppercase mb-2 block">Propriedades do Polígono</label>
                        <RangeControl label="Lados (4=Quadrado)" val={settings.points} min={3} max={12} step={1} fn={v => update('points', v)} />
                        <RangeControl label="Tamanho" val={settings.ringRadius} min={0.1} max={1.0} step={0.01} fn={v => update('ringRadius', v)} />
                        <RangeControl label="Espessura Borda" val={settings.ringWidth} min={0.01} max={0.2} step={0.01} fn={v => update('ringWidth', v)} />
                        <RangeControl label="Preenchimento" val={settings.ringOpacity} min={0.0} max={1.0} step={0.05} fn={v => update('ringOpacity', v)} />
                    </div>
                )}
            </Section>

            {/* 3. LUZ & EFEITOS */}
            <Section title="Luz & Efeitos" icon="ri-flashlight-line">
                <RangeControl label="Intensidade (Base)" val={settings.intensity} min={0.01} max={1.0} step={0.01} fn={v => update('intensity', v)} />
                <RangeControl label="Exposição (Gain)" val={settings.gain} min={0.0} max={5.0} step={0.1} fn={v => update('gain', v)} />
                <RangeControl label="Contraste" val={settings.contrast} min={0.5} max={3.0} step={0.1} fn={v => update('contrast', v)} />
                
                <div className="h-px bg-gray-800 my-3"></div>
                
                <RangeControl label="Rotação (Twist)" val={settings.twist} min={-3.14} max={3.14} step={0.1} fn={v => update('twist', v)} />
                <RangeControl label="Distorção (Noise)" val={settings.distStr} min={0} max={2.0} step={0.1} fn={v => update('distStr', v)} />
                <RangeControl label="Velocidade Animação" val={settings.speed} min={0} max={5.0} step={0.1} fn={v => update('speed', v)} />
                
                <div className="flex gap-2 items-end mt-2">
                    <div className="flex-1">
                        <RangeControl label="Semente (Seed)" val={settings.seed} min={0} max={100} step={0.1} fn={v => update('seed', v)} />
                    </div>
                    <button 
                        onClick={() => update('seed', Math.random()*100)} 
                        className="mb-2.5 h-7 w-7 flex items-center justify-center bg-[#1a1a1a] hover:bg-[#222] rounded border border-gray-700 text-gray-400 hover:text-white transition-colors"
                        title="Randomizar Forma"
                    >
                        <i className="ri-shuffle-line"></i>
                    </button>
                </div>
            </Section>

            {/* 4. CANVAS */}
            <Section title="Configuração do Quadro" icon="ri-layout-line" defaultOpen={false}>
                <RangeControl label="Zoom do Canvas" val={settings.canvasWidth} min={200} max={1200} step={10} fn={v => update('canvasWidth', v)} />
                
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-800">
                    <span className="text-xs text-gray-400">Mostrar Grade</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={settings.showGrid} onChange={e => update('showGrid', e.target.checked)} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                </div>
            </Section>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-[#111] flex-shrink-0 flex flex-col gap-2">
            <button 
                onClick={onSaveToLibrary} // Prop nova recebida do App.tsx
                className="w-full bg-gray-800 hover:bg-gray-700 text-cyan-400 border border-gray-700 font-bold py-2.5 rounded text-xs uppercase flex justify-center items-center gap-2 transition-all"
            >
                <i className="ri-save-3-line text-lg"></i> Salvar na Biblioteca
            </button>

            <button 
                onClick={onSmartDownload}
                className="w-full bg-gradient-to-r from-pink-700 to-purple-700 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-3.5 rounded-lg text-xs uppercase shadow-lg shadow-purple-900/20 flex justify-center items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                <i className="ri-download-2-line text-lg"></i> Baixar PNG ({settings.pixelCount}px)
            </button>
        </div>
    </div>
  );
};

export default Controls;