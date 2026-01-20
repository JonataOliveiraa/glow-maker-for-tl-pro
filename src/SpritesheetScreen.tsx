import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateStripSpritesheet } from './SpritesheetHelper';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { GlowMaterial } from './GlowMaterial';

// Componente Mini Preview para o Canvas
const PreviewScene = ({ settings }) => {
    const materialRef = useRef();
    return (
        <mesh>
            <planeGeometry args={[4, 4]} />
            <glowMaterial 
                ref={materialRef} 
                transparent={true} 
                blending={THREE.AdditiveBlending} 
                depthWrite={false}
                uTime={1.0}
                uPixelCount={settings.pixelCount}
                uShowGrid={0.0}
                uPosition={new THREE.Vector2(settings.posX, settings.posY)}
                uScale={new THREE.Vector2(settings.sizeX * settings.scale, settings.sizeY * settings.scale)}
                uIntensity={settings.intensity} uGain={settings.gain} uContrast={settings.contrast}
                uDistortionStr={settings.distStr} uFrequency={settings.freq}
                uShapeMode={settings.shapeMode}
                uRingRadius={settings.ringRadius} uRingWidth={settings.ringWidth} uRingOpacity={settings.ringOpacity}
                uPoints={settings.points} uTwist={settings.twist}
                uSeed={settings.seed} uColor={new THREE.Color(settings.color)}
            />
        </mesh>
    );
};

const SpritesheetScreen = ({ library, onDelete }) => {
    const navigate = useNavigate();
    const [selectedGlow, setSelectedGlow] = useState(null);
    const [stripList, setStripList] = useState([]); 
    const [frameCount, setFrameCount] = useState(8); 
    
    // Configurações de Animação
    const [animMode, setAnimMode] = useState('seed'); 
    const [animSpeed, setAnimSpeed] = useState(1.0); 

    const exportSceneRef = useRef(null);

    // --- AUTOMATION LOGIC ---
    const generateAnimation = () => {
        if (!selectedGlow) return;

        const newFrames = [];
        for (let i = 0; i < frameCount; i++) {
            const frameSettings = JSON.parse(JSON.stringify(selectedGlow));
            
            if (animMode === 'seed') {
                frameSettings.seed = (selectedGlow.seed || 0) + (i * animSpeed); 
            } else if (animMode === 'twist') {
                const totalRotation = Math.PI * 2 * animSpeed;
                const rotationStep = totalRotation / frameCount;
                frameSettings.twist = (selectedGlow.twist || 0) + (i * rotationStep);
            }
            
            newFrames.push(frameSettings);
        }
        setStripList(newFrames);
    };

    const handleExport = async () => {
        if (!exportSceneRef.current || stripList.length === 0) return;
        await generateStripSpritesheet(
            exportSceneRef.current.gl,
            exportSceneRef.current.scene,
            exportSceneRef.current.camera,
            exportSceneRef.current.materialRef,
            stripList
        );
    };

    return (
        <div className="w-full h-full flex bg-[#050505] text-white overflow-hidden font-sans">
            
            {/* --- SIDEBAR: BIBLIOTECA --- */}
            <div className="w-[300px] bg-[#0f0f0f] border-r border-gray-800 flex flex-col flex-shrink-0">
                <div className="p-4 border-b border-gray-800 bg-[#111] flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white flex items-center gap-1 text-xs font-bold uppercase tracking-wide transition-colors">
                        <i className="ri-arrow-left-line"></i> Editor
                    </button>
                    <span className="text-xs font-bold text-gray-500">BIBLIOTECA</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scroll">
                    {library.length === 0 && <div className="text-gray-600 text-xs p-4 text-center">Nenhum glow salvo.<br/>Crie um no Editor primeiro.</div>}
                    
                    {library.map((item) => (
                        <div 
                            key={item.id}
                            onClick={() => setSelectedGlow(item)}
                            className={`p-3 rounded border cursor-pointer transition-all flex items-center justify-between group relative
                                ${selectedGlow?.id === item.id ? 'bg-[#1a1a1a] border-cyan-600 shadow-md' : 'bg-[#0a0a0a] border-gray-800 hover:border-gray-600'}
                            `}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded bg-black border border-gray-700 overflow-hidden relative flex-shrink-0">
                                    <div className="absolute inset-0 opacity-50" style={{backgroundColor: item.color}}></div>
                                    <i className={`ri-${["focus-3", "donut-chart", "cloudy", "star", "shape-2"][item.shapeMode]}-line absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xs`}></i>
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs font-bold text-gray-200 truncate">{item.name}</div>
                                    <div className="text-[9px] text-gray-500 truncate">{item.pixelCount}px • {["Centro", "Anel", "Nebula", "Estrela", "Polígono"][item.shapeMode]}</div>
                                </div>
                            </div>

                            <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-900/30 text-gray-600 hover:text-red-500 transition-colors"
                                title="Excluir"
                            >
                                <i className="ri-delete-bin-line"></i>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- ÁREA CENTRAL: PREVIEW (TIRA VERTICAL) --- */}
            <div className="flex-1 flex flex-col bg-[#050505] relative">
                <div className="h-14 border-b border-gray-800 bg-[#0a0a0a] flex items-center justify-between px-6 flex-shrink-0">
                    <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                        <i className="ri-film-line text-purple-500"></i> Preview ({stripList.length} Frames)
                    </h2>
                    <button 
                        onClick={handleExport}
                        disabled={stripList.length === 0}
                        className={`px-4 py-2 rounded font-bold text-xs uppercase shadow-lg flex items-center gap-2 transition-all
                            ${stripList.length > 0 ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
                        `}
                    >
                        <i className="ri-download-2-line"></i> Baixar Tira
                    </button>
                </div>

                {/* Container de Scroll Centralizado */}
                <div className="flex-1 overflow-y-auto p-8 bg-image-pattern flex justify-center">
                    {stripList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full opacity-20 select-none">
                            <i className="ri-movie-line text-6xl mb-4"></i>
                            <p>Selecione um Glow e gere a animação</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center shadow-2xl bg-black border border-gray-800">
                            {/* LISTA DE FRAMES (COLADOS) */}
                            {stripList.map((frame, i) => (
                                <div key={i} className="flex relative group">
                                    
                                    {/* INFO LATERAL (Aparece ao lado para não poluir a tira) */}
                                    <div className="absolute right-full top-0 h-full flex items-center pr-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                        <div className="bg-gray-900/90 text-[10px] text-gray-300 px-2 py-1 rounded border border-gray-700 backdrop-blur-sm text-right">
                                            <div className="font-bold text-purple-400">FRAME {i + 1}</div>
                                            <div>Seed: {frame.seed.toFixed(2)}</div>
                                            <div>Rot: {(frame.twist || 0).toFixed(2)}</div>
                                        </div>
                                    </div>

                                    {/* O FRAME EM SI */}
                                    <div className="w-32 h-32 bg-black overflow-hidden relative">
                                        <Canvas gl={{ preserveDrawingBuffer: true }} camera={{ position: [0, 0, 2] }}>
                                            <PreviewScene settings={frame} />
                                        </Canvas>
                                        
                                        {/* Linha divisória sutil para visualizar onde corta (opcional, ajuda a ver a grade) */}
                                        <div className="absolute bottom-0 left-0 w-full h-px bg-white/5"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- SIDEBAR DIREITA: CONTROLES DE GERAÇÃO --- */}
            <div className="w-[280px] bg-[#0f0f0f] border-l border-gray-800 flex flex-col p-4 z-10 shadow-xl flex-shrink-0">
                <div className="mb-6">
                    <h3 className="text-xs font-bold text-cyan-500 uppercase mb-4 border-b border-gray-800 pb-2 flex justify-between items-center">
                        <span>Gerador</span>
                        <i className="ri-robot-line"></i>
                    </h3>
                    
                    {!selectedGlow ? (
                        <p className="text-xs text-gray-500 italic p-4 text-center border border-dashed border-gray-800 rounded">
                            Selecione um item da biblioteca.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-[#1a1a1a] p-3 rounded border border-gray-700">
                                <span className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Base</span>
                                <div className="text-sm font-bold text-white truncate">{selectedGlow.name}</div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold uppercase mb-1 block">Modo de Animação</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button 
                                            onClick={() => setAnimMode('seed')}
                                            className={`p-2 rounded border text-xs flex items-center justify-center gap-1 transition-all ${animMode === 'seed' ? 'bg-cyan-900/40 border-cyan-600 text-cyan-400' : 'bg-[#111] border-gray-700 text-gray-500 hover:text-gray-300'}`}
                                        >
                                            <i className="ri-blur-off-line"></i> Seed
                                        </button>
                                        <button 
                                            onClick={() => setAnimMode('twist')}
                                            className={`p-2 rounded border text-xs flex items-center justify-center gap-1 transition-all ${animMode === 'twist' ? 'bg-purple-900/40 border-purple-600 text-purple-400' : 'bg-[#111] border-gray-700 text-gray-500 hover:text-gray-300'}`}
                                        >
                                            <i className="ri-loop-right-line"></i> Twist
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold uppercase mb-1 block flex justify-between">
                                        <span>{animMode === 'twist' ? 'Voltas (Loops)' : 'Variação'}</span>
                                        <span className="text-cyan-500">{animSpeed.toFixed(1)}x</span>
                                    </label>
                                    <input 
                                        type="range" min="0.1" max="5.0" step="0.1"
                                        value={animSpeed} 
                                        onChange={(e) => setAnimSpeed(parseFloat(e.target.value))}
                                        className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-600 hover:accent-cyan-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold uppercase mb-1 block flex justify-between">
                                        <span>Frames</span>
                                        <span className="text-white">{frameCount}</span>
                                    </label>
                                    <input 
                                        type="range" min="4" max="64" step="4"
                                        value={frameCount} 
                                        onChange={(e) => setFrameCount(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-600 hover:accent-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="p-3 bg-[#161616] rounded border border-gray-800 text-[10px] text-gray-400 leading-relaxed">
                                <p className="mb-1 text-cyan-500 font-bold flex items-center gap-1"><i className="ri-lightbulb-line"></i> Info:</p>
                                {animMode === 'seed' ? (
                                    <p>Gera variações aleatórias. Velocidade alta = mudanças drásticas.</p>
                                ) : (
                                    <p>Gera rotação. <strong>1.0x</strong> = 1 volta completa (360º). Ideal para loops.</p>
                                )}
                            </div>

                            <button 
                                onClick={generateAnimation}
                                className="w-full bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 rounded text-xs uppercase shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <i className="ri-magic-line text-lg"></i> Gerar Frames
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- CANVAS OCULTO PARA EXPORTAÇÃO --- */}
            <div className="absolute top-0 left-0 w-px h-px overflow-hidden opacity-0 pointer-events-none">
                <Canvas
                    frameloop="never"
                    gl={{ preserveDrawingBuffer: true, alpha: true }}
                    onCreated={({ gl, scene, camera }) => {
                        exportSceneRef.current = { gl, scene, camera, materialRef: { current: null } };
                    }}
                >
                    <mesh>
                        <planeGeometry args={[4, 4]} />
                        <glowMaterial ref={el => { if(exportSceneRef.current) exportSceneRef.current.materialRef.current = el; }} />
                    </mesh>
                </Canvas>
            </div>

        </div>
    );
};

export default SpritesheetScreen;