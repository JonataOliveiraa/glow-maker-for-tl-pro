import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateStripSpritesheet } from './SpritesheetHelper';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GlowMaterial } from './GlowMaterial';

// --- COMPONENTES AUXILIARES ---

const NumberStepper = ({ label, value, onChange, min, max, step = 1, format = (v) => v }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-zinc-400 font-bold uppercase">{label}</label>
        <div className="flex items-center bg-zinc-950 rounded border border-zinc-700 overflow-hidden">
            <button onClick={() => onChange(Math.max(min, Number((value - step).toFixed(2))))} className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border-r border-zinc-800"><i className="ri-subtract-line"></i></button>
            <div className="flex-1 text-center text-xs font-mono text-zinc-200">{format(value)}</div>
            <button onClick={() => onChange(Math.min(max, Number((value + step).toFixed(2))))} className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border-l border-zinc-800"><i className="ri-add-line"></i></button>
        </div>
    </div>
);

const RangeControl = ({ label, val, min, max, step, fn }) => (
    <div className="flex flex-col mb-2 group">
        <div className="flex justify-between items-center mb-1"><span className="text-[10px] text-zinc-500 font-bold uppercase group-hover:text-cyan-500 transition-colors">{label}</span><span className="text-[9px] text-zinc-600 font-mono">{val?.toFixed(2)}</span></div>
        <input type="range" min={min} max={max} step={step} value={val || 0} onChange={e => fn(parseFloat(e.target.value))} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-600 hover:accent-cyan-500" />
    </div>
);

const PreviewCell = ({ settings, width, height }) => (
    <div style={{ width: width, height: height }} className="bg-black relative overflow-hidden flex-shrink-0">
        <Canvas camera={{ position: [0, 0, 2] }} gl={{ preserveDrawingBuffer: true, antialias: false }} style={{ imageRendering: 'pixelated' }}>
            <mesh>
                <planeGeometry args={[4, 4]} />
                <glowMaterial transparent={true} blending={THREE.AdditiveBlending} depthWrite={false} uTime={1.0} uPixelCount={settings.pixelCount} uShowGrid={0.0} uPosition={new THREE.Vector2(settings.posX, settings.posY)} uScale={new THREE.Vector2((settings.sizeX||1)*(settings.scale||1), (settings.sizeY||1)*(settings.scale||1))} uIntensity={settings.intensity} uGain={settings.gain} uContrast={settings.contrast||1.0} uDistortionStr={settings.distStr} uFrequency={settings.freq} uShapeMode={settings.shapeMode} uFalloff={settings.falloff||1.0} uRingRadius={settings.ringRadius} uRingWidth={settings.ringWidth} uRingOpacity={settings.ringOpacity} uPoints={settings.points} uTwist={settings.twist} uSeed={settings.seed} uColor={new THREE.Color(settings.color)} />
            </mesh>
        </Canvas>
    </div>
);

// --- PREVIEW INTELIGENTE (SIMULAÇÃO OU PLAYBACK) ---
const GeneratorPreview = ({ baseSettings, animMode, animSpeed, frameCount, stripList, isPlaying, isLooping }) => {
    const materialRef = useRef();
    const frameIndex = useRef(0);
    const timer = useRef(0);

    const applySettingsToMaterial = (mat, settings) => {
        mat.uPixelCount = settings.pixelCount;
        mat.uShowGrid = 0.0;
        mat.uPosition.set(settings.posX || 0, settings.posY || 0);
        const s = settings.scale || 1.0;
        mat.uScale.set((settings.sizeX || 1.0) * s, (settings.sizeY || 1.0) * s);
        mat.uIntensity = settings.intensity;
        mat.uGain = settings.gain;
        mat.uContrast = settings.contrast || 1.0;
        mat.uDistortionStr = settings.distStr;
        mat.uFrequency = settings.freq;
        mat.uShapeMode = settings.shapeMode;
        mat.uFalloff = settings.falloff || 1.0;
        mat.uRingRadius = settings.ringRadius;
        mat.uRingWidth = settings.ringWidth;
        mat.uRingOpacity = settings.ringOpacity;
        mat.uPoints = settings.points;
        mat.uTwist = settings.twist;
        mat.uSeed = settings.seed;
        mat.uColor.set(settings.color);
    };

    useFrame((state, delta) => {
        if (!materialRef.current) return;
        const mat = materialRef.current;

        // Se estiver pausado e tiver lista, renderiza o frame atual estático (poderia ser o 0 ou o último visto)
        if (!isPlaying && stripList && stripList.length > 0) {
             // Mantém o ultimo frameIndex válido
             const currentData = stripList[frameIndex.current % stripList.length];
             applySettingsToMaterial(mat, currentData);
             return;
        }

        // Timer de 12 FPS
        timer.current += delta;
        if (timer.current < 1/12) return; 
        timer.current = 0;

        // MODO 1: PLAYBACK REAL (Lista existe)
        if (stripList && stripList.length > 0) {
            let nextIndex = frameIndex.current + 1;
            
            // Lógica de Loop
            if (nextIndex >= stripList.length) {
                if (isLooping) {
                    nextIndex = 0;
                } else {
                    nextIndex = stripList.length - 1; // Para no final
                    // Aqui poderíamos emitir um evento de "stop", mas no React loop é complexo via props
                }
            }
            frameIndex.current = nextIndex;
            
            const currentFrameData = stripList[frameIndex.current];
            applySettingsToMaterial(mat, currentFrameData);
        } 
        // MODO 2: SIMULAÇÃO (Lista vazia)
        else {
            frameIndex.current = (frameIndex.current + 1) % frameCount;
            const i = frameIndex.current;
            const simSettings = { ...baseSettings };
            if (animMode === 'seed') {
                simSettings.seed = (baseSettings.seed || 0) + (i * animSpeed);
            } else {
                const rotationStep = (Math.PI * 2 * animSpeed) / frameCount;
                simSettings.twist = (baseSettings.twist || 0) + (i * rotationStep);
            }
            applySettingsToMaterial(mat, simSettings);
        }
    });

    return (
        <mesh>
            <planeGeometry args={[4, 4]} />
            <glowMaterial ref={materialRef} transparent={true} blending={THREE.AdditiveBlending} depthWrite={false} uTime={1.0} uPixelCount={64} uColor={new THREE.Color('#ffffff')} />
        </mesh>
    );
};

const SpritesheetScreen = ({ library, onDelete }) => {
    const navigate = useNavigate();
    
    // States Globais
    const [selectedGlow, setSelectedGlow] = useState(null);
    const [previewSettings, setPreviewSettings] = useState(null); 
    const [stripList, setStripList] = useState([]); 
    const [selectedFrameIndex, setSelectedFrameIndex] = useState(null);
    
    // Configuração Gerador
    const [frameCount, setFrameCount] = useState(8); 
    const [animMode, setAnimMode] = useState('seed'); 
    const [animSpeed, setAnimSpeed] = useState(1.0); 
    
    // Configuração Playback
    const [isPlaying, setIsPlaying] = useState(true);
    const [isLooping, setIsLooping] = useState(true);

    // UI States
    const [previewZoom, setPreviewZoom] = useState(4.0); 
    const [exportName, setExportName] = useState("");
    const [activeTab, setActiveTab] = useState('preview');

    const exportSceneRef = useRef(null);

    const handleSelectLibraryItem = (item) => {
        setSelectedGlow(item);
        setPreviewSettings(JSON.parse(JSON.stringify(item))); 
        setSelectedFrameIndex(null);
        setStripList([]); // Limpa a lista para voltar ao modo "Simulação"
        setIsPlaying(true); // Auto-play no preview
    };

    const updatePreviewSetting = (key, value) => {
        setPreviewSettings(prev => ({ ...prev, [key]: value }));
    };

    const generateAnimation = () => {
        if (!previewSettings) return;
        const newFrames = [];
        for (let i = 0; i < frameCount; i++) {
            const frameSettings = JSON.parse(JSON.stringify(previewSettings));
            if (animMode === 'seed') frameSettings.seed = (previewSettings.seed || 0) + (i * animSpeed); 
            else frameSettings.twist = (previewSettings.twist || 0) + (i * ((Math.PI * 2 * animSpeed) / frameCount));
            newFrames.push(frameSettings);
        }
        setStripList(newFrames);
        setSelectedFrameIndex(null); 
        setIsPlaying(true);
        if (window.innerWidth < 768) setActiveTab('preview');
    };

    const resetGenerator = () => {
        setStripList([]); // Limpa a lista, fazendo a UI voltar para os controles de geração
        setIsPlaying(true);
    };

    const updateFrame = (key, value) => {
        if (selectedFrameIndex === null) return;
        setStripList(prev => {
            const newList = [...prev];
            newList[selectedFrameIndex] = { ...newList[selectedFrameIndex], [key]: value };
            return newList;
        });
    };

    // --- LÓGICA DE REORDENAÇÃO (CIMA/BAIXO) ---
    const moveFrame = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= stripList.length) return;
        
        setStripList(prev => {
            const newList = [...prev];
            // Troca os elementos
            [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
            return newList;
        });
        
        // Mantém a seleção acompanhando o item
        if (selectedFrameIndex === index) setSelectedFrameIndex(newIndex);
    };

    const handleExport = async () => {
        if (!exportSceneRef.current || stripList.length === 0) return;
        await generateStripSpritesheet(
            exportSceneRef.current.gl, exportSceneRef.current.scene, exportSceneRef.current.camera, exportSceneRef.current.materialRef, stripList,
            exportName 
        );
    };

    return (
        <div className="fixed inset-0 w-full h-full flex flex-col md:flex-row bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
            
            {/* COLUNA 1: BIBLIOTECA */}
            <div className={`
                md:w-[280px] md:border-r md:border-zinc-800 md:flex flex-col flex-shrink-0 z-20 bg-zinc-900 w-full h-full
                ${activeTab === 'library' ? 'flex' : 'hidden'}
            `}>
                <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between shrink-0">
                    <button onClick={() => navigate('/')} className="text-zinc-400 hover:text-white flex items-center gap-1 text-xs font-bold uppercase tracking-wide transition-colors">
                        <i className="ri-arrow-left-line"></i> Editor
                    </button>
                    <span className="text-xs font-bold text-zinc-500">BIBLIOTECA</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scroll pb-20 md:pb-0">
                    {library.length === 0 && <div className="text-zinc-600 text-xs p-4 text-center">Nenhum glow salvo.</div>}
                    {library.map((item) => (
                        <div 
                            key={item.id} 
                            onClick={() => handleSelectLibraryItem(item)} 
                            className={`p-3 rounded border cursor-pointer transition-all flex items-center justify-between group relative 
                                ${selectedGlow?.id === item.id ? 'bg-zinc-800 border-cyan-600 shadow-md' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}
                            `}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded bg-black border border-zinc-700 overflow-hidden relative flex-shrink-0">
                                    <div className="absolute inset-0 opacity-50" style={{backgroundColor: item.color}}></div>
                                    <i className={`ri-${["focus-3", "donut-chart", "cloudy", "star", "shape-2"][item.shapeMode]}-line absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xs`}></i>
                                </div>
                                <div className="min-w-0"><div className="text-xs font-bold text-zinc-200 truncate">{item.name}</div><div className="text-[9px] text-zinc-500 truncate">{item.pixelCount}px</div></div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-900/30 text-zinc-600 hover:text-red-500 transition-colors"><i className="ri-delete-bin-line"></i></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* COLUNA 2: PREVIEW / TIRA */}
            <div className={`
                flex-1 flex-col bg-[#09090b] relative min-w-0 w-full h-full
                ${activeTab === 'preview' ? 'flex' : 'hidden'}
                md:flex
            `}>
                <div className="h-14 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-10 shadow-md gap-2">
                    <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-2 bg-black/30 px-2 md:px-3 py-1 rounded border border-zinc-700 shrink-0">
                            <i className="ri-zoom-in-line text-zinc-500 text-xs"></i>
                            <input type="range" min="0.5" max="10" step="0.5" value={previewZoom} onChange={(e) => setPreviewZoom(parseFloat(e.target.value))} className="w-16 md:w-24 h-1.5 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                            <span className="text-xs font-mono text-cyan-400 w-6 text-right">{previewZoom}x</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <input type="text" placeholder="Nome..." value={exportName} onChange={(e) => setExportName(e.target.value)} className="bg-zinc-950 border border-zinc-700 rounded text-xs px-2 py-1.5 text-zinc-200 focus:border-cyan-500 outline-none w-20 md:w-40" />
                        <button onClick={handleExport} disabled={stripList.length === 0} className={`px-3 md:px-5 py-2 rounded font-bold text-xs uppercase shadow-lg flex items-center gap-2 transition-all ${stripList.length > 0 ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}>
                            <i className="ri-download-2-line text-lg"></i> <span className="hidden md:inline">Baixar</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4 md:p-8 bg-image-pattern flex justify-center items-start pb-24 md:pb-8">
                    {stripList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full opacity-20 select-none mt-10 md:mt-20 text-center">
                            <i className="ri-layout-row-line text-6xl mb-4 text-zinc-500"></i>
                            <p className="text-zinc-500 text-sm">Selecione um glow na Biblioteca<br/>e clique em "Gerar"</p>
                        </div>
                    ) : (
                        <div className="flex flex-col shadow-2xl border border-zinc-700 bg-black/50 backdrop-blur-sm">
                            {stripList.map((frame, i) => (
                                <div key={i} onClick={() => { setSelectedFrameIndex(i); if(window.innerWidth < 768) setActiveTab('generator'); }} className={`flex relative group cursor-pointer transition-all border-l-4 ${selectedFrameIndex === i ? 'border-cyan-500 bg-zinc-800/50' : 'border-transparent hover:border-zinc-600'}`}>
                                    <PreviewCell settings={frame} width={frame.pixelCount * previewZoom} height={frame.pixelCount * previewZoom} />
                                    
                                    {/* Tag lateral com Botões de Reordenação */}
                                    <div className={`absolute left-full top-0 ml-2 h-full flex items-center transition-opacity z-20 ${selectedFrameIndex === i ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <div className="bg-zinc-900 flex flex-col p-1 rounded border border-zinc-700 shadow-xl gap-1">
                                            {/* Info */}
                                            <div className="text-[9px] text-purple-400 font-bold px-1 text-center border-b border-zinc-800 pb-1">#{i + 1}</div>
                                            
                                            {/* Botões Mover */}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); moveFrame(i, -1); }}
                                                className="w-6 h-5 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white disabled:opacity-30"
                                                disabled={i === 0}
                                                title="Mover para Cima"
                                            >
                                                <i className="ri-arrow-up-s-line"></i>
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); moveFrame(i, 1); }}
                                                className="w-6 h-5 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white disabled:opacity-30"
                                                disabled={i === stripList.length - 1}
                                                title="Mover para Baixo"
                                            >
                                                <i className="ri-arrow-down-s-line"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {selectedFrameIndex === i && <div className="absolute inset-0 border-2 border-cyan-500 pointer-events-none shadow-[inset_0_0_10px_rgba(6,182,212,0.3)]"></div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* COLUNA 3: CONTROLES / GERADOR */}
            <div className={`
                md:w-[300px] md:border-l md:border-zinc-800 md:flex flex-col z-10 shadow-xl flex-shrink-0 bg-zinc-900 w-full h-full
                ${activeTab === 'generator' ? 'flex' : 'hidden'}
            `}>
                {selectedFrameIndex !== null ? (
                    // MODO EDIÇÃO FRAME ÚNICO
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center shrink-0">
                            <h3 className="text-xs font-bold text-cyan-400 uppercase flex items-center gap-2"><i className="ri-edit-circle-line"></i> Frame #{selectedFrameIndex + 1}</h3>
                            <button onClick={() => setSelectedFrameIndex(null)} className="text-zinc-500 hover:text-white"><i className="ri-close-line text-lg"></i></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scroll space-y-4 pb-24 md:pb-4">
                            <div className="flex gap-2 items-center bg-zinc-950 p-2 rounded border border-zinc-800">
                                <input type="color" value={stripList[selectedFrameIndex].color} onChange={e => updateFrame('color', e.target.value)} className="h-6 w-8 cursor-pointer bg-transparent border-none p-0"/>
                                <span className="text-xs font-mono text-zinc-400 uppercase flex-1 text-right">{stripList[selectedFrameIndex].color}</span>
                            </div>
                            <div className="space-y-3 pt-2">
                                <RangeControl label="Semente" val={stripList[selectedFrameIndex].seed} min={0} max={100} step={0.1} fn={v => updateFrame('seed', v)} />
                                <RangeControl label="Twist" val={stripList[selectedFrameIndex].twist} min={-3.14} max={3.14} step={0.1} fn={v => updateFrame('twist', v)} />
                                <RangeControl label="Scale" val={stripList[selectedFrameIndex].scale || 1.0} min={0.1} max={5.0} step={0.1} fn={v => updateFrame('scale', v)} />
                                <RangeControl label="Pos X" val={stripList[selectedFrameIndex].posX} min={-2} max={2} step={0.01} fn={v => updateFrame('posX', v)} />
                                <RangeControl label="Pos Y" val={stripList[selectedFrameIndex].posY} min={-2} max={2} step={0.01} fn={v => updateFrame('posY', v)} />
                            </div>
                        </div>
                        <div className="p-4 border-t border-zinc-800 hidden md:block"><button onClick={() => setSelectedFrameIndex(null)} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 rounded text-xs uppercase transition-all">Concluir</button></div>
                    </div>
                ) : (
                    // MODO GERADOR / PLAYBACK
                    <div className="flex flex-col h-full p-5">
                        <div className="mb-6 shrink-0">
                            <h3 className="text-xs font-bold text-cyan-500 uppercase mb-4 border-b border-zinc-800 pb-2 flex justify-between items-center">
                                <span>{stripList.length > 0 ? "Playback" : "Gerador"}</span> <i className="ri-robot-line"></i>
                            </h3>
                            
                            {!previewSettings ? (
                                <div className="text-xs text-zinc-500 italic p-6 text-center border border-dashed border-zinc-800 rounded bg-zinc-900/50">Vá para a aba <strong>Biblioteca</strong> e selecione um item.</div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-zinc-950 rounded border border-zinc-700 overflow-hidden relative group">
                                        <div className={`absolute top-2 left-2 z-10 text-[9px] font-bold px-1.5 rounded ${stripList.length > 0 ? 'bg-cyan-900/80 text-cyan-200' : 'bg-purple-900/80 text-purple-200'}`}>
                                            {stripList.length > 0 ? `PLAYBACK (${stripList.length}f)` : 'SIMULAÇÃO'}
                                        </div>
                                        <div className="w-full h-36 bg-black">
                                            <Canvas camera={{ position: [0, 0, 2] }} gl={{ preserveDrawingBuffer: true }}>
                                                <GeneratorPreview 
                                                    baseSettings={previewSettings} 
                                                    stripList={stripList} 
                                                    animMode={animMode} 
                                                    animSpeed={animSpeed} 
                                                    frameCount={frameCount}
                                                    isPlaying={isPlaying}
                                                    isLooping={isLooping}
                                                />
                                            </Canvas>
                                        </div>
                                        
                                        {/* CONTROLES DE PLAYBACK (Só aparecem se a lista existir) */}
                                        {stripList.length > 0 && (
                                            <div className="p-2 bg-zinc-900 border-t border-zinc-800 flex justify-center gap-3">
                                                <button onClick={() => setIsLooping(!isLooping)} className={`p-1.5 rounded hover:bg-zinc-800 ${isLooping ? 'text-green-400' : 'text-zinc-500'}`} title="Loop"><i className="ri-repeat-line"></i></button>
                                                <button onClick={() => setIsPlaying(!isPlaying)} className={`p-1.5 rounded hover:bg-zinc-800 text-white`} title={isPlaying ? "Pausar" : "Tocar"}><i className={isPlaying ? "ri-pause-fill" : "ri-play-fill"}></i></button>
                                            </div>
                                        )}
                                    </div>

                                    {/* MODO 1: CONFIGURAÇÃO (Se a lista estiver vazia) */}
                                    {stripList.length === 0 && (
                                        <>
                                            <div className="space-y-3 p-3 bg-zinc-900/50 rounded border border-zinc-800">
                                                <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Ajustes da Base</label>
                                                <div className="flex gap-2 items-center bg-zinc-950 p-1.5 rounded border border-zinc-700">
                                                    <input type="color" value={previewSettings.color} onChange={e => updatePreviewSetting('color', e.target.value)} className="h-5 w-6 cursor-pointer bg-transparent border-none p-0"/>
                                                    <span className="text-[10px] font-mono text-zinc-400 flex-1 text-right">{previewSettings.color}</span>
                                                </div>
                                                <RangeControl label="Tamanho" val={previewSettings.scale || 1.0} min={0.1} max={5.0} step={0.1} fn={v => updatePreviewSetting('scale', v)} />
                                                <RangeControl label="Intensidade" val={previewSettings.intensity} min={0.1} max={2.0} step={0.1} fn={v => updatePreviewSetting('intensity', v)} />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button onClick={() => setAnimMode('seed')} className={`p-2.5 rounded border text-xs flex items-center justify-center gap-2 transition-all ${animMode === 'seed' ? 'bg-cyan-900/30 border-cyan-600 text-cyan-400 font-bold' : 'bg-zinc-950 border-zinc-700 text-zinc-500 hover:text-zinc-300'}`}><i className="ri-blur-off-line"></i> Distorção</button>
                                                    <button onClick={() => setAnimMode('twist')} className={`p-2.5 rounded border text-xs flex items-center justify-center gap-2 transition-all ${animMode === 'twist' ? 'bg-purple-900/30 border-purple-600 text-purple-400 font-bold' : 'bg-zinc-950 border-zinc-700 text-zinc-500 hover:text-zinc-300'}`}><i className="ri-loop-right-line"></i> Rotação</button>
                                                </div>
                                                <NumberStepper label={animMode === 'twist' ? 'Voltas' : 'Variação'} value={animSpeed} onChange={setAnimSpeed} min={0.1} max={10.0} step={0.1} format={(v) => `${v.toFixed(1)}x`} />
                                                <NumberStepper label="Frames" value={frameCount} onChange={setFrameCount} min={4} max={128} step={4} />
                                            </div>
                                            
                                            <button onClick={generateAnimation} className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white font-bold py-3 rounded text-xs uppercase shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mb-20 md:mb-0"><i className="ri-refresh-line text-lg"></i> Gerar</button>
                                        </>
                                    )}

                                    {/* MODO 2: PÓS-GERAÇÃO (Se a lista existir) */}
                                    {stripList.length > 0 && (
                                        <div className="flex flex-col gap-3">
                                            <div className="text-[10px] text-zinc-500 text-center bg-zinc-900/50 p-2 rounded border border-zinc-800 border-dashed">
                                                Modo de edição ativo.<br/>Clique nos frames para editar ou reordenar.
                                            </div>
                                            <button 
                                                onClick={resetGenerator} 
                                                className="w-full bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 text-red-400 font-bold py-3 rounded text-xs uppercase shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <i className="ri-delete-back-2-line text-lg"></i> Criar Novo / Resetar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* NAV MOBILE */}
            <div className="md:hidden fixed bottom-0 w-full bg-zinc-950 border-t border-zinc-800 flex justify-around items-center h-[60px] z-50 shadow-2xl pb-safe">
                <button onClick={() => setActiveTab('library')} className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'library' ? 'text-cyan-400' : 'text-zinc-500'}`}><i className="ri-stack-line text-xl"></i><span className="text-[10px] font-bold">Biblioteca</span></button>
                <button onClick={() => setActiveTab('preview')} className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'preview' ? 'text-purple-400' : 'text-zinc-500'}`}><i className="ri-film-line text-xl"></i><span className="text-[10px] font-bold">Preview</span></button>
                <button onClick={() => setActiveTab('generator')} className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'generator' ? 'text-cyan-400' : 'text-zinc-500'}`}><i className="ri-equalizer-line text-xl"></i><span className="text-[10px] font-bold">Ferramentas</span></button>
            </div>

            <div className="absolute top-0 left-0 w-px h-px overflow-hidden opacity-0 pointer-events-none"><Canvas frameloop="never" gl={{ preserveDrawingBuffer: true, alpha: true }} onCreated={({ gl, scene, camera }) => { exportSceneRef.current = { gl, scene, camera, materialRef: { current: null } }; }}><mesh><planeGeometry args={[4, 4]} /><glowMaterial ref={el => { if(exportSceneRef.current) exportSceneRef.current.materialRef.current = el; }} /></mesh></Canvas></div>
        </div>
    );
};

export default SpritesheetScreen;