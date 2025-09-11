// Sound effects system
export let sound_point, sound_die, sound_wing;
export let backgroundMusic, gameOverMusic;

const createSilentAudio = () => ({
    play: () => Promise.resolve(),
    pause: () => {},
    load: () => {},
    currentTime: 0,
    volume: 0,
    loop: false
});

// Background music tracks
const musicTracks = {
    start: 'assets/music/fromstartmusic.mp3',
    after200: 'assets/music/after200.mp3',
    after500: 'assets/music/after500.mp3',
    after1000: 'assets/music/after1000.mp3'
};

// Game over music tracks
const gameOverTracks = [
    'assets/gameOvermusic/gameOver-1.mp3',
    'assets/gameOvermusic/gameOver-2.mp3'
];

let currentBackgroundMusic = null;

// Enhanced sound system
export function initializeSounds() {
    try {
        // Try to load sound effects, fallback to silent if not found
        sound_point = createSoundWithFallback('sounds/point.mp3');
        sound_die = createSoundWithFallback('sounds/die.mp3');
        sound_wing = createSoundWithFallback('sounds/wing.mp3');

        // Initialize background music
        initializeBackgroundMusic();
        initializeGameOverMusic();

    } catch (error) {
        console.log('Sound system not available, continuing without audio');
        sound_point = createSilentAudio();
        sound_die = createSilentAudio();
        sound_wing = createSilentAudio();
        currentBackgroundMusic = createSilentAudio();
        gameOverMusic = createSilentAudio();
    }
}

function createSoundWithFallback(src) {
    try {
        const audio = new Audio(src);
        audio.volume = 0.3;
        audio.preload = 'auto';
        
        // Set up error handler to use silent fallback
        audio.addEventListener('error', () => {
            console.log(`Sound file ${src} not found, using silent fallback`);
            // Replace the audio object with silent version
            Object.setPrototypeOf(audio, createSilentAudio());
        });
        
        return audio;
    } catch (error) {
        console.log(`Failed to create audio for ${src}, using silent fallback`);
        return createSilentAudio();
    }
}

function initializeBackgroundMusic() {
    try {
        // Create audio objects for all background music tracks
        Object.keys(musicTracks).forEach(key => {
            const audio = new Audio(musicTracks[key]);
            audio.loop = true;
            audio.volume = 0.2; // Lower volume for background music
            audio.preload = 'auto';
            musicTracks[key] = audio;
        });
    } catch (error) {
        console.log('Background music not available');
    }
}

function initializeGameOverMusic() {
    try {
        gameOverMusic = gameOverTracks.map(track => {
            const audio = new Audio(track);
            audio.volume = 0.4;
            audio.preload = 'auto';
            return audio;
        });
    } catch (error) {
        console.log('Game over music not available');
        gameOverMusic = [createSilentAudio()];
    }
}

export function playSound(sound) {
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
}

export function startBackgroundMusic() {
    playBackgroundMusic('start');
}

export function playBackgroundMusic(trackKey) {
    // Stop current background music
    if (currentBackgroundMusic) {
        currentBackgroundMusic.pause();
        currentBackgroundMusic.currentTime = 0;
    }
    
    // Start new background music
    if (musicTracks[trackKey]) {
        currentBackgroundMusic = musicTracks[trackKey];
        currentBackgroundMusic.play().catch(() => {
            console.log('Could not play background music');
        });
    }
}

export function stopBackgroundMusic() {
    if (currentBackgroundMusic) {
        currentBackgroundMusic.pause();
        currentBackgroundMusic.currentTime = 0;
    }
}

export function updateBackgroundMusic(score) {
    let newTrack = 'start';
    
    if (score >= 1000) {
        newTrack = 'after1000';
    } else if (score >= 500) {
        newTrack = 'after500';
    } else if (score >= 200) {
        newTrack = 'after200';
    }
    
    // Only change if it's different from current track
    if (currentBackgroundMusic !== musicTracks[newTrack]) {
        playBackgroundMusic(newTrack);
    }
}

export function playGameOverMusic() {
    stopBackgroundMusic();
    
    // Play random game over music
    if (gameOverMusic && gameOverMusic.length > 0) {
        const randomIndex = Math.floor(Math.random() * gameOverMusic.length);
        const selectedTrack = gameOverMusic[randomIndex];
        selectedTrack.currentTime = 0;
        selectedTrack.play().catch(() => {
            console.log('Could not play game over music');
        });
    }
}