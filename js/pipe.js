import { GAME_CONFIG } from './config.js';

// Pipe class for better management
export class Pipe {
    constructor(x, gapY, gapSize = GAME_CONFIG.CURRENT_PIPE_GAP, score = 0) {
        this.x = x;
        this.gapY = gapY;
        this.gapSize = gapSize;
        
        // Increase pipe width after score 50
        this.width = score >= GAME_CONFIG.PIPE_WIDTH_INCREASE_SCORE 
            ? GAME_CONFIG.PIPE_WIDTH * GAME_CONFIG.PIPE_WIDTH_INCREASE_RATE 
            : GAME_CONFIG.PIPE_WIDTH;
            
        this.scored = false;
        this.id = Date.now() + Math.random();
        
        this.createElements();
    }
    
    createElements() {
        // Top pipe
        this.topPipe = document.createElement('div');
        this.topPipe.className = 'pipe_sprite pipe_top spawning';
        this.topPipe.style.position = 'fixed';
        this.topPipe.style.left = this.x + 'px';
        this.topPipe.style.top = '0px';
        this.topPipe.style.width = this.width + 'px';
        this.topPipe.style.height = this.gapY + 'px';
        this.topPipe.style.zIndex = '50';
        document.body.appendChild(this.topPipe);
        
        // Bottom pipe
        this.bottomPipe = document.createElement('div');
        this.bottomPipe.className = 'pipe_sprite pipe_bottom spawning';
        this.bottomPipe.style.position = 'fixed';
        this.bottomPipe.style.left = this.x + 'px';
        this.bottomPipe.style.top = (this.gapY + this.gapSize) + 'px';
        this.bottomPipe.style.width = this.width + 'px';
        this.bottomPipe.style.height = (window.innerHeight - this.gapY - this.gapSize) + 'px';
        this.bottomPipe.style.zIndex = '50';
        document.body.appendChild(this.bottomPipe);
        
        // Remove spawning animation class after animation completes
        setTimeout(() => {
            this.topPipe.classList.remove('spawning');
            this.bottomPipe.classList.remove('spawning');
        }, 400);
    }
    
    update(moveSpeed) {
        this.x -= moveSpeed;
        this.topPipe.style.left = this.x + 'px';
        this.bottomPipe.style.left = this.x + 'px';
    }
    
    isOffScreen() {
        return this.x + this.width < 0;
    }
    
    checkCollision(charRect) {
        const pipeLeft = this.x;
        const pipeRight = this.x + this.width;
        const gapTop = this.gapY;
        const gapBottom = this.gapY + this.gapSize;
        
        // Add small collision padding to make collision detection more precise
        const collisionPadding = 5;
        
        // Check if character is within pipe's horizontal bounds (with padding)
        if (charRect.right > (pipeLeft + collisionPadding) && charRect.left < (pipeRight - collisionPadding)) {
            // Check if character is outside the gap (collision) with padding
            if (charRect.top < (gapTop - collisionPadding) || charRect.bottom > (gapBottom + collisionPadding)) {
                return true;
            }
        }
        return false;
    }
    
    checkScore(charRect) {
        if (!this.scored && charRect.left > this.x + this.width) {
            this.scored = true;
            return true;
        }
        return false;
    }
    
    handleResize() {
        // Update bottom pipe height on resize
        if (this.bottomPipe) {
            this.bottomPipe.style.height = (window.innerHeight - this.gapY - this.gapSize) + 'px';
        }
    }
    
    remove() {
        // Add fade-out animation before removal
        if (this.topPipe && this.topPipe.parentNode) {
            this.topPipe.style.transition = 'opacity 0.2s ease-out';
            this.topPipe.style.opacity = '0';
            setTimeout(() => {
                if (this.topPipe.parentNode) {
                    this.topPipe.parentNode.removeChild(this.topPipe);
                }
            }, 200);
        }
        if (this.bottomPipe && this.bottomPipe.parentNode) {
            this.bottomPipe.style.transition = 'opacity 0.2s ease-out';
            this.bottomPipe.style.opacity = '0';
            setTimeout(() => {
                if (this.bottomPipe.parentNode) {
                    this.bottomPipe.parentNode.removeChild(this.bottomPipe);
                }
            }, 200);
        }
    }
}