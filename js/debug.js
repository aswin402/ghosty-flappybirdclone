// Debug functionality
import { GAME_CONFIG } from './config.js';

export let debugMode = false;

export function toggleDebugMode() {
    debugMode = !debugMode;
    console.log('Debug mode:', debugMode ? 'ON' : 'OFF');
}

export function debugDrawCollisionBoxes(char, pipes, npcs = []) {
    if (!debugMode) return;
    
    // Remove existing debug elements
    document.querySelectorAll('.debug-box').forEach(el => el.remove());
    
    // Draw character collision box (original)
    const charRect = char.getBoundingClientRect();
    const charDebug = document.createElement('div');
    charDebug.className = 'debug-box';
    charDebug.style.position = 'fixed';
    charDebug.style.left = charRect.left + 'px';
    charDebug.style.top = charRect.top + 'px';
    charDebug.style.width = charRect.width + 'px';
    charDebug.style.height = charRect.height + 'px';
    charDebug.style.border = '2px solid red';
    charDebug.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
    charDebug.style.pointerEvents = 'none';
    charDebug.style.zIndex = '200';
    document.body.appendChild(charDebug);
    
    // Draw adjusted character collision box (actual collision detection area used in game.js)
    const charCollisionPadding = 25; // This matches the padding used in game.js
    const adjustedCharDebug = document.createElement('div');
    adjustedCharDebug.className = 'debug-box';
    adjustedCharDebug.style.position = 'fixed';
    adjustedCharDebug.style.left = (charRect.left + charCollisionPadding) + 'px';
    adjustedCharDebug.style.top = (charRect.top + charCollisionPadding) + 'px';
    adjustedCharDebug.style.width = (charRect.width - charCollisionPadding * 2) + 'px';
    adjustedCharDebug.style.height = (charRect.height - charCollisionPadding * 2) + 'px';
    adjustedCharDebug.style.border = '2px solid yellow';
    adjustedCharDebug.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
    adjustedCharDebug.style.pointerEvents = 'none';
    adjustedCharDebug.style.zIndex = '201';
    document.body.appendChild(adjustedCharDebug);
    
    // Draw pipe collision boxes
    pipes.forEach(pipe => {
        const collisionPadding = 5;
        
        // Top pipe collision area (with padding)
        const topDebug = document.createElement('div');
        topDebug.className = 'debug-box';
        topDebug.style.position = 'fixed';
        topDebug.style.left = (pipe.x + collisionPadding) + 'px';
        topDebug.style.top = '0px';
        topDebug.style.width = (pipe.width - collisionPadding * 2) + 'px';
        topDebug.style.height = (pipe.gapY - collisionPadding) + 'px';
        topDebug.style.border = '2px solid blue';
        topDebug.style.backgroundColor = 'rgba(0, 0, 255, 0.1)';
        topDebug.style.pointerEvents = 'none';
        topDebug.style.zIndex = '200';
        document.body.appendChild(topDebug);
        
        // Bottom pipe collision area (with padding)
        const bottomDebug = document.createElement('div');
        bottomDebug.className = 'debug-box';
        bottomDebug.style.position = 'fixed';
        bottomDebug.style.left = (pipe.x + collisionPadding) + 'px';
        bottomDebug.style.top = (pipe.gapY + pipe.gapSize + collisionPadding) + 'px';
        bottomDebug.style.width = (pipe.width - collisionPadding * 2) + 'px';
        bottomDebug.style.height = (window.innerHeight - pipe.gapY - pipe.gapSize - collisionPadding) + 'px';
        bottomDebug.style.border = '2px solid blue';
        bottomDebug.style.backgroundColor = 'rgba(0, 0, 255, 0.1)';
        bottomDebug.style.pointerEvents = 'none';
        bottomDebug.style.zIndex = '200';
        document.body.appendChild(bottomDebug);
        
        // Draw gap area for reference
        const gapDebug = document.createElement('div');
        gapDebug.className = 'debug-box';
        gapDebug.style.position = 'fixed';
        gapDebug.style.left = pipe.x + 'px';
        gapDebug.style.top = pipe.gapY + 'px';
        gapDebug.style.width = pipe.width + 'px';
        gapDebug.style.height = pipe.gapSize + 'px';
        gapDebug.style.border = '2px solid green';
        gapDebug.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
        gapDebug.style.pointerEvents = 'none';
        gapDebug.style.zIndex = '199';
        document.body.appendChild(gapDebug);
    });
    
    // Draw NPC collision boxes
    npcs.forEach(npc => {
        // Get the actual DOM element position (like we do for character)
        const npcRect = npc.element.getBoundingClientRect();
        
        // Draw full NPC boundary (orange) - using actual DOM position
        const npcDebug = document.createElement('div');
        npcDebug.className = 'debug-box';
        npcDebug.style.position = 'fixed';
        npcDebug.style.left = npcRect.left + 'px';
        npcDebug.style.top = npcRect.top + 'px';
        npcDebug.style.width = npcRect.width + 'px';
        npcDebug.style.height = npcRect.height + 'px';
        npcDebug.style.border = '2px solid orange';
        npcDebug.style.backgroundColor = 'rgba(255, 165, 0, 0.1)';
        npcDebug.style.pointerEvents = 'none';
        npcDebug.style.zIndex = '200';
        document.body.appendChild(npcDebug);
        
        // Draw actual collision area (purple/magenta) - smaller area with padding
        const collisionPadding = GAME_CONFIG.CURRENT_NPC_COLLISION_PADDING;
        const npcCollisionDebug = document.createElement('div');
        npcCollisionDebug.className = 'debug-box';
        npcCollisionDebug.style.position = 'fixed';
        npcCollisionDebug.style.left = (npcRect.left + collisionPadding) + 'px';
        npcCollisionDebug.style.top = (npcRect.top + collisionPadding) + 'px';
        npcCollisionDebug.style.width = (npcRect.width - collisionPadding * 2) + 'px';
        npcCollisionDebug.style.height = (npcRect.height - collisionPadding * 2) + 'px';
        npcCollisionDebug.style.border = '2px solid magenta';
        npcCollisionDebug.style.backgroundColor = 'rgba(255, 0, 255, 0.15)';
        npcCollisionDebug.style.pointerEvents = 'none';
        npcCollisionDebug.style.zIndex = '201';
        document.body.appendChild(npcCollisionDebug);
    });
}

// Performance monitoring
let frameCount = 0;
let lastTime = performance.now();
export let fps = 60;

export function updateFPS(moveSpeed) {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        
        // Adjust game performance if needed
        if (fps < 30 && moveSpeed > 1) {
            console.log('Performance adjustment: reducing effects');
        }
    }
}