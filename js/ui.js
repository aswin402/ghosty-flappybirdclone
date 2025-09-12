// UI and visual effects
export function createScoreParticles(char) {
    const particleCount = 5;
    const charRect = char.getBoundingClientRect();
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = (charRect.left + charRect.width / 2) + 'px';
        particle.style.top = (charRect.top + charRect.height / 2) + 'px';
        particle.style.width = '6px';
        particle.style.height = '6px';
        particle.style.backgroundColor = '#ffd700';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '150';
        particle.style.boxShadow = '0 0 10px #ffd700';
        
        document.body.appendChild(particle);
        
        // Animate particle
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 100 + Math.random() * 50;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let x = charRect.left + charRect.width / 2;
        let y = charRect.top + charRect.height / 2;
        let opacity = 1;
        
        const animateParticle = () => {
            x += vx * 0.016;
            y += vy * 0.016;
            opacity -= 0.02;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.opacity = opacity;
            
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
    const highScoreText = isNewHighScore ? '<br><span style="color: gold;">NEW HIGH SCORE!</span>' : '';
    
    msg.innerHTML = `Game Over!<br>Score: ${score}${highScoreText}<br>High Score: ${highScore}<br><br>Press Enter To Restart`;
    msg.style.left = '50vw';
    msg.classList.add('messageStyle');
    
    // Character is already hidden by collision detection with a brief delay to show kout.png
    
    // Update score display
    scoreTitle.innerHTML = `Final Score: ${score} | High: ${highScore}`;
}

export function showStartMessage(highScore, msg, scoreTitle) {
    msg.innerHTML = `Press Enter To Start<br><small>High Score: ${highScore}</small>`;
    msg.style.left = '50vw';
    msg.classList.add('messageStyle');
    scoreTitle.innerHTML = `High Score: ${highScore}`;
}

export function showPauseMessage(msg) {
    msg.innerHTML = 'Game Paused<br><small>Press P to Resume</small>';
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
    msg.innerHTML = '';
    msg.classList.remove('messageStyle');
    
    // Remove pause indicator
    const pauseIndicator = document.getElementById('pause-indicator');
    if (pauseIndicator) {
        pauseIndicator.remove();
    }
}