// src/MathHelper.ts

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

// Definições de Formas
export const SHAPE_MODES = {
    CENTER: 0,
    RING: 1,
    NEBULA: 2,
    STAR: 3,
    POLYGON: 4
};

// Valores padrão otimizados para cada forma
export const SHAPE_DEFAULTS = {
    [SHAPE_MODES.CENTER]: {
        intensity: 0.5, gain: 2.0, contrast: 1.0,
        ringRadius: 0.0, ringWidth: 0.0, ringOpacity: 0.0,
        distStr: 0.0, points: 0.0
    },
    [SHAPE_MODES.RING]: {
        intensity: 0.2, gain: 2.5, contrast: 1.2,
        ringRadius: 0.4, ringWidth: 0.05, ringOpacity: 1.0,
        distStr: 0.0, points: 0.0
    },
    [SHAPE_MODES.NEBULA]: {
        intensity: 0.8, gain: 1.5, contrast: 0.9,
        ringRadius: 0.0, ringWidth: 0.0, ringOpacity: 0.0,
        distStr: 1.0, freq: 4.0, points: 0.0
    },
    [SHAPE_MODES.STAR]: {
        intensity: 0.6, gain: 3.0, contrast: 1.5,
        ringRadius: 0.1, // Sharpness da estrela
        ringWidth: 0.0, ringOpacity: 0.0,
        distStr: 0.0, points: 5.0
    },
    [SHAPE_MODES.POLYGON]: {
        intensity: 0.3, gain: 2.0, contrast: 1.0,
        ringRadius: 0.4, // Tamanho
        ringWidth: 0.02, ringOpacity: 1.0,
        distStr: 0.0, points: 4.0 // Quadrado
    }
};