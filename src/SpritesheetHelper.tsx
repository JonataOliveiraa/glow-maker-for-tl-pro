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

export async function downloadSingleFrame(gl, scene, camera, materialRef, pixelCount) {
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
        link.download = `vfx-glow-${targetSize}px-${Date.now()}.png`;
        link.href = dataURL;
        link.click();
    } finally {
        restoreRendererState(gl, camera, state);
    }
}

export async function generateStripSpritesheet(gl, scene, camera, materialRef, spriteList) {
    if (spriteList.length === 0 || !materialRef.current) return;

    const firstSettings = spriteList[0];
    const targetSize = firstSettings.pixelCount > 0 ? firstSettings.pixelCount : 512;
    const width = Math.round(targetSize);
    const height = Math.round(targetSize);
    const totalFrames = spriteList.length;

    // Canvas 2D Vertical
    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = width;
    sheetCanvas.height = height * totalFrames;
    const ctx = sheetCanvas.getContext('2d');
    
    // Desativa suavização para pixel art perfeito
    ctx.imageSmoothingEnabled = false; 

    const state = saveRendererState(gl, camera);

    try {
        const mat = materialRef.current;

        for (let i = 0; i < totalFrames; i++) {
            const settings = spriteList[i];

            // 1. Aplica Uniformes
            mat.uTime = 1.0; 
            mat.uPixelCount = settings.pixelCount;
            mat.uShowGrid = 0.0;
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

            // 2. Espera um frame (Evita travar navegador e permite atualização de textura)
            await waitForNextFrame();

            // 3. FORÇA O TAMANHO AGORA (Crucial: Sobrescreve qualquer resize automático do React)
            gl.setPixelRatio(1);
            gl.setSize(width, height);
            gl.setScissorTest(false);
            gl.setClearColor(0x000000, 0);
            camera.aspect = 1;
            camera.updateProjectionMatrix();

            // 4. Renderiza e Captura Imediatamente
            gl.render(scene, camera);
            ctx.drawImage(gl.domElement, 0, i * height, width, height);
        }

        const link = document.createElement('a');
        link.download = `spritesheet-strip-${width}x${height * totalFrames}-${Date.now()}.png`;
        link.href = sheetCanvas.toDataURL('image/png');
        link.click();

    } finally {
        restoreRendererState(gl, camera, state);
    }
}