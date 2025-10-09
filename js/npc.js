import { GAME_CONFIG } from './config.js';

export class NPC {
    constructor(score) {
        // Always move right → left
        this.movingLeft = true;

        // Start off-screen on the RIGHT side
        this.x = window.innerWidth + 200;

        // Random vertical axis
        this.y = Math.random() * (window.innerHeight - 200) + 100;

        this.width = 120;
        this.height = 120;

        // Speed scaling with score + variation
        const speedVariation = (Math.random() - 0.5) * 0.4;
        this.speed = (GAME_CONFIG.NPC_SPEED + (score / 100)) * (1 + speedVariation);

        // Vertical oscillation (optional)
        this.verticalAmplitude = Math.random() * 30 + 10;
        this.verticalFrequency = Math.random() * 0.002 + 0.001;
        this.verticalOffset = Math.random() * Math.PI * 2;

        this.scored = false;
        this.id = Date.now() + Math.random();

        // Select NPC image
        this.npcImage = this.selectNPCImage(score);

        this.createElement();
    }

    selectNPCImage(score) {
        const npcImages = [
            'assets/npc-char/npc1.png',
            'assets/npc-char/npc-c.png',
            'assets/npc-char/npc-rare.png',
            'assets/npc-char/npc-legendary.png'
        ];
        
        if (score >= 1000) return npcImages[3];  // legendary
        if (score >= 500) return npcImages[2];   // rare
        if (score >= 50) return npcImages[1];    // npc-c
        return npcImages[0];                     // npc1
    }

    createElement() {
        this.element = document.createElement('img');
        this.element.src = this.npcImage;
        this.element.className = 'npc-character spawning';
        this.element.style.position = 'fixed';
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
        this.element.style.zIndex = '75';

        // No transform needed - using correct left-facing sprites

        document.body.appendChild(this.element);
        
        // Remove spawning animation class after animation completes
        setTimeout(() => {
            this.element.classList.remove('spawning');
        }, 500);
    }

    update(gameSpeed = 1) {
        // Always move left, affected by game speed
        this.x -= this.speed * (gameSpeed / GAME_CONFIG.PIPE_SPEED);
        this.element.style.left = this.x + 'px';

        // Add subtle vertical oscillation for more dynamic movement
        const time = Date.now() * this.verticalFrequency;
        const oscillation = Math.sin(time + this.verticalOffset) * this.verticalAmplitude;
        const newY = this.y + oscillation;
        
        // Ensure NPC stays within screen bounds
        const clampedY = Math.max(50, Math.min(newY, window.innerHeight - this.height - 50));
        this.element.style.top = clampedY + 'px';
    }

    isOffScreen() {
        // Remove when fully past left edge
        return this.x + this.width < -200;
    }

    checkCollision(charRect) {
        // Add collision padding to make collision detection more precise
        // This reduces the collision area to the actual visible parts of the NPC
        // Note: charRect is already adjusted with padding in game.js, so we only apply padding to NPC
        const collisionPadding = GAME_CONFIG.CURRENT_NPC_COLLISION_PADDING;
        
        // Get the actual DOM element position (same as debug visualization)
        const npcDOMRect = this.element.getBoundingClientRect();
        const npcRect = {
            left: npcDOMRect.left + collisionPadding,
            right: npcDOMRect.right - collisionPadding,
            top: npcDOMRect.top + collisionPadding,
            bottom: npcDOMRect.bottom - collisionPadding
        };
        
        // Use the character rect as-is (already adjusted in game.js)
        return (charRect.right > npcRect.left && 
                charRect.left < npcRect.right && 
                charRect.bottom > npcRect.top && 
                charRect.top < npcRect.bottom);
    }

    reset() {
        // Reset NPC for reuse in object pool
        this.x = window.innerWidth + 200;
        this.y = Math.random() * (window.innerHeight - 200) + 100;
        this.scored = false;
        this.verticalOffset = Math.random() * Math.PI * 2;
        
        // Update element position
        if (this.element) {
            this.element.style.left = this.x + 'px';
            this.element.style.top = this.y + 'px';
            this.element.style.display = 'block';
        }
    }

    handleResize() {
        // Ensure NPC stays within new screen bounds
        const maxY = window.innerHeight - this.height - 50;
        if (this.y > maxY) {
            this.y = maxY;
            this.element.style.top = this.y + 'px';
        }
    }

    remove() {
        // Add fade-out animation before removal
        if (this.element && this.element.parentNode) {
            this.element.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            this.element.style.opacity = '0';
            this.element.style.transform = 'scale(0.8)';
            setTimeout(() => {
                if (this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
            }, 300);
        }
    }
}
