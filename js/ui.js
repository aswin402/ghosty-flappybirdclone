// UI and visual effects
export function createScoreParticles(char) {
    const particleCount = 8;
    const charRect = char.getBoundingClientRect();
    
    // Create main score particle with +1 text
    const mainParticle = document.createElement('div');
    mainParticle.className = 'score-particle';
    mainParticle.style.left = (charRect.left + charRect.width / 2) + 'px';
    mainParticle.style.top = (charRect.top + charRect.height / 2) + 'px';
    
    document.body.appendChild(mainParticle);
    
    // Remove main particle after animation
    setTimeout(() => {
        if (mainParticle.parentNode) {
            mainParticle.parentNode.removeChild(mainParticle);
        }
    }, 1000);
    
    // Create additional sparkle particles
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = (charRect.left + charRect.width / 2) + 'px';
        particle.style.top = (charRect.top + charRect.height / 2) + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.backgroundColor = '#ffd700';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '150';
        particle.style.boxShadow = '0 0 8px #ffd700';
        particle.style.transform = 'scale(0)';
        
        document.body.appendChild(particle);
        
        // Animate particle with improved physics
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
        const velocity = 80 + Math.random() * 40;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity - 20; // Add upward bias
        
        let x = charRect.left + charRect.width / 2;
        let y = charRect.top + charRect.height / 2;
        let opacity = 1;
        let scale = 0;
        let gravity = 0.5;
        let currentVy = vy;
        
        const animateParticle = () => {
            x += vx * 0.016;
            y += currentVy * 0.016;
            currentVy += gravity; // Apply gravity
            opacity -= 0.015;
            scale = Math.min(scale + 0.05, 1);
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.opacity = opacity;
            particle.style.transform = `scale(${scale})`;
            
            if (opacity > 0) {
                requestAnimationFrame(animateParticle);
            } else {
                particle.remove();
            }
        };
        
        requestAnimationFrame(animateParticle);
    }
}

export function updateScoreDisplay(score, highScore, scoreVal, scoreTitle) {
    scoreVal.textContent = score;
    scoreTitle.innerHTML = `Score: ${score} | High: ${highScore}`;
    
    // Add score animation
    scoreVal.classList.add('new-high-score');
    setTimeout(() => {
        scoreVal.classList.remove('new-high-score');
    }, 500);
}

export function showGameOverMessage(score, highScore, msg, scoreTitle, charImg) {
    const isNewHighScore = score === highScore && score > 0;
    const highScoreText = isNewHighScore ? '<br><span style="color: gold; animation: pulse 1s infinite;">🎉 NEW HIGH SCORE! 🎉</span>' : '';
    
    // Add fade-in animation
    msg.classList.add('fade-in');
    msg.innerHTML = `
        <div style="font-size: 1.5em; margin-bottom: 10px;">💀 Game Over! 💀</div>
        <div>Score: <span style="color: #ffd700; font-weight: bold;">${score}</span></div>
        ${highScoreText}
        <div style="margin-top: 10px;">High Score: <span style="color: #68d391;">${highScore}</span></div>
        <div style="margin-top: 15px; font-size: 0.9em; opacity: 0.8;">
            <span style="display: block;">🎮 Press Enter to Restart</span>
            <span style="display: block; margin-top: 5px;">📱 Tap to Restart (Mobile)</span>
        </div>
    `;
    msg.style.left = '50vw';
    msg.classList.add('messageStyle');
    
    // Update score display with animation
    scoreTitle.innerHTML = `Final Score: ${score} | High: ${highScore}`;
    
    // Add celebration effect for new high score
    if (isNewHighScore) {
        createCelebrationEffect();
    }
}

export function showStartMessage(highScore, msg, scoreTitle) {
    msg.classList.add('fade-in', 'game-start');
    msg.innerHTML = `
        <div style="font-size: 1.8em; margin-bottom: 15px;">🎮 Flappy Bird 🎮</div>
        <div style="margin-bottom: 10px;">Ready to Play?</div>
        <div style="font-size: 0.9em; opacity: 0.9;">
            <span style="display: block;">🎮 Press Enter to Start</span>
            <span style="display: block; margin-top: 5px;">📱 Tap to Start (Mobile)</span>
            <span style="display: block; margin-top: 5px;">⏸️ Press P to Pause</span>
        </div>
        <div style="margin-top: 15px; color: #68d391;">
            High Score: <span style="color: #ffd700; font-weight: bold;">${highScore}</span>
        </div>
    `;
    msg.style.left = '50vw';
    msg.classList.add('messageStyle');
    scoreTitle.innerHTML = `High Score: ${highScore}`;
}

export function showPauseMessage(msg) {
    msg.classList.add('fade-in');
    msg.innerHTML = `
        <div style="font-size: 1.5em; margin-bottom: 10px;">⏸️ Game Paused ⏸️</div>
        <div style="font-size: 0.9em; opacity: 0.9;">
            <span style="display: block;">🎮 Press P to Resume</span>
            <span style="display: block; margin-top: 5px;">📱 Tap to Resume (Mobile)</span>
        </div>
    `;
    msg.style.left = '50vw';
    msg.classList.add('messageStyle');
    
    // Add pause indicator
    const pauseIndicator = document.createElement('div');
    pauseIndicator.className = 'pause-indicator';
    pauseIndicator.innerHTML = '⏸️';
    pauseIndicator.id = 'pause-indicator';
    document.body.appendChild(pauseIndicator);
}

export function hidePauseMessage(msg) {
    msg.classList.add('fade-out');
    setTimeout(() => {
        msg.innerHTML = '';
        msg.classList.remove('messageStyle', 'fade-in', 'fade-out');
    }, 300);
    
    // Remove pause indicator
    const pauseIndicator = document.getElementById('pause-indicator');
    if (pauseIndicator) {
        pauseIndicator.remove();
    }
}

// Create celebration effect for new high scores
function createCelebrationEffect() {
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = '-10px';
        particle.style.width = (Math.random() * 8 + 4) + 'px';
        particle.style.height = particle.style.width;
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '200';
        particle.style.boxShadow = `0 0 10px ${particle.style.backgroundColor}`;
        
        document.body.appendChild(particle);
        
        // Animate confetti
        let y = -10;
        let x = parseFloat(particle.style.left);
        let rotation = 0;
        const fallSpeed = Math.random() * 3 + 2;
        const rotationSpeed = (Math.random() - 0.5) * 10;
        const drift = (Math.random() - 0.5) * 2;
        
        const animateConfetti = () => {
            y += fallSpeed;
            x += drift;
            rotation += rotationSpeed;
            
            particle.style.top = y + 'px';
            particle.style.left = x + 'px';
            particle.style.transform = `rotate(${rotation}deg)`;
            
            if (y < window.innerHeight + 20) {
                requestAnimationFrame(animateConfetti);
            } else {
                particle.remove();
            }
        };
        
        // Stagger the animation start
        setTimeout(() => {
            requestAnimationFrame(animateConfetti);
        }, Math.random() * 1000);
    }
}