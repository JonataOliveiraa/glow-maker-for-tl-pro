import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'; 
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Controls from './Controls';
import SpritesheetScreen from './SpritesheetScreen';
import { downloadSingleFrame } from './SpritesheetHelper';
import { GlowMaterial } from './GlowMaterial';
import { SHAPE_DEFAULTS, SHAPE_MODES } from './MathHelper';

// --- Scene Content ---
const SceneContent = ({ settings, setThreeRefs }) => {
  const materialRef = useRef();
  const { gl, scene, camera } = useThree();
  
  useEffect(() => {
     setThreeRefs({ gl, scene, camera, materialRef });
  }, [gl, scene, camera]);

  useFrame((state, delta) => {
    if (materialRef.current) {
        const mat = materialRef.current;
        if (!settings.isPaused) mat.uTime += delta * settings.speed;
        
        mat.uPixelCount = settings.pixelCount;
        mat.uShowGrid = settings.showGrid ? 1.0 : 0.0;
        mat.uPosition.set(settings.posX, settings.posY);
        mat.uScale.set(settings.sizeX * settings.scale, settings.sizeY * settings.scale);
        mat.uIntensity = settings.intensity;
        mat.uGain = settings.gain;
        mat.uContrast = settings.contrast;
        mat.uDistortionStr = settings.distStr;
        mat.uFrequency = settings.freq;
        mat.uShapeMode = settings.shapeMode;
        mat.uRingRadius = settings.ringRadius;
        mat.uRingWidth = settings.ringWidth;
        mat.uRingOpacity = settings.ringOpacity;
        mat.uPoints = settings.points;
        mat.uTwist = settings.twist;
        mat.uSeed = settings.seed; 
        mat.uColor = new THREE.Color(settings.color);
    }
  });

  return (
    <mesh>
      <planeGeometry args={[4, 4]} />
      <glowMaterial ref={materialRef} transparent={true} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
};

// --- EDITOR UI ---
const EditorUI = ({ settings, setSettings, onSavePreset, onDownload }) => {
  const navigate = useNavigate();
  const canvasDOMRef = useRef();
  const threeRefs = useRef(null);

  // Mouse Drag Logic
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      initialPos.current = { x: settings.posX, y: settings.posY };
  };

  const handlePointerMove = (e) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const sensitivity = 0.002; 
      setSettings(prev => ({
          ...prev,
          posX: initialPos.current.x + (dx * sensitivity),
          posY: initialPos.current.y - (dy * sensitivity) 
      }));
  };

  const handlePointerUp = () => { isDragging.current = false; };
  const resetPosition = () => setSettings(prev => ({ ...prev, posX: 0, posY: 0 }));
  const resetZoom = () => setSettings(prev => ({ ...prev, scale: 1.0 }));

  return (
    <div className="w-full h-full flex bg-[#050505] text-white overflow-hidden">
        {/* CANVAS */}
        <div className="flex-1 flex flex-col relative bg-[#0a0a0a]">
            <div className="h-12 bg-[#111] border-b border-gray-800 flex items-center px-6 justify-between z-10">
                <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
                    <span className="bg-[#1a1a1a] border border-gray-700 px-2 py-1 rounded text-cyan-500 font-bold">{settings.pixelCount}px</span>
                </div>
                <button onClick={() => navigate('/spritesheet')} className="text-xs bg-purple-900/30 text-purple-400 border border-purple-800 hover:bg-purple-900/50 px-3 py-1.5 rounded transition-all">
                    Ir para Spritesheet Studio ➔
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-8 overflow-hidden bg-image-pattern relative">
                 <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                     <button onClick={resetPosition} className="bg-[#111] border border-gray-700 p-2 rounded text-gray-400 hover:text-white"><i className="ri-focus-3-line"></i></button>
                     <button onClick={resetZoom} className="bg-[#111] border border-gray-700 p-2 rounded text-gray-400 hover:text-white"><i className="ri-zoom-in-line"></i></button>
                 </div>

                 <div 
                    className="relative shadow-2xl border border-gray-800 bg-black cursor-crosshair"
                    style={{ width: `${settings.canvasWidth}px`, maxWidth: '90%', maxHeight: '90%', aspectRatio: '1/1', backgroundImage: 'linear-gradient(45deg, #161616 25%, transparent 25%), linear-gradient(-45deg, #161616 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #161616 75%), linear-gradient(-45deg, transparent 75%, #161616 75%)', backgroundSize: '20px 20px' }}
                    onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}
                 >
                    <Canvas gl={{ alpha: true, preserveDrawingBuffer: true, antialias: false }} camera={{ position: [0, 0, 2] }} onCreated={({ gl }) => { canvasDOMRef.current = gl.domElement; }}>
                        <SceneContent settings={settings} setThreeRefs={(refs) => threeRefs.current = refs} />
                    </Canvas>
                 </div>
            </div>
        </div>

        {/* SIDEBAR */}
        <div className="w-[320px] h-full bg-[#0f0f0f] shadow-xl border-l border-gray-800 z-20 flex-shrink-0">
             <Controls 
                settings={settings} 
                setSettings={setSettings} 
                onSmartDownload={() => {
                    if(threeRefs.current) downloadSingleFrame(threeRefs.current.gl, threeRefs.current.scene, threeRefs.current.camera, threeRefs.current.materialRef, settings.pixelCount);
                }} 
                onSaveToLibrary={onSavePreset}
            />
        </div>
    </div>
  );
};

// --- APP ROOT ---
function App() {
  const [settings, setSettings] = useState({
      posX: 0.0, posY: 0.0, scale: 1.0, sizeX: 1.0, sizeY: 1.0,
      shapeMode: SHAPE_MODES.POLYGON, color: '#ffffff', intensity: 0.5, gain: 2.0, contrast: 1.0,
      ringRadius: 0.4, ringWidth: 0.05, ringOpacity: 0.5, points: 4.0,
      distStr: 0.0, freq: 3.0, twist: 0.0, seed: 0.0, speed: 1.0,
      isPaused: false, pixelCount: 64.0, showGrid: true, canvasWidth: 600
  });

  const [library, setLibrary] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vfx-library') || '[]'); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem('vfx-library', JSON.stringify(library)); }, [library]);

  const handleSaveToLibrary = () => {
      const preset = JSON.parse(JSON.stringify(settings));
      preset.id = Date.now(); 
      preset.name = `Glow ${library.length + 1}`;
      setLibrary([preset, ...library]);
      alert("Glow salvo na biblioteca!");
  };

  // --- NOVA FUNÇÃO DE DELETAR ---
  const handleDeleteFromLibrary = (id) => {
      if (window.confirm("Tem certeza que deseja apagar este glow da biblioteca?")) {
          setLibrary(prev => prev.filter(item => item.id !== id));
      }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#050505] text-white font-sans">
        <Routes>
            <Route path="/" element={<EditorUI settings={settings} setSettings={setSettings} onSavePreset={handleSaveToLibrary} />} />
            <Route path="/spritesheet" element={<SpritesheetScreen library={library} onDelete={handleDeleteFromLibrary} />} />
        </Routes>
    </div>
  );
}

export default App;