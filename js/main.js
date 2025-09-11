// Main entry point
import { initializeSounds } from './audio.js';
import { Game } from './game.js';
import { setupInputHandlers } from './input.js';

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    // Initialize sound system
    initializeSounds();
    
    // Create game instance
    const game = new Game();
    
    // Setup input handlers
    setupInputHandlers(game);
    
    console.log('Flappy Bird Enhanced - Game Initialized');
    console.log('Controls: Enter (start), Space/Arrow Up (jump), P (pause), D (debug)');
});