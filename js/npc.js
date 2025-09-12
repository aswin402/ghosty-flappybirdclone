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
        this.element.className = 'npc-character';
        this.element.style.position = 'fixed';
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
        this.element.style.zIndex = '75';

        // No transform needed - using correct left-facing sprites

        document.body.appendChild(this.element);
    }

    update(gameSpeed = 1) {
        // Always move left, affected by game speed
        this.x -= this.speed * (gameSpeed / GAME_CONFIG.PIPE_SPEED);
        this.element.style.left = this.x + 'px';

        // Keep vertical position fixed (linear horizontal movement only)
        this.element.style.top = this.y + 'px';
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

    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}
