import { GAME_STATES } from './config.js';
import { toggleDebugMode } from './debug.js';

// Input handling system
export function setupInputHandlers(gameInstance) {
    let lastTouchTime = 0;
    let touchStartY = 0;
    
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

    // Enhanced touch/click support for mobile with debouncing
    document.addEventListener('click', (e) => {
        const currentTime = Date.now();
        if (currentTime - lastTouchTime < 100) return; // Debounce rapid clicks
        
        if (gameInstance.gameState === GAME_STATES.PLAYING) {
            e.preventDefault();
            gameInstance.jump();
            createTouchFeedback(e.clientX, e.clientY);
        } else if (gameInstance.gameState !== GAME_STATES.PLAYING) {
            gameInstance.startGame();
        }
        lastTouchTime = currentTime;
    });

    // Enhanced touch events for mobile with gesture detection
    document.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const currentTime = Date.now();
        if (currentTime - lastTouchTime < 100) return; // Debounce rapid touches
        
        const touch = e.touches[0];
        touchStartY = touch.clientY;
        
        if (gameInstance.gameState === GAME_STATES.PLAYING) {
            gameInstance.jump();
            createTouchFeedback(touch.clientX, touch.clientY);
        } else if (gameInstance.gameState !== GAME_STATES.PLAYING) {
            gameInstance.startGame();
        }
        lastTouchTime = currentTime;
    });

    // Handle touch gestures (swipe up for jump)
    document.addEventListener('touchend', (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const touchEndY = touch.clientY;
        const swipeDistance = touchStartY - touchEndY;
        
        // If swipe up is detected and game is playing, jump
        if (swipeDistance > 30 && gameInstance.gameState === GAME_STATES.PLAYING) {
            const currentTime = Date.now();
            if (currentTime - lastTouchTime > 100) { // Prevent double jumps
                gameInstance.jump();
                createTouchFeedback(touch.clientX, touch.clientY);
                lastTouchTime = currentTime;
            }
        }
    });

    // Prevent scrolling and zooming on mobile
    document.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });

    // Prevent double-tap zoom
    document.addEventListener('gesturestart', (e) => {
        e.preventDefault();
    });

    document.addEventListener('gesturechange', (e) => {
        e.preventDefault();
    });

    document.addEventListener('gestureend', (e) => {
        e.preventDefault();
    });

    // Enhanced window resize handler with debouncing
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            gameInstance.handleResize();
        }, 250);
    });

    // Handle orientation change on mobile
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            gameInstance.handleResize();
        }, 500); // Delay to ensure proper orientation change
    });
}

// Create visual touch feedback
function createTouchFeedback(x, y) {
    const feedback = document.createElement('div');
    feedback.className = 'touch-feedback';
    feedback.style.left = (x - 30) + 'px';
    feedback.style.top = (y - 30) + 'px';
    
    document.body.appendChild(feedback);
    
    // Remove the feedback element after animation
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 600);
}