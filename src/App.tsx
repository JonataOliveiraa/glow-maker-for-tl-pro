import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'; 
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Controls from './Controls';
import SpritesheetScreen from './SpritesheetScreen';
import { downloadSingleFrame } from './SpritesheetHelper';
import { GlowMaterial } from './GlowMaterial';
import { SHAPE_MODES } from './MathHelper';

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
        mat.uFalloff = settings.falloff !== undefined ? settings.falloff : 1.0;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[4, 4]} />
      <glowMaterial ref={materialRef} transparent={true} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
};

// --- EDITOR UI (Home) ---
const EditorUI = ({ settings, setSettings, onSavePreset }) => {
  const navigate = useNavigate();
  const canvasDOMRef = useRef();
  const threeRefs = useRef(null);
  
  // ESTADO PARA O NOME PERSONALIZADO
  const [fileName, setFileName] = useState("");

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
      if (['BUTTON', 'INPUT', 'SELECT', 'LABEL'].includes(e.target.tagName)) return;
      isDragging.current = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      dragStart.current = { x: clientX, y: clientY };
      initialPos.current = { x: settings.posX, y: settings.posY };
  };

  const handlePointerMove = (e) => {
      if (!isDragging.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - dragStart.current.x;
      const dy = clientY - dragStart.current.y;
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

  // Função Wrapper para Download
  const handleDownload = () => {
      if(threeRefs.current) {
          downloadSingleFrame(
              threeRefs.current.gl, 
              threeRefs.current.scene, 
              threeRefs.current.camera, 
              threeRefs.current.materialRef, 
              settings.pixelCount,
              fileName // Passa o nome
          );
      }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col md:flex-row bg-zinc-950 text-zinc-100 overflow-hidden">
        {/* CANVAS AREA */}
        <div className="flex-1 flex flex-col relative bg-zinc-950 order-1">
            <div className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 justify-between z-10 flex-shrink-0">
                <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono">
                    <span className="bg-zinc-800 border border-zinc-700 px-2 py-1 rounded text-cyan-500 font-bold">{settings.pixelCount}px</span>
                </div>
                <button onClick={() => navigate('/spritesheet')} className="text-xs bg-violet-900/30 text-violet-300 border border-violet-800 hover:bg-violet-900/50 px-3 py-1.5 rounded transition-all flex items-center gap-1">
                    Studio <i className="ri-arrow-right-line"></i>
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-hidden bg-image-pattern relative touch-none">
                 <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                     <button onClick={resetPosition} className="bg-zinc-900/90 border border-zinc-700 p-2 rounded text-zinc-400 hover:text-white shadow-lg"><i className="ri-focus-3-line"></i></button>
                     <button onClick={resetZoom} className="bg-zinc-900/90 border border-zinc-700 p-2 rounded text-zinc-400 hover:text-white shadow-lg"><i className="ri-zoom-in-line"></i></button>
                 </div>

                 <div 
                    className="relative shadow-2xl border border-zinc-800 bg-black cursor-move group touch-none"
                    style={{ 
                        width: `${settings.canvasWidth}px`, 
                        maxWidth: '95%', maxHeight: '80%',
                        aspectRatio: '1/1', 
                        backgroundImage: 'linear-gradient(45deg, #18181b 25%, transparent 25%), linear-gradient(-45deg, #18181b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #18181b 75%), linear-gradient(-45deg, transparent 75%, #18181b 75%)', 
                        backgroundSize: '20px 20px' 
                    }}
                    onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}
                 >
                    <Canvas gl={{ alpha: true, preserveDrawingBuffer: true, antialias: false }} camera={{ position: [0, 0, 2] }} onCreated={({ gl }) => { canvasDOMRef.current = gl.domElement; }}>
                        <SceneContent settings={settings} setThreeRefs={(refs) => threeRefs.current = refs} />
                    </Canvas>
                 </div>
            </div>
        </div>

        {/* SIDEBAR */}
        <div className="w-full md:w-[420px] h-[40vh] md:h-full bg-zinc-900 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] md:shadow-xl border-t md:border-t-0 md:border-l border-zinc-800 z-20 flex-shrink-0 order-2 overflow-hidden">
             <Controls 
                settings={settings} 
                setSettings={setSettings} 
                onSmartDownload={handleDownload} 
                onSaveToLibrary={() => onSavePreset(fileName)} // Passa nome ao salvar
                fileName={fileName} // Passa estado
                setFileName={setFileName} // Passa setter
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
      falloff: 1.0, isPaused: false, pixelCount: 64.0, showGrid: true, canvasWidth: 600
  });

  const [library, setLibrary] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vfx-library') || '[]'); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem('vfx-library', JSON.stringify(library)); }, [library]);

  const handleSaveToLibrary = (customName) => {
      const preset = JSON.parse(JSON.stringify(settings));
      preset.id = Date.now(); 
      // Usa o nome personalizado ou gera um padrão
      preset.name = customName && customName.trim() !== "" ? customName : `Glow ${library.length + 1}`;
      setLibrary([preset, ...library]);
      alert("Salvo na biblioteca!");
  };

  const handleDeleteFromLibrary = (id) => {
      if (window.confirm("Apagar este item?")) {
          setLibrary(prev => prev.filter(item => item.id !== id));
      }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-zinc-950 text-zinc-100 font-sans">
        <Routes>
            <Route path="/" element={<EditorUI settings={settings} setSettings={setSettings} onSavePreset={handleSaveToLibrary} />} />
            <Route path="/spritesheet" element={<SpritesheetScreen library={library} onDelete={handleDeleteFromLibrary} />} />
        </Routes>
    </div>
  );
}

export default App;