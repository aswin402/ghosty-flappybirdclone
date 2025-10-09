import { GAME_CONFIG, GAME_STATES, getDeviceInfo, getQualityLevel } from './config.js';
import { Pipe } from './pipe.js';
import { NPC } from './npc.js';
import { 
    sound_point, 
    sound_die, 
    sound_wing, 
    playSound, 
    startBackgroundMusic, 
    updateBackgroundMusic, 
    playGameOverMusic,
    stopBackgroundMusic,
    pauseBackgroundMusic,
    resumeBackgroundMusic 
} from './audio.js';
import { 
    createScoreParticles, 
    updateScoreDisplay, 
    showGameOverMessage, 
    showStartMessage,
    showPauseMessage,
    hidePauseMessage 
} from './ui.js';
import { debugDrawCollisionBoxes, updateFPS } from './debug.js';

export class Game {
    constructor() {
        // Performance monitoring
        this.deviceInfo = getDeviceInfo();
        this.qualityLevel = getQualityLevel();
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        this.lastFPSUpdate = performance.now();
        this.currentFPS = 60;
        this.deltaTime = 0;
        this.targetFrameTime = 1000 / GAME_CONFIG.TARGET_FPS;
        this.collisionCheckInterval = GAME_CONFIG.COLLISION_CHECK_INTERVAL;
        
        // Game variables
        this.moveSpeed = GAME_CONFIG.PIPE_SPEED;
        this.gravity = GAME_CONFIG.GRAVITY;
        this.currentDifficulty = 1;
        this.score = 0;
        this.highScore = localStorage.getItem('flappy_high_score') || 0;
        this.pipes = [];
        this.npcs = [];
        this.gameState = GAME_STATES.START;
        this.charDy = 0;
        this.pipeSpawnTimer = 0;
        this.npcSpawnTimer = 0;
        this.gameStartTime = 0; // Track when game started for grace period
        this.animationId = null;
        this.lastMusicScore = 0;
        this.lastBgScore = 0;

        // Object pools for better performance
        this.pipePool = [];
        this.npcPool = [];
        this.particlePool = [];
        
        // Cached DOM elements
        this.char = document.querySelector('.char');
        this.charImg = document.getElementById('char-1');
        this.scoreVal = document.querySelector('.score-val');
        this.msg = document.querySelector('.msg');
        this.scoreTitle = document.querySelector('.score-title');
        this.bg = document.querySelector('.bg');
        this.pauseButton = document.getElementById('pause-button');
        this.bgRect = this.bg.getBoundingClientRect();
        
        // Cached character rect for performance
        this.charRect = null;
        this.charRectUpdateCounter = 0;

        this.initializeGame();
        this.initializeObjectPools();
    }

    initializeGame() {
        this.charImg.style.display = 'block';
        showStartMessage(this.highScore, this.msg, this.scoreTitle);

        // Ensure character starts at correct position (more centered)
        this.char.style.top = window.innerHeight * 0.5 + 'px';
        this.char.style.left = window.innerWidth * 0.3 + 'px';
        this.char.style.transform = 'translate(-50%, -50%)';

        // Initialize character rect cache
        this.updateCharacterRect();

        // Hide pause button initially
        this.updatePauseButtonVisibility();
    }

    updatePauseButtonVisibility() {
        if (this.pauseButton && this.deviceInfo.isMobile) {
            if (this.gameState === GAME_STATES.PLAYING) {
                this.pauseButton.style.display = 'block';
                this.pauseButton.innerHTML = '⏸️';
            } else if (this.gameState === GAME_STATES.PAUSED) {
                this.pauseButton.style.display = 'block';
                this.pauseButton.innerHTML = '▶️';
            } else {
                this.pauseButton.style.display = 'none';
            }
        }
    }
    
    initializeObjectPools() {
        // Pre-create pipe objects for pooling
        for (let i = 0; i < GAME_CONFIG.PIPE_POOL_SIZE; i++) {
            this.pipePool.push(null); // Will be created on demand
        }
        
        // Pre-create NPC objects for pooling
        for (let i = 0; i < GAME_CONFIG.NPC_POOL_SIZE; i++) {
            this.npcPool.push(null); // Will be created on demand
        }
        
        // Pre-create particle objects for pooling (if particles are enabled)
        if (GAME_CONFIG.ENABLE_PARTICLES) {
            for (let i = 0; i < GAME_CONFIG.PARTICLE_POOL_SIZE; i++) {
                this.particlePool.push(null); // Will be created on demand
            }
        }
    }
    
    updateCharacterRect() {
        this.charRect = this.char.getBoundingClientRect();
        
        // Add collision padding for better gameplay
        const padding = this.deviceInfo.screenSize === 'xs' ? 30 : 25;
        this.charRect = {
            left: this.charRect.left + padding,
            right: this.charRect.right - padding,
            top: this.charRect.top + padding,
            bottom: this.charRect.bottom - padding
        };
    }

    startGame() {
        this.resetGame();
        this.gameState = GAME_STATES.PLAYING;
        this.gameStartTime = performance.now(); // Set game start time for grace period
        this.msg.innerHTML = '';
        this.msg.classList.remove('messageStyle');
        this.scoreTitle.innerHTML = `Score: 0 | High: ${this.highScore}`;

        // Start background music
        startBackgroundMusic();

        this.updatePauseButtonVisibility();
        this.startGameLoop();
    }

    resetGame() {
        // Clear all pipes
        this.pipes.forEach(pipe => pipe.remove());
        this.pipes = [];
        
        // Clear all NPCs
        this.npcs.forEach(npc => npc.remove());
        this.npcs = [];
        
        // Reset game variables
        this.score = 0;
        this.currentDifficulty = 1;
        this.moveSpeed = GAME_CONFIG.PIPE_SPEED;
        this.gravity = GAME_CONFIG.GRAVITY;
        this.charDy = 0;
        this.pipeSpawnTimer = 0;
        this.npcSpawnTimer = 0;
        this.lastMusicScore = 0;
        this.lastBgScore = 0;
        
        // Reset character position and appearance
        this.charImg.style.display = 'block';
        this.charImg.src = 'assets/char.png';
        this.char.style.top = window.innerHeight * 0.5 + 'px';
        this.char.style.left = window.innerWidth * 0.3 + 'px';
        this.char.style.transform = 'translate(-50%, -50%)';
        
        // Update character rect cache after position reset
        this.updateCharacterRect();
        
        // Reset background to default
        this.updateBackground(0);
        
        // Update UI
        this.scoreVal.innerHTML = '0';
        this.scoreTitle.innerHTML = `Score: 0 | High: ${this.highScore}`;
    }

    jump() {
        this.charDy = GAME_CONFIG.JUMP_FORCE;
        this.charImg.src = 'assets/char.png';
        playSound(sound_wing);
        
        // Add smooth jump animation
        this.addJumpAnimation();
    }

    addJumpAnimation() {
        // Remove any existing animation classes
        this.char.classList.remove('jumping', 'falling');
        
        // Add jumping animation
        this.char.classList.add('jumping');
        
        // Remove jumping class after animation
        setTimeout(() => {
            this.char.classList.remove('jumping');
            if (this.gameState === GAME_STATES.PLAYING) {
                this.char.classList.add('falling');
            }
        }, 150);
    }

    pauseGame() {
        if (this.gameState === GAME_STATES.PLAYING) {
            this.gameState = GAME_STATES.PAUSED;
            showPauseMessage(this.msg);
            pauseBackgroundMusic();

            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }

            this.updatePauseButtonVisibility();
        }
    }

    resumeGame() {
        if (this.gameState === GAME_STATES.PAUSED) {
            this.gameState = GAME_STATES.PLAYING;
            hidePauseMessage(this.msg);
            resumeBackgroundMusic();
            this.updatePauseButtonVisibility();
            this.startGameLoop();
        }
    }

    startGameLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        // Reset timing to avoid a huge first-frame delta after starting/restarting
        const now = performance.now();
        this.lastFrameTime = now;
        this.lastFPSUpdate = now;
        this.frameCount = 0;
        // Kick off the loop with a fresh RAF tick
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    gameLoop(currentTime = performance.now()) {
        if (this.gameState !== GAME_STATES.PLAYING) return;
        
        // Calculate delta time for smooth frame-independent movement
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // Performance monitoring
        this.frameCount++;
        if (currentTime - this.lastFPSUpdate >= 1000) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdate = currentTime;
            
            // Adjust quality based on performance
            this.adjustQualityBasedOnPerformance();
        }

        // Update character rect cache less frequently on low-end devices
        if (this.frameCount % this.collisionCheckInterval === 0) {
            this.updateCharacterRect();
        }
        
        // Update character physics
        this.updateCharacter(deltaTime);
        
        // Update pipes
        this.updatePipes(deltaTime);
        
        // Update NPCs
        this.updateNPCs(deltaTime);
        
        // Spawn new pipes
        this.spawnPipes();
        
        // Spawn new NPCs
        this.spawnNPCs();
        
        // Check collisions and scoring
        this.checkCollisions();
        
        // Update difficulty
        this.updateDifficulty();
        
        // Update music and background based on score
        this.updateGameElements();
        
        // Update performance monitoring
        updateFPS(this.moveSpeed);
        
        // Debug visualization (only on desktop for performance)
        if (GAME_CONFIG.ENABLE_DEBUG && !this.deviceInfo.isMobile) {
            debugDrawCollisionBoxes(this.char, this.pipes, this.npcs);
        }
        
        // Continue game loop
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    adjustQualityBasedOnPerformance() {
        const targetFPS = GAME_CONFIG.TARGET_FPS;
        
        if (this.currentFPS < targetFPS * 0.8) {
            // Performance is poor, reduce quality
            if (this.collisionCheckInterval < 4) {
                this.collisionCheckInterval++;
            }
            
            // Disable particles if enabled
            if (GAME_CONFIG.ENABLE_PARTICLES) {
                GAME_CONFIG.ENABLE_PARTICLES = false;
                this.clearParticles();
            }
        } else if (this.currentFPS > targetFPS * 0.95) {
            // Performance is good, can increase quality
            if (this.collisionCheckInterval > 1) {
                this.collisionCheckInterval--;
            }
        }
    }
    
    clearParticles() {
        // Clear any active particles
        this.particlePool.forEach(particle => {
            if (particle && particle.element && particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
        });
        this.particlePool = [];
    }

    updateCharacter(deltaTime = 16.67) {
        // Normalize delta time for consistent physics (60 FPS = 16.67ms)
        const timeMultiplier = deltaTime / 16.67;
        
        // Apply gravity with delta time
        this.charDy += this.gravity * timeMultiplier;
        
        // Update position
        let currentTop = this.char.offsetTop;
        let newTop = currentTop + (this.charDy * timeMultiplier);
        
        this.char.style.top = newTop + 'px';
        this.char.style.transform = 'translate(-50%, -50%)';
        
        // Add visual feedback for jumping/falling
        if (this.charDy < -2) {
            this.char.classList.add('jumping');
            this.char.classList.remove('falling');
        } else if (this.charDy > 2) {
            this.char.classList.add('falling');
            this.char.classList.remove('jumping');
        } else {
            this.char.classList.remove('jumping', 'falling');
        }
        
        // Check screen boundaries with some tolerance and grace period
        const charProps = this.char.getBoundingClientRect();
        const tolerance = 10; // Add some tolerance to prevent immediate game over
        const gracePeriod = 500; // 500ms grace period at game start
        const timeSinceStart = performance.now() - this.gameStartTime;
        
        if (timeSinceStart > gracePeriod && (charProps.top <= -tolerance || charProps.bottom >= window.innerHeight + tolerance)) {
            this.charImg.src = "assets/kout.png";
            this.gameOver();
            return;
        }
    }

    updatePipes(deltaTime = 16.67) {
        // Normalize delta time for consistent movement
        const timeMultiplier = deltaTime / 16.67;
        
        // Update existing pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.update(this.moveSpeed * timeMultiplier);
            
            // Remove off-screen pipes and return to pool
            if (pipe.isOffScreen()) {
                this.returnPipeToPool(pipe);
                this.pipes.splice(i, 1);
            }
        }
    }
    
    returnPipeToPool(pipe) {
        // Hide the pipe elements instead of resetting position
        if (pipe.topPipe) pipe.topPipe.style.display = 'none';
        if (pipe.bottomPipe) pipe.bottomPipe.style.display = 'none';
        
        // Return pipe to pool for reuse
        for (let i = 0; i < this.pipePool.length; i++) {
            if (this.pipePool[i] === null) {
                this.pipePool[i] = pipe;
                return;
            }
        }
        // If pool is full, just remove the pipe
        pipe.remove();
    }

    spawnPipes() {
        this.pipeSpawnTimer++;
        
        // Get current pipe spawn distance (increases when NPCs are active)
        const currentPipeSpawnDistance = GAME_CONFIG.getCurrentPipeSpawnDistance(this.score);
        
        // Spawn new pipe when timer reaches threshold
        if (this.pipeSpawnTimer >= currentPipeSpawnDistance / this.moveSpeed) {
            this.pipeSpawnTimer = 0;
            
            // Calculate random gap position using dynamic pipe gap
            const currentPipeGap = GAME_CONFIG.CURRENT_PIPE_GAP;
            const minGapY = GAME_CONFIG.MIN_PIPE_HEIGHT;
            const maxGapY = window.innerHeight - currentPipeGap - GAME_CONFIG.MIN_PIPE_HEIGHT;
            const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
            
            // Try to reuse pipe from pool
            let newPipe = null;
            for (let i = 0; i < this.pipePool.length; i++) {
                if (this.pipePool[i] !== null) {
                    newPipe = this.pipePool[i];
                    this.pipePool[i] = null;
                    newPipe.reset(window.innerWidth, gapY, currentPipeGap, this.score);
                    break;
                }
            }
            
            // If no pipe available in pool, create new one
            if (!newPipe) {
                newPipe = new Pipe(window.innerWidth, gapY, currentPipeGap, this.score);
            }
            
            this.pipes.push(newPipe);
        }
    }

    checkCollisions() {
        // Use cached character rect for better performance
        const charRect = this.charRect || this.char.getBoundingClientRect();
        
        // Check pipe collisions
        for (const pipe of this.pipes) {
            // Check collision with cached character rect (already has padding applied)
            if (pipe.checkCollision(charRect)) {
                this.charImg.src = "assets/kout.png";
                this.gameOver();
                return;
            }
            
            // Check scoring (use slightly larger rect for scoring to be fair)
            const scoringRect = {
                left: charRect.left - 10,
                right: charRect.right + 10,
                top: charRect.top - 10,
                bottom: charRect.bottom + 10
            };
            
            if (pipe.checkScore(scoringRect)) {
                this.score++;
                updateScoreDisplay(this.score, this.highScore, this.scoreVal, this.scoreTitle);
                
                // Create particles only if enabled for performance
                if (GAME_CONFIG.ENABLE_PARTICLES) {
                    createScoreParticles(this.char);
                }
                
                playSound(sound_point);
            }
        }
        
        // Check NPC collisions with cached character rect
        for (const npc of this.npcs) {
            if (npc.checkCollision(charRect)) {
                this.charImg.src = "assets/kout.png";
                this.gameOver();
                return;
            }
        }
    }

    updateDifficulty() {
        const newDifficulty = Math.min(
            1 + (Math.floor(this.score / GAME_CONFIG.DIFFICULTY_INCREASE_INTERVAL) * 0.2),
            GAME_CONFIG.MAX_DIFFICULTY
        );
        
        if (newDifficulty !== this.currentDifficulty) {
            this.currentDifficulty = newDifficulty;
            this.moveSpeed = GAME_CONFIG.PIPE_SPEED * this.currentDifficulty;
            this.gravity = GAME_CONFIG.GRAVITY * (1 + (this.currentDifficulty - 1) * 0.1);
        }
    }

    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('flappy_high_score', this.highScore);
        }
    }

    gameOver() {
        this.gameState = GAME_STATES.GAME_OVER;
        
        // Cancel animation loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Add game over shake animation
        this.char.classList.remove('jumping', 'falling');
        this.char.classList.add('game-over-shake');
        
        // Update high score
        this.updateHighScore();
        
        // Show game over message with delay for better UX
        setTimeout(() => {
            showGameOverMessage(this.score, this.highScore, this.msg, this.scoreTitle, this.charImg);
        }, 500);
        
        // Play death sound and game over music
        playSound(sound_die);
        playGameOverMusic();
    }

    updateNPCs(deltaTime = 16.67) {
        // Normalize delta time for consistent movement
        const timeMultiplier = deltaTime / 16.67;
        
        // Update existing NPCs
        for (let i = this.npcs.length - 1; i >= 0; i--) {
            const npc = this.npcs[i];
            npc.update(this.moveSpeed * timeMultiplier);
            
            // Remove off-screen NPCs and return to pool
            if (npc.isOffScreen()) {
                this.returnNPCToPool(npc);
                this.npcs.splice(i, 1);
            }
        }
    }
    
    returnNPCToPool(npc) {
        // Return NPC to pool for reuse
        npc.reset();
        for (let i = 0; i < this.npcPool.length; i++) {
            if (this.npcPool[i] === null) {
                this.npcPool[i] = npc;
                return;
            }
        }
        // If pool is full, just remove the NPC
        npc.remove();
    }

    spawnNPCs() {
        // Only spawn NPCs if score is high enough
        if (this.score < GAME_CONFIG.NPC_SPAWN_SCORES[0]) return;
        
        this.npcSpawnTimer++;
        
        // Determine how many NPCs should be active based on score
        let maxNPCs = 0;
        for (let i = 0; i < GAME_CONFIG.NPC_SPAWN_SCORES.length; i++) {
            if (this.score >= GAME_CONFIG.NPC_SPAWN_SCORES[i]) {
                maxNPCs = i + 1;
            }
        }
        
        // Spawn new NPC when timer reaches threshold and we haven't reached max
        if (this.npcSpawnTimer >= GAME_CONFIG.NPC_SPAWN_INTERVAL && this.npcs.length < maxNPCs) {
            this.npcSpawnTimer = 0;
            
            // Create new NPC (constructor no longer needs direction flag)
            const newNPC = new NPC(this.score);
            this.npcs.push(newNPC);
        }
    }
    
    updateGameElements() {
        // Update background music
        if (this.score !== this.lastMusicScore) {
            updateBackgroundMusic(this.score);
            this.lastMusicScore = this.score;
        }
        
        // Update background image
        if (this.shouldUpdateBackground()) {
            this.updateBackground(this.score);
            this.lastBgScore = this.score;
        }
    }
    
    shouldUpdateBackground() {
        for (const threshold of GAME_CONFIG.BG_CHANGE_SCORES) {
            if (this.score >= threshold && this.lastBgScore < threshold) {
                return true;
            }
        }
        return false;
    }
    
    updateBackground(score) {
        let bgImage = 'assets/bgimg.jpg'; // Default background
        
        if (score >= 1000) {
            bgImage = 'assets/bg-imgs/img1000.png';
        } else if (score >= 500) {
            bgImage = 'assets/bg-imgs/img500.png';
        } else if (score >= 200) {
            bgImage = 'assets/bg-imgs/img200.png';
        } else if (score >= 50) {
            bgImage = 'assets/bg-imgs/img50.png';
        }
        
        this.bg.style.backgroundImage = `url('${bgImage}')`;
    }

    handleResize() {
        // Update game configuration for new window size
        GAME_CONFIG.MAX_PIPE_HEIGHT = window.innerHeight - 300;
        
        // Update background rect for collision detection
        this.bgRect = this.bg.getBoundingClientRect();
        
        // Reset character position if game is not playing
        if (this.gameState !== GAME_STATES.PLAYING) {
            this.char.style.top = window.innerHeight * 0.5 + 'px';
            this.char.style.left = window.innerWidth * 0.3 + 'px';
        }
        
        // Adjust character position during gameplay to prevent going off-screen
        if (this.gameState === GAME_STATES.PLAYING) {
            const charRect = this.char.getBoundingClientRect();
            const maxTop = window.innerHeight - charRect.height;
            const currentTop = parseInt(this.char.style.top);
            
            if (currentTop > maxTop) {
                this.char.style.top = maxTop + 'px';
            }
        }
        
        // Update pipe positions if needed
        this.pipes.forEach(pipe => {
            pipe.handleResize();
        });
        
        // Update NPC positions if needed
        this.npcs.forEach(npc => {
            npc.handleResize();
        });
    }
}