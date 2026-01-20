export interface GlowSettings {
    id: string;          // Identificador único da camada
    name: string;        // Nome (ex: Layer 1)
    visible: boolean;    // Se está visível ou oculta
    
    // Propriedades Visuais
    shapeMode: number;
    color: string;
    sizeX: number;
    sizeY: number;
    intensity: number;
    gain: number;
    distStr: number;
    freq: number;
    twist: number;
    seed: number;
    speed: number;
    ringRadius: number;
    ringWidth: number;
    ringOpacity: number;
    points: number;
    
    // Globais (geralmente iguais para todos, mas salvos por layer pra flexibilidade)
    pixelCount: number; 
    showGrid: boolean;
}