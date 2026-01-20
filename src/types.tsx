export interface GlowSettings {
    // Transform
    posX: number;
    posY: number;
    scale: number;
    sizeX: number;
    sizeY: number;
    
    // Appearance
    shapeMode: number;
    color: string;
    intensity: number;
    gain: number;
    contrast: number;
    
    // Geometry
    ringRadius: number;
    ringWidth: number;
    ringOpacity: number;
    points: number;
    
    // FX
    distStr: number;
    freq: number;
    twist: number;
    seed: number;
    speed: number;
    isPaused: boolean; // NOVO
    
    // Global
    pixelCount: number;
    showGrid: boolean;
    canvasWidth: number;
}