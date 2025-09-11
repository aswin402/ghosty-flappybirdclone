// Debug functionality
export let debugMode = false;

export function toggleDebugMode() {
    debugMode = !debugMode;
    console.log('Debug mode:', debugMode ? 'ON' : 'OFF');
}

export function debugDrawCollisionBoxes(char, pipes, npcs = []) {
    if (!debugMode) return;
    
    // Remove existing debug elements
    document.querySelectorAll('.debug-box').forEach(el => el.remove());
    
    // Draw character collision box
    const charRect = char.getBoundingClientRect();
    const charDebug = document.createElement('div');
    charDebug.className = 'debug-box';
    charDebug.style.position = 'fixed';
    charDebug.style.left = charRect.left + 'px';
    charDebug.style.top = charRect.top + 'px';
    charDebug.style.width = charRect.width + 'px';
    charDebug.style.height = charRect.height + 'px';
    charDebug.style.border = '2px solid red';
    charDebug.style.pointerEvents = 'none';
    charDebug.style.zIndex = '200';
    document.body.appendChild(charDebug);
    
    // Draw pipe collision boxes
    pipes.forEach(pipe => {
        const topDebug = document.createElement('div');
        topDebug.className = 'debug-box';
        topDebug.style.position = 'fixed';
        topDebug.style.left = pipe.x + 'px';
        topDebug.style.top = '0px';
        topDebug.style.width = pipe.width + 'px';
        topDebug.style.height = pipe.gapY + 'px';
        topDebug.style.border = '2px solid blue';
        topDebug.style.pointerEvents = 'none';
        topDebug.style.zIndex = '200';
        document.body.appendChild(topDebug);
        
        const bottomDebug = document.createElement('div');
        bottomDebug.className = 'debug-box';
        bottomDebug.style.position = 'fixed';
        bottomDebug.style.left = pipe.x + 'px';
        bottomDebug.style.top = (pipe.gapY + pipe.gapSize) + 'px';
        bottomDebug.style.width = pipe.width + 'px';
        bottomDebug.style.height = (window.innerHeight - pipe.gapY - pipe.gapSize) + 'px';
        bottomDebug.style.border = '2px solid blue';
        bottomDebug.style.pointerEvents = 'none';
        bottomDebug.style.zIndex = '200';
        document.body.appendChild(bottomDebug);
    });
    
    // Draw NPC collision boxes
    npcs.forEach(npc => {
        const npcDebug = document.createElement('div');
        npcDebug.className = 'debug-box';
        npcDebug.style.position = 'fixed';
        npcDebug.style.left = npc.x + 'px';
        npcDebug.style.top = npc.y + 'px';
        npcDebug.style.width = npc.width + 'px';
        npcDebug.style.height = npc.height + 'px';
        npcDebug.style.border = '2px solid orange';
        npcDebug.style.pointerEvents = 'none';
        npcDebug.style.zIndex = '200';
        document.body.appendChild(npcDebug);
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