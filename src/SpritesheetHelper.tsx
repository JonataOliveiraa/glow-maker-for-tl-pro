import * as THREE from 'three';

const waitForNextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

function saveRendererState(gl, camera) {
    const originalSize = new THREE.Vector2();
    gl.getSize(originalSize);
    return {
        originalSize,
        originalPixelRatio: gl.getPixelRatio(),
        originalAspect: camera.aspect,
        originalScissor: gl.getScissorTest(),
    };
}

function restoreRendererState(gl, camera, state) {
    gl.setPixelRatio(state.originalPixelRatio);
    gl.setSize(state.originalSize.x, state.originalSize.y);
    gl.setScissorTest(state.originalScissor);
    camera.aspect = state.originalAspect;
    camera.updateProjectionMatrix();
}

// ATUALIZADO: Aceita customName
export async function downloadSingleFrame(gl, scene, camera, materialRef, pixelCount, customName = "") {
    if (!gl || !materialRef.current) return;
    
    const targetSize = pixelCount > 0 ? pixelCount : 1024;
    const state = saveRendererState(gl, camera);

    try {
        gl.setPixelRatio(1);
        gl.setSize(targetSize, targetSize);
        gl.setClearColor(0x000000, 0);
        gl.setScissorTest(false);
        camera.aspect = 1;
        camera.updateProjectionMatrix();

        materialRef.current.needsUpdate = true;
        gl.render(scene, camera);

        const dataURL = gl.domElement.toDataURL('image/png');
        const link = document.createElement('a');
        
        // Lógica de Nome
        const cleanName = customName.trim() || `vfx-glow`;
        link.download = `${cleanName}-${targetSize}px-${Date.now()}.png`;
        
        link.href = dataURL;
        link.click();
    } finally {
        restoreRendererState(gl, camera, state);
    }
}

// ATUALIZADO: Aceita customName
export async function generateStripSpritesheet(gl, scene, camera, materialRef, spriteList, customName = "") {
    if (spriteList.length === 0 || !materialRef.current) return;

    const firstSettings = spriteList[0];
    const targetSize = firstSettings.pixelCount > 0 ? firstSettings.pixelCount : 512;
    const width = Math.round(targetSize);
    const height = Math.round(targetSize);
    const totalFrames = spriteList.length;

    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = width;
    sheetCanvas.height = height * totalFrames;
    const ctx = sheetCanvas.getContext('2d');
    
    ctx.imageSmoothingEnabled = false; 

    const state = saveRendererState(gl, camera);

    try {
        const mat = materialRef.current;

        for (let i = 0; i < totalFrames; i++) {
            const settings = spriteList[i];

            const scale = settings.scale !== undefined ? settings.scale : 1.0;
            const sizeX = settings.sizeX !== undefined ? settings.sizeX : 1.0;
            const sizeY = settings.sizeY !== undefined ? settings.sizeY : 1.0;

            mat.uTime = 1.0; 
            mat.uPixelCount = settings.pixelCount;
            mat.uShowGrid = 0.0;
            mat.uPosition.set(settings.posX || 0, settings.posY || 0);
            mat.uScale.set(sizeX * scale * 1.3, sizeY * scale * 1.3);
            
            mat.uIntensity = settings.intensity;
            mat.uGain = settings.gain;
            mat.uContrast = settings.contrast !== undefined ? settings.contrast : 1.0;
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

            await waitForNextFrame();

            gl.setPixelRatio(1);
            gl.setSize(width, height);
            gl.setScissorTest(false);
            gl.setClearColor(0x000000, 0);
            camera.aspect = 1;
            camera.updateProjectionMatrix();

            gl.render(scene, camera);
            ctx.drawImage(gl.domElement, 0, i * height, width, height);
        }

        const link = document.createElement('a');
        
        // Lógica de Nome
        const cleanName = customName.trim() || `spritesheet`;
        link.download = `${cleanName}-${width}x${height * totalFrames}.png`;
        
        link.href = sheetCanvas.toDataURL('image/png');
        link.click();

    } finally {
        restoreRendererState(gl, camera, state);
    }
}