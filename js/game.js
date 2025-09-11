import { GAME_CONFIG, GAME_STATES } from './config.js';
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
    stopBackgroundMusic 
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
        // Game variables
        this.moveSpeed = GAME_CONFIG.PIPE_SPEED;
        this.gravity = GAME_CONFIG.GRAVITY;
        this.currentDifficulty = 1;
        this.score = 0;
        this.highScore = localStorage.getItem('flappy_high_score') || 0;
        this.pipes = [];
        this.npcs = []; // Array to store NPC characters
        this.gameState = GAME_STATES.START;
        this.charDy = 0;
        this.pipeSpawnTimer = 0;
        this.npcSpawnTimer = 0;
        this.animationId = null;
        this.lastMusicScore = 0; // Track last score when music changed
        this.lastBgScore = 0; // Track last score when background changed

        // DOM elements
        this.char = document.querySelector('.char');
        this.charImg = document.getElementById('char-1');
        this.scoreVal = document.querySelector('.score-val');
        this.msg = document.querySelector('.msg');
        this.scoreTitle = document.querySelector('.score-title');
        this.bg = document.querySelector('.bg');
        this.bgRect = this.bg.getBoundingClientRect();

        this.initializeGame();
    }

    initializeGame() {
        this.charImg.style.display = 'block';
        showStartMessage(this.highScore, this.msg, this.scoreTitle);
        
        // Ensure character starts at correct position
        this.char.style.top = window.innerHeight * 0.4 + 'px';
        this.char.style.left = window.innerWidth * 0.3 + 'px';
        this.char.style.transform = 'translate(-50%, -50%)';
    }

    startGame() {
        this.resetGame();
        this.gameState = GAME_STATES.PLAYING;
        this.msg.innerHTML = '';
        this.msg.classList.remove('messageStyle');
        this.scoreTitle.innerHTML = `Score: 0 | High: ${this.highScore}`;
        
        // Start background music
        startBackgroundMusic();
        
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
        this.char.style.top = window.innerHeight * 0.4 + 'px';
        this.char.style.left = window.innerWidth * 0.3 + 'px';
        this.char.style.transform = 'translate(-50%, -50%)';
        
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
    }

    pauseGame() {
        if (this.gameState === GAME_STATES.PLAYING) {
            this.gameState = GAME_STATES.PAUSED;
            showPauseMessage(this.msg);
            stopBackgroundMusic();
            
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
        }
    }

    resumeGame() {
        if (this.gameState === GAME_STATES.PAUSED) {
            this.gameState = GAME_STATES.PLAYING;
            hidePauseMessage(this.msg);
            updateBackgroundMusic(this.score);
            this.startGameLoop();
        }
    }

    startGameLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.gameLoop();
    }

    gameLoop() {
        if (this.gameState !== GAME_STATES.PLAYING) return;
        
        // Update character physics
        this.updateCharacter();
        
        // Update pipes
        this.updatePipes();
        
        // Update NPCs
        this.updateNPCs();
        
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
        
        // Debug visualization
        debugDrawCollisionBoxes(this.char, this.pipes, this.npcs);
        
        // Continue game loop
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    updateCharacter() {
        // Apply gravity
        this.charDy += this.gravity;
        
        // Update position
        let currentTop = this.char.offsetTop;
        let newTop = currentTop + this.charDy;
        
        this.char.style.top = newTop + 'px';
        this.char.style.transform = 'translate(-50%, -50%)';
        
        // Check screen boundaries
        const charProps = this.char.getBoundingClientRect();
        if (charProps.top <= 0 || charProps.bottom >= window.innerHeight) {
            this.gameOver();
            return;
        }
    }

    updatePipes() {
        // Update existing pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.update(this.moveSpeed);
            
            // Remove off-screen pipes
            if (pipe.isOffScreen()) {
                pipe.remove();
                this.pipes.splice(i, 1);
            }
        }
    }

    spawnPipes() {
        this.pipeSpawnTimer++;
        
        // Spawn new pipe when timer reaches threshold
        if (this.pipeSpawnTimer >= GAME_CONFIG.PIPE_SPAWN_DISTANCE / this.moveSpeed) {
            this.pipeSpawnTimer = 0;
            
            // Calculate random gap position
            const minGapY = GAME_CONFIG.MIN_PIPE_HEIGHT;
            const maxGapY = window.innerHeight - GAME_CONFIG.PIPE_GAP - GAME_CONFIG.MIN_PIPE_HEIGHT;
            const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
            
            // Create new pipe with current score for width calculation
            const newPipe = new Pipe(window.innerWidth, gapY, GAME_CONFIG.PIPE_GAP, this.score);
            this.pipes.push(newPipe);
        }
    }

    checkCollisions() {
        const charRect = this.char.getBoundingClientRect();
        
        // Check pipe collisions
        for (const pipe of this.pipes) {
            // Check collision
            if (pipe.checkCollision(charRect)) {
                this.charImg.src = "assets/kout.png";
                this.gameOver();
                return;
            }
            
            // Check scoring
            if (pipe.checkScore(charRect)) {
                this.score++;
                updateScoreDisplay(this.score, this.highScore, this.scoreVal, this.scoreTitle);
                createScoreParticles(this.char);
                playSound(sound_point);
            }
        }
        
        // Check NPC collisions
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
        
        // Update high score
        this.updateHighScore();
        
        // Show game over message
        showGameOverMessage(this.score, this.highScore, this.msg, this.scoreTitle, this.charImg);
        
        // Play death sound and game over music
        playSound(sound_die);
        playGameOverMusic();
    }

  updateNPCs() {
    // Update existing NPCs
    for (let i = this.npcs.length - 1; i >= 0; i--) {
        const npc = this.npcs[i];
        npc.update(this.moveSpeed);
        
        // Remove off-screen NPCs
        if (npc.isOffScreen()) {
            npc.remove();
            this.npcs.splice(i, 1);
        }
    }
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
        
        // Reset character position if game is not playing
        if (this.gameState !== GAME_STATES.PLAYING) {
            this.char.style.top = window.innerHeight * 0.4 + 'px';
            this.char.style.left = window.innerWidth * 0.3 + 'px';
        }
    }
}