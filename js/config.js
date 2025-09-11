// Game configuration
export const GAME_CONFIG = {
    PIPE_SPEED: 3,
    GRAVITY: 0.5,
    JUMP_FORCE: -7.6,
    PIPE_GAP: 380, // Increased from 180 for more vertical space
    PIPE_WIDTH: 80,
    PIPE_SPAWN_DISTANCE: 350, // Increased from 200 for more horizontal space
    MIN_PIPE_HEIGHT: 100,
    MAX_PIPE_HEIGHT: window.innerHeight - 300,
    DIFFICULTY_INCREASE_INTERVAL: 5, // Every 5 points
    MAX_DIFFICULTY: 2.5,
    
    // New features configuration
    PIPE_WIDTH_INCREASE_SCORE: 50, // Score threshold for pipe width increase
    PIPE_WIDTH_INCREASE_RATE: 1.5, // Multiplier for pipe width after score 50
    
    // NPC configuration
    NPC_SPAWN_SCORES: [10, 50], // Scores at which NPCs start spawning (max NPCs at score 50)
    NPC_SPEED: 4, // Base NPC movement speed
    NPC_SPAWN_INTERVAL: 180, // Frames between NPC spawns (reduced for more frequent spawning)
    
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