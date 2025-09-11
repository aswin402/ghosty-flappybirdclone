import { GAME_STATES } from './config.js';
import { toggleDebugMode } from './debug.js';

// Input handling system
export function setupInputHandlers(gameInstance) {
    // Enhanced keyboard event handlers
    document.addEventListener('keydown', (e) => {
        // Start/restart the game
        if (e.key === 'Enter' && gameInstance.gameState !== GAME_STATES.PLAYING) {
            gameInstance.startGame();
        }
        
        // Handle jump input during gameplay
        if ((e.key === 'ArrowUp' || e.key === ' ') && gameInstance.gameState === GAME_STATES.PLAYING) {
            e.preventDefault(); // Prevent page scrolling
            gameInstance.jump();
        }
        
        // Pause/unpause game
        if (e.key === 'p' || e.key === 'P') {
            if (gameInstance.gameState === GAME_STATES.PLAYING) {
                gameInstance.pauseGame();
            } else if (gameInstance.gameState === GAME_STATES.PAUSED) {
                gameInstance.resumeGame();
            }
        }
        
        // Debug mode toggle
        if (e.key === 'd' || e.key === 'D') {
            toggleDebugMode();
        }
    });

    // Handle key release for character animation
    document.addEventListener('keyup', (e) => {
        if ((e.key === 'ArrowUp' || e.key === ' ') && gameInstance.gameState === GAME_STATES.PLAYING) {
            gameInstance.charImg.src = 'assets/char.png';
        }
    });

    // Enhanced touch/click support for mobile
    document.addEventListener('click', (e) => {
        if (gameInstance.gameState === GAME_STATES.PLAYING) {
            e.preventDefault();
            gameInstance.jump();
        } else if (gameInstance.gameState !== GAME_STATES.PLAYING) {
            // Allow clicking to start game on mobile
            gameInstance.startGame();
        }
    });

    // Touch events for mobile
    document.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameInstance.gameState === GAME_STATES.PLAYING) {
            gameInstance.jump();
        } else if (gameInstance.gameState !== GAME_STATES.PLAYING) {
            gameInstance.startGame();
        }
    });

    // Prevent scrolling on mobile
    document.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });

    // Window resize handler
    window.addEventListener('resize', () => {
        gameInstance.handleResize();
    });
}