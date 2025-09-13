// Enhanced mobile detection utility
const isMobile = () => {
    return window.innerWidth <= 768 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0);
};

// Touch device detection
const isTouchDevice = () => {
    return ('ontouchstart' in window) || 
           (navigator.maxTouchPoints > 0) || 
           (navigator.msMaxTouchPoints > 0);
};

// Performance detection
const isLowPerformanceDevice = () => {
    return navigator.hardwareConcurrency <= 2 || 
           window.innerWidth <= 480 ||
           /Android.*Chrome\/[0-5][0-9]/i.test(navigator.userAgent);
};

// Game configuration
export const GAME_CONFIG = {
    // Base game physics
    PIPE_SPEED: isMobile() ? 2.5 : 3, // Slightly slower on mobile
    GRAVITY: isMobile() ? 0.45 : 0.5, // Slightly less gravity on mobile
    JUMP_FORCE: isMobile() ? -7.2 : -7.6, // Slightly less jump force on mobile
    
    // Pipe configuration
    PIPE_GAP: 380, // Desktop gap - Increased from 180 for more vertical space
    PIPE_GAP_MOBILE: isTouchDevice() ? 280 : 240, // Larger gap for touch devices
    PIPE_WIDTH: 80,
    PIPE_SPAWN_DISTANCE: 350, // Base distance between pipe spawns
    PIPE_SPAWN_DISTANCE_WITH_NPCS: 450, // Increased distance when NPCs are active
    MIN_PIPE_HEIGHT: 100,
    MAX_PIPE_HEIGHT: window.innerHeight - 300,
    
    // Difficulty settings
    DIFFICULTY_INCREASE_INTERVAL: 5, // Every 5 points
    MAX_DIFFICULTY: isLowPerformanceDevice() ? 2.0 : 2.5, // Lower max difficulty on low-end devices
    
    // Dynamic pipe gap based on device
    get CURRENT_PIPE_GAP() {
        return isMobile() ? this.PIPE_GAP_MOBILE : this.PIPE_GAP;
    },
    
    // New features configuration
    PIPE_WIDTH_INCREASE_SCORE: 50, // Score threshold for pipe width increase
    PIPE_WIDTH_INCREASE_RATE: 1.5, // Multiplier for pipe width after score 50
    
    // NPC configuration
    NPC_SPAWN_SCORES: [10, 50], // Scores at which NPCs start spawning (max NPCs at score 50)
    NPC_SPEED: isMobile() ? 3.5 : 4, // Base NPC movement speed (slower on mobile)
    NPC_SPAWN_INTERVAL: isLowPerformanceDevice() ? 240 : 180, // Frames between NPC spawns (less frequent on low-end devices)
    NPC_COLLISION_PADDING: 35, // Padding to make NPC collision detection more precise (increased for smaller hitbox)
    NPC_COLLISION_PADDING_MOBILE: isTouchDevice() ? 40 : 30, // More forgiving collision on touch devices
    
    // Dynamic collision padding based on device
    get CURRENT_NPC_COLLISION_PADDING() {
        return isMobile() ? this.NPC_COLLISION_PADDING_MOBILE : this.NPC_COLLISION_PADDING;
    },
    
    // Dynamic pipe spawn distance based on whether NPCs are active
    getCurrentPipeSpawnDistance(score) {
        return score >= this.NPC_SPAWN_SCORES[0] ? this.PIPE_SPAWN_DISTANCE_WITH_NPCS : this.PIPE_SPAWN_DISTANCE;
    },
    
    // Music configuration
    MUSIC_CHANGE_SCORES: [200, 500, 1000], // Scores at which music changes
    
    // Background change scores
    BG_CHANGE_SCORES: [50, 200, 500, 1000]
};

// Game state management
export const GAME_STATES = {
    START: 'Start',
    PLAYING: 'Play',
    PAUSED: 'Paused',
    GAME_OVER: 'End'
};