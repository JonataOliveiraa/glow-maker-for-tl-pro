import React, { useState } from 'react';
import { SHAPE_DEFAULTS } from './MathHelper';

const RangeControl = ({ label, val, min, max, step, fn }) => (
    <div className="flex flex-col mb-3 group">
        <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider group-hover:text-cyan-400 transition-colors">
                {label}
            </span>
        </div>
        <div className="flex gap-2 items-center">
            <input 
                type="range" min={min} max={max} step={step} value={val || 0} 
                onChange={e => fn(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-600 hover:accent-cyan-500 transition-all"
            />
            <input 
                type="number" min={min} max={max} step={step} value={val || 0}
                onChange={e => fn(parseFloat(e.target.value))}
                className="w-14 bg-zinc-950 border border-zinc-700 rounded text-[10px] text-center text-zinc-200 focus:border-cyan-500 focus:text-cyan-500 outline-none p-1.5 font-mono"
            />
        </div>
    </div>
);

const Section = ({ title, icon, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-zinc-800">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-3 flex items-center justify-between bg-zinc-900 hover:bg-zinc-800 transition-colors"
            >
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                    <i className={`${icon} text-cyan-500`}></i> {title}
                </div>
                <i className={`ri-arrow-down-s-line text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {isOpen && <div className="p-3 bg-zinc-950/50">{children}</div>}
        </div>
    );
}

// ATUALIZADO: Recebe fileName e setFileName
const Controls = ({ settings, setSettings, onSmartDownload, onSaveToLibrary, fileName, setFileName, onCloseMobile }) => {
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
    <div className="w-full h-full flex flex-col bg-zinc-900">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between flex-shrink-0">
             <div className="flex items-center gap-3">
                 <button onClick={onCloseMobile} className="md:hidden text-zinc-400 hover:text-white">
                    <i className="ri-close-line text-xl"></i>
                 </button>
                 <h2 className="text-sm font-extrabold text-zinc-200 tracking-widest uppercase flex items-center gap-2">
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

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto custom-scroll pb-10">
            {/* ... SECTIONS (Mantidas igual, para economizar espaço) ... */}
            <Section title="Forma & Cor" icon="ri-shape-2-line">
                {/* ... (Conteúdo igual ao anterior) */}
                <div className="mb-3">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Tipo</label>
                    <div className="grid grid-cols-5 gap-1">
                        {[
                            { id: 0, icon: "ri-focus-3-line", title: "Centro" },
                            { id: 1, icon: "ri-donut-chart-line", title: "Anel" },
                            { id: 2, icon: "ri-cloudy-line", title: "Nebulosa" },
                            { id: 3, icon: "ri-star-line", title: "Estrela" },
                            { id: 4, icon: "ri-shape-2-line", title: "Polígono" }
                        ].map(shape => (
                            <button key={shape.id} onClick={() => changeShape(shape.id)} className={`h-9 rounded flex items-center justify-center transition-all border ${settings.shapeMode === shape.id ? 'bg-cyan-600 border-cyan-500 text-white shadow' : 'bg-zinc-800 border-transparent text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}>
                                <i className={`${shape.icon} text-lg`}></i>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2 items-center bg-zinc-950 p-2 rounded border border-zinc-800 mb-3">
                    <input type="color" value={settings.color} onChange={e => update('color', e.target.value)} className="h-6 w-8 cursor-pointer bg-transparent border-none p-0"/>
                    <span className="text-xs font-mono text-zinc-400 uppercase flex-1 text-right">{settings.color}</span>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase">Resolução Output</label>
                    <select className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-zinc-300 outline-none focus:border-cyan-500" value={settings.pixelCount} onChange={(e) => update('pixelCount', parseFloat(e.target.value))}>
                        <option value={32.0}>32 px</option>
                        <option value={64.0}>64 px</option>
                        <option value={128.0}>128 px</option>
                        <option value={256.0}>256 px</option>
                        <option value={512.0}>512 px</option>
                        <option value={1024.0}>1024 px (HD)</option>
                    </select>
                </div>
            </Section>

            <Section title="Geometria" icon="ri-ruler-2-line">
                <RangeControl label="Tamanho Global" val={settings.scale} min={0.1} max={5.0} step={0.1} fn={v => update('scale', v)} />
                <div className="grid grid-cols-2 gap-3 mb-2">
                    <RangeControl label="Posição X" val={settings.posX} min={-2.0} max={2.0} step={0.01} fn={v => update('posX', v)} />
                    <RangeControl label="Posição Y" val={settings.posY} min={-2.0} max={2.0} step={0.01} fn={v => update('posY', v)} />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-2 pt-2 border-t border-zinc-800">
                    <RangeControl label="Esticar X" val={settings.sizeX} min={0.1} max={3} step={0.1} fn={v => update('sizeX', v)} />
                    <RangeControl label="Esticar Y" val={settings.sizeY} min={0.1} max={3} step={0.1} fn={v => update('sizeY', v)} />
                </div>
                {settings.shapeMode === 1 && (
                    <div className="mt-3 pt-3 border-t border-zinc-800 bg-zinc-950 p-2 rounded border border-dashed border-zinc-800">
                        <label className="text-[9px] text-cyan-500 font-bold uppercase mb-2 block">Anel</label>
                        <RangeControl label="Raio" val={settings.ringRadius} min={0.1} max={1} step={0.01} fn={v => update('ringRadius', v)} />
                        <RangeControl label="Espessura" val={settings.ringWidth} min={0.01} max={0.3} step={0.01} fn={v => update('ringWidth', v)} />
                        <RangeControl label="Opacidade" val={settings.ringOpacity} min={0.0} max={1.0} step={0.05} fn={v => update('ringOpacity', v)} />
                    </div>
                )}
                {settings.shapeMode === 3 && (
                    <div className="mt-3 pt-3 border-t border-zinc-800 bg-zinc-950 p-2 rounded border border-dashed border-zinc-800">
                        <label className="text-[9px] text-cyan-500 font-bold uppercase mb-2 block">Estrela</label>
                        <RangeControl label="Pontas" val={settings.points} min={3} max={20} step={1} fn={v => update('points', v)} />
                        <RangeControl label="Raio Interno" val={settings.ringRadius} min={0.0} max={0.9} step={0.01} fn={v => update('ringRadius', v)} />
                    </div>
                )}
                {settings.shapeMode === 4 && (
                    <div className="mt-3 pt-3 border-t border-zinc-800 bg-zinc-950 p-2 rounded border border-dashed border-zinc-800">
                        <label className="text-[9px] text-cyan-500 font-bold uppercase mb-2 block">Polígono</label>
                        <RangeControl label="Lados" val={settings.points} min={3} max={12} step={1} fn={v => update('points', v)} />
                        <RangeControl label="Tamanho" val={settings.ringRadius} min={0.1} max={1.0} step={0.01} fn={v => update('ringRadius', v)} />
                        <RangeControl label="Borda" val={settings.ringWidth} min={0.01} max={0.2} step={0.01} fn={v => update('ringWidth', v)} />
                        <RangeControl label="Fill Opacity" val={settings.ringOpacity} min={0.0} max={1.0} step={0.05} fn={v => update('ringOpacity', v)} />
                    </div>
                )}
            </Section>

            <Section title="Luz & Efeitos" icon="ri-flashlight-line">
                <RangeControl label="Intensidade" val={settings.intensity} min={0.01} max={1.0} step={0.01} fn={v => update('intensity', v)} />
                <RangeControl label="Exposição" val={settings.gain} min={0.0} max={5.0} step={0.1} fn={v => update('gain', v)} />
                <RangeControl label="Contraste" val={settings.contrast} min={0.5} max={3.0} step={0.1} fn={v => update('contrast', v)} />
                <div className="pt-2 mt-2 border-t border-zinc-800">
                    <RangeControl label="Alcance (Corte)" val={settings.falloff} min={0.1} max={2.0} step={0.05} fn={v => update('falloff', v)} />
                </div>
                <div className="h-px bg-zinc-800 my-3"></div>
                <RangeControl label="Twist" val={settings.twist} min={-3.14} max={3.14} step={0.1} fn={v => update('twist', v)} />
                <RangeControl label="Distorção" val={settings.distStr} min={0} max={2.0} step={0.1} fn={v => update('distStr', v)} />
                <RangeControl label="Velocidade" val={settings.speed} min={0} max={5.0} step={0.1} fn={v => update('speed', v)} />
                <div className="flex gap-2 items-end mt-2">
                    <div className="flex-1"><RangeControl label="Semente" val={settings.seed} min={0} max={100} step={0.1} fn={v => update('seed', v)} /></div>
                    <button onClick={() => update('seed', Math.random()*100)} className="mb-2.5 h-7 w-7 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-600 text-zinc-400 hover:text-white transition-colors"><i className="ri-shuffle-line"></i></button>
                </div>
            </Section>

            <Section title="Configuração" icon="ri-layout-line" defaultOpen={false}>
                <RangeControl label="Zoom Canvas" val={settings.canvasWidth} min={200} max={1200} step={10} fn={v => update('canvasWidth', v)} />
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800">
                    <span className="text-xs text-zinc-400">Mostrar Grade</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={settings.showGrid} onChange={e => update('showGrid', e.target.checked)} />
                        <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                </div>
            </Section>
        </div>

        {/* Footer com Nome e Ações */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex-shrink-0 flex flex-col gap-3">
            
            {/* Input de Nome */}
            <div className="relative">
                <i className="ri-pencil-line absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs"></i>
                <input 
                    type="text" 
                    placeholder="Nome do Arquivo..." 
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded pl-8 pr-3 py-2 text-xs text-zinc-200 focus:border-cyan-600 outline-none transition-colors"
                />
            </div>

            <div className="grid grid-cols-2 gap-2">
                <button 
                    onClick={onSaveToLibrary} 
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-bold py-2.5 rounded text-xs uppercase flex justify-center items-center gap-2 transition-all"
                >
                    <i className="ri-save-3-line"></i> Salvar
                </button>

                <button 
                    onClick={onSmartDownload}
                    className="bg-gradient-to-r from-violet-700 to-fuchsia-700 hover:from-violet-600 hover:to-fuchsia-600 text-white font-bold py-2.5 rounded text-xs uppercase shadow-lg shadow-violet-900/20 flex justify-center items-center gap-2 transition-all"
                >
                    <i className="ri-download-2-line"></i> Baixar
                </button>
            </div>
        </div>
    </div>
  );
};

export default Controls;