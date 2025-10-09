import { GAME_STATES, resetDeviceInfo, getDeviceInfo } from './config.js';
import { toggleDebugMode } from './debug.js';

// Enhanced input handling system with performance optimizations
export function setupInputHandlers(gameInstance) {
    let lastTouchTime = 0;
    let touchStartY = 0;
    let touchStartX = 0;
    let isProcessingInput = false;
    
    // Debounce settings based on device performance
    const deviceInfo = getDeviceInfo();
    const debounceTime = deviceInfo.isVeryLowEnd ? 150 : deviceInfo.isLowEnd ? 120 : 100;
    const swipeThreshold = deviceInfo.screenSize === 'xs' ? 25 : 30;
    
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

    // Enhanced touch/click support with performance-aware debouncing
    document.addEventListener('click', (e) => {
        if (isProcessingInput) return;
        
        const currentTime = Date.now();
        if (currentTime - lastTouchTime < debounceTime) return;
        
        isProcessingInput = true;
        
        if (gameInstance.gameState === GAME_STATES.PLAYING) {
            e.preventDefault();
            gameInstance.jump();
            if (deviceInfo.qualityLevel !== 'low') {
                createTouchFeedback(e.clientX, e.clientY);
            }
        } else if (gameInstance.gameState !== GAME_STATES.PLAYING) {
            gameInstance.startGame();
        }
        
        lastTouchTime = currentTime;
        
        // Reset processing flag with minimal delay
        requestAnimationFrame(() => {
            isProcessingInput = false;
        });
    });

    // Enhanced touch events with performance optimizations
    document.addEventListener('touchstart', (e) => {
        e.preventDefault();
        
        if (isProcessingInput) return;
        
        const currentTime = Date.now();
        if (currentTime - lastTouchTime < debounceTime) return;
        
        const touch = e.touches[0];
        touchStartY = touch.clientY;
        touchStartX = touch.clientX;
        
        isProcessingInput = true;
        
        if (gameInstance.gameState === GAME_STATES.PLAYING) {
            gameInstance.jump();
            if (deviceInfo.qualityLevel !== 'low') {
                createTouchFeedback(touch.clientX, touch.clientY);
            }
        } else if (gameInstance.gameState !== GAME_STATES.PLAYING) {
            gameInstance.startGame();
        }
        
        lastTouchTime = currentTime;
        
        // Reset processing flag
        requestAnimationFrame(() => {
            isProcessingInput = false;
        });
    });

    // Enhanced gesture detection with performance considerations
    document.addEventListener('touchend', (e) => {
        e.preventDefault();
        
        if (isProcessingInput || gameInstance.gameState !== GAME_STATES.PLAYING) return;
        
        const touch = e.changedTouches[0];
        const touchEndY = touch.clientY;
        const touchEndX = touch.clientX;
        
        const swipeDistanceY = touchStartY - touchEndY;
        const swipeDistanceX = Math.abs(touchStartX - touchEndX);
        
        // Enhanced swipe detection - vertical swipe with minimal horizontal movement
        if (swipeDistanceY > swipeThreshold && swipeDistanceX < swipeThreshold * 2) {
            const currentTime = Date.now();
            if (currentTime - lastTouchTime > debounceTime) {
                isProcessingInput = true;
                gameInstance.jump();
                
                if (deviceInfo.qualityLevel !== 'low') {
                    createTouchFeedback(touch.clientX, touch.clientY);
                }
                
                lastTouchTime = currentTime;
                
                requestAnimationFrame(() => {
                    isProcessingInput = false;
                });
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

    // Enhanced window resize handler with performance optimizations
    let resizeTimeout;
    let orientationTimeout;
    
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resetDeviceInfo(); // Reset cached device info
            gameInstance.handleResize();
        }, deviceInfo.isLowEnd ? 400 : 250);
    });

    // Enhanced orientation change handling
    window.addEventListener('orientationchange', () => {
        clearTimeout(orientationTimeout);
        
        // Prevent screen flicker during orientation change
        document.body.style.opacity = '0.8';
        
        orientationTimeout = setTimeout(() => {
            resetDeviceInfo(); // Reset cached device info
            gameInstance.handleResize();
            
            // Restore opacity
            document.body.style.opacity = '1';
        }, deviceInfo.isLowEnd ? 800 : 500);
    });
    
    // Handle visibility change for performance
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && gameInstance.gameState === GAME_STATES.PLAYING) {
            gameInstance.pauseGame();
        }
    });

    // Handle pause button clicks for mobile
    const pauseButton = document.getElementById('pause-button');
    if (pauseButton) {
        pauseButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent triggering other click handlers

            if (gameInstance.gameState === GAME_STATES.PLAYING) {
                gameInstance.pauseGame();
            } else if (gameInstance.gameState === GAME_STATES.PAUSED) {
                gameInstance.resumeGame();
            }
        });
    }
}

// Enhanced touch feedback with performance optimizations
function createTouchFeedback(x, y) {
    // Skip on very low-end devices
    const deviceInfo = getDeviceInfo();
    if (deviceInfo.isVeryLowEnd) return;
    
    const feedback = document.createElement('div');
    feedback.className = 'touch-feedback';
    feedback.style.left = (x - 30) + 'px';
    feedback.style.top = (y - 30) + 'px';
    feedback.style.pointerEvents = 'none';
    
    document.body.appendChild(feedback);
    
    // Use requestAnimationFrame for better performance
    const animationDuration = deviceInfo.isLowEnd ? 400 : 600;
    
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.style.opacity = '0';
            feedback.style.transform = 'scale(0.5)';
            
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 100);
        }
    }, animationDuration - 100);
}