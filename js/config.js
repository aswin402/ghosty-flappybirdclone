// Enhanced device detection with caching for performance
let deviceInfo = null;

const getDeviceInfo = () => {
    if (deviceInfo) return deviceInfo;
    
    const ua = navigator.userAgent;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    const cores = navigator.hardwareConcurrency || 2;
    const memory = navigator.deviceMemory || 2;
    
    deviceInfo = {
        isMobile: width <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
        isTouch: ('ontouchstart' in window) || (navigator.maxTouchPoints > 0),
        isLowEnd: cores <= 2 || memory <= 2 || width <= 480,
        isVeryLowEnd: cores <= 1 || memory <= 1 || width <= 360,
        isHighDPI: pixelRatio >= 2,
        screenSize: width <= 360 ? 'xs' : width <= 480 ? 'sm' : width <= 768 ? 'md' : width <= 1024 ? 'lg' : 'xl',
        aspectRatio: width / height,
        isLandscape: width > height,
        supportsWebGL: !!window.WebGLRenderingContext,
        supportsWorkers: typeof Worker !== 'undefined'
    };
    
    return deviceInfo;
};

// Cached device detection functions
const isMobile = () => getDeviceInfo().isMobile;
const isTouchDevice = () => getDeviceInfo().isTouch;
const isLowPerformanceDevice = () => getDeviceInfo().isLowEnd;
const isVeryLowPerformanceDevice = () => getDeviceInfo().isVeryLowEnd;

// Performance-based frame rate targeting
const getTargetFPS = () => {
    const info = getDeviceInfo();
    if (info.isVeryLowEnd) return 30;
    if (info.isLowEnd) return 45;
    return 60;
};

// Dynamic quality settings
const getQualityLevel = () => {
    const info = getDeviceInfo();
    if (info.isVeryLowEnd) return 'low';
    if (info.isLowEnd) return 'medium';
    return 'high';
};

// Dynamic configuration state
const dynamicConfig = {
    enableParticles: null, // null means use default getter logic
    maxPipeHeight: null    // null means use default getter logic
};

// Game configuration with performance optimizations
export const GAME_CONFIG = {
    // Performance settings
    TARGET_FPS: getTargetFPS(),
    QUALITY_LEVEL: getQualityLevel(),
    FRAME_TIME: 1000 / getTargetFPS(),
    
    // Base game physics - adaptive based on device
    get PIPE_SPEED() {
        const info = getDeviceInfo();
        if (info.isVeryLowEnd) return 2.0;
        if (info.isMobile) return 2.5;
        return 3.0;
    },
    
    get GRAVITY() {
        const info = getDeviceInfo();
        if (info.isVeryLowEnd) return 0.4;
        if (info.isMobile) return 0.45;
        return 0.5;
    },
    
    get JUMP_FORCE() {
        const info = getDeviceInfo();
        if (info.isVeryLowEnd) return -6.8;
        if (info.isMobile) return -7.2;
        return -7.6;
    },
    
    // Pipe configuration - responsive
    get PIPE_GAP() {
        const info = getDeviceInfo();
        switch (info.screenSize) {
            case 'xs': return 320;
            case 'sm': return 340;
            case 'md': return 360;
            default: return 380;
        }
    },
    
    get PIPE_GAP_MOBILE() {
        const info = getDeviceInfo();
        if (info.isTouch) {
            switch (info.screenSize) {
                case 'xs': return 280;
                case 'sm': return 300;
                default: return 320;
            }
        }
        return 240;
    },
    
    PIPE_WIDTH: 80,
    PIPE_SPAWN_DISTANCE: 350,
    PIPE_SPAWN_DISTANCE_WITH_NPCS: 450,
    MIN_PIPE_HEIGHT: 100,
    
    get MAX_PIPE_HEIGHT() {
        return dynamicConfig.maxPipeHeight !== null ? dynamicConfig.maxPipeHeight : Math.max(window.innerHeight - 300, 200);
    },
    
    set MAX_PIPE_HEIGHT(value) {
        dynamicConfig.maxPipeHeight = value;
    },
    
    // Difficulty settings - performance aware
    DIFFICULTY_INCREASE_INTERVAL: 5,
    get MAX_DIFFICULTY() {
        const info = getDeviceInfo();
        if (info.isVeryLowEnd) return 1.8;
        if (info.isLowEnd) return 2.0;
        return 2.5;
    },
    
    // Dynamic pipe gap based on device
    get CURRENT_PIPE_GAP() {
        return isMobile() ? this.PIPE_GAP_MOBILE : this.PIPE_GAP;
    },
    
    // Feature configuration
    PIPE_WIDTH_INCREASE_SCORE: 50,
    PIPE_WIDTH_INCREASE_RATE: 1.5,
    
    // NPC configuration - performance optimized
    get NPC_SPAWN_SCORES() {
        const info = getDeviceInfo();
        if (info.isVeryLowEnd) return [20, 100]; // Spawn later on very low-end devices
        if (info.isLowEnd) return [15, 75];
        return [10, 50];
    },
    
    get NPC_SPEED() {
        const info = getDeviceInfo();
        if (info.isVeryLowEnd) return 3.0;
        if (info.isMobile) return 3.5;
        return 4.0;
    },
    
    get NPC_SPAWN_INTERVAL() {
        const info = getDeviceInfo();
        if (info.isVeryLowEnd) return 360; // Much less frequent
        if (info.isLowEnd) return 240;
        return 180;
    },
    
    get NPC_COLLISION_PADDING() {
        const info = getDeviceInfo();
        return info.screenSize === 'xs' ? 40 : 35;
    },
    
    get NPC_COLLISION_PADDING_MOBILE() {
        const info = getDeviceInfo();
        if (info.isTouch) {
            switch (info.screenSize) {
                case 'xs': return 45;
                case 'sm': return 42;
                default: return 40;
            }
        }
        return 30;
    },
    
    // Dynamic collision padding based on device
    get CURRENT_NPC_COLLISION_PADDING() {
        return isMobile() ? this.NPC_COLLISION_PADDING_MOBILE : this.NPC_COLLISION_PADDING;
    },
    
    // Dynamic pipe spawn distance based on whether NPCs are active
    getCurrentPipeSpawnDistance(score) {
        return score >= this.NPC_SPAWN_SCORES[0] ? this.PIPE_SPAWN_DISTANCE_WITH_NPCS : this.PIPE_SPAWN_DISTANCE;
    },
    
    // Audio configuration - performance aware
    get MUSIC_CHANGE_SCORES() {
        const info = getDeviceInfo();
        if (info.isVeryLowEnd) return [300, 700, 1500]; // Less frequent changes
        return [200, 500, 1000];
    },
    
    // Background change scores - performance aware
    get BG_CHANGE_SCORES() {
        const info = getDeviceInfo();
        if (info.isVeryLowEnd) return [100, 400, 800, 1500]; // Less frequent changes
        return [50, 200, 500, 1000];
    },
    
    // Object pooling configuration
    PIPE_POOL_SIZE: 10,
    NPC_POOL_SIZE: 5,
    PARTICLE_POOL_SIZE: 20,
    
    // Collision detection optimization
    COLLISION_CHECK_INTERVAL: isVeryLowPerformanceDevice() ? 2 : 1, // Check every N frames
    
    // Animation settings
    get ENABLE_PARTICLES() {
        return dynamicConfig.enableParticles !== null ? dynamicConfig.enableParticles : (getQualityLevel() !== 'low');
    },
    
    set ENABLE_PARTICLES(value) {
        dynamicConfig.enableParticles = value;
    },
    
    get ENABLE_SHADOWS() {
        return getQualityLevel() === 'high';
    },
    
    get ENABLE_SMOOTH_ANIMATIONS() {
        return !isVeryLowPerformanceDevice();
    },
    
    // Object pooling configuration
    get PIPE_POOL_SIZE() {
        return isVeryLowPerformanceDevice() ? 6 : (isLowPerformanceDevice() ? 8 : 10);
    },
    
    get NPC_POOL_SIZE() {
        return isVeryLowPerformanceDevice() ? 3 : (isLowPerformanceDevice() ? 4 : 6);
    },
    
    get PARTICLE_POOL_SIZE() {
        return isVeryLowPerformanceDevice() ? 10 : (isLowPerformanceDevice() ? 30 : 50);
    },
    
    // Debug configuration
    ENABLE_DEBUG: false // Set to true for development
};

// Reset device info cache (call on resize/orientation change)
export const resetDeviceInfo = () => {
    deviceInfo = null;
};

// Reset dynamic configuration to use default getter logic
export const resetDynamicConfig = () => {
    dynamicConfig.enableParticles = null;
    dynamicConfig.maxPipeHeight = null;
};

// Export utility functions
export { 
    getDeviceInfo, 
    isMobile, 
    isTouchDevice, 
    isLowPerformanceDevice, 
    isVeryLowPerformanceDevice,
    getTargetFPS,
    getQualityLevel
};

// Game state management
export const GAME_STATES = {
    START: 'Start',
    PLAYING: 'Play',
    PAUSED: 'Paused',
    GAME_OVER: 'End'
};