const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreValue = document.getElementById('scoreValue');
const finalScore = document.getElementById('finalScore');
const currentLevelDisplay = document.getElementById('currentLevel');
const finalLevelDisplay = document.getElementById('finalLevel');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const restartBtn = document.getElementById('restartBtn');
const changeLevelBtn = document.getElementById('changeLevelBtn');
const closeBtn = document.getElementById('closeBtn');
const levelButtons = document.querySelectorAll('.level-btn');

// Difficulty settings
const difficulties = {
    easy: {
        name: 'Easy',
        pipeGap: 220,
        pipeSpeed: 1.5,
        pipeInterval: 110,
        gravity: 0.4,
        jumpStrength: -8
    },
    medium: {
        name: 'Medium',
        pipeGap: 190,
        pipeSpeed: 2,
        pipeInterval: 95,
        gravity: 0.45,
        jumpStrength: -8.5
    },
    hard: {
        name: 'Hard',
        pipeGap: 160,
        pipeSpeed: 2.5,
        pipeInterval: 85,
        gravity: 0.5,
        jumpStrength: -9
    }
};

// Game variables
let currentDifficulty = 'easy';
let bird = {
    x: 80,
    y: 200,
    width: 34,
    height: 24,
    velocity: 0,
    gravity: 0.4,
    jumpStrength: -8
};

let pipes = [];
let score = 0;
let gameStarted = false;
let gameOver = false;
let frameCount = 0;

const PIPE_WIDTH = 60;

// Event listeners
canvas.addEventListener('click', jump);
restartBtn.addEventListener('click', restart);
changeLevelBtn.addEventListener('click', changeLevel);
closeBtn.addEventListener('click', closeGameOver);

levelButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const level = e.target.dataset.level;
        selectLevel(level);
    });
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        
        // If game over screen is visible, restart the game
        if (gameOver && !gameOverScreen.classList.contains('hidden')) {
            restart();
        } else {
            jump();
        }
    }
});

function selectLevel(level) {
    currentDifficulty = level;
    
    // Update UI
    levelButtons.forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-level="${level}"]`).classList.add('selected');
    
    // Update bird properties based on difficulty
    const diff = difficulties[level];
    bird.gravity = diff.gravity;
    bird.jumpStrength = diff.jumpStrength;
    
    // Update display
    currentLevelDisplay.textContent = diff.name;
    finalLevelDisplay.textContent = diff.name;
}

function jump() {
    if (!gameStarted) {
        startGame();
        return;
    }
    
    if (!gameOver) {
        bird.velocity = bird.jumpStrength;
    }
}

function startGame() {
    gameStarted = true;
    startScreen.classList.add('hidden');
    // Create first pipe closer to the bird for quicker gameplay
    createPipeAt(400); // Position first pipe at x=400 instead of canvas.width (800)
    gameLoop();
}

function restart() {
    bird.y = 200;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
    gameOver = false;
    gameStarted = false;
    gameOverScreen.classList.add('hidden');
    scoreValue.textContent = '0';
    
    // Apply current difficulty settings
    const diff = difficulties[currentDifficulty];
    bird.gravity = diff.gravity;
    bird.jumpStrength = diff.jumpStrength;
    
    startGame();
}

function changeLevel() {
    bird.y = 200;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
    gameOver = false;
    gameStarted = false;
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    scoreValue.textContent = '0';
}

function closeGameOver() {
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    bird.y = 200;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
    gameOver = false;
    gameStarted = false;
    scoreValue.textContent = '0';
}

function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    
    // Rotate bird based on velocity
    let rotation = Math.min(Math.max(bird.velocity * 2, -20), 90) * Math.PI / 180;
    ctx.rotate(rotation);
    
    // Draw bird body
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw bird outline
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(8, -5, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(10, -5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw beak
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(20, -2);
    ctx.lineTo(20, 2);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

function createPipe() {
    const diff = difficulties[currentDifficulty];
    const minHeight = 50;
    const maxHeight = canvas.height - diff.pipeGap - minHeight - 100;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + diff.pipeGap,
        scored: false
    });
}

function createPipeAt(xPosition) {
    const diff = difficulties[currentDifficulty];
    const minHeight = 50;
    const maxHeight = canvas.height - diff.pipeGap - minHeight - 100;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: xPosition,
        topHeight: topHeight,
        bottomY: topHeight + diff.pipeGap,
        scored: false
    });
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Draw top pipe
        ctx.fillStyle = '#228B22';
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        
        // Draw top pipe cap
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, PIPE_WIDTH + 10, 20);
        ctx.strokeRect(pipe.x - 5, pipe.topHeight - 20, PIPE_WIDTH + 10, 20);
        
        // Draw bottom pipe
        ctx.fillStyle = '#228B22';
        ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, canvas.height - pipe.bottomY);
        ctx.strokeRect(pipe.x, pipe.bottomY, PIPE_WIDTH, canvas.height - pipe.bottomY);
        
        // Draw bottom pipe cap
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(pipe.x - 5, pipe.bottomY, PIPE_WIDTH + 10, 20);
        ctx.strokeRect(pipe.x - 5, pipe.bottomY, PIPE_WIDTH + 10, 20);
    });
}

function updatePipes() {
    const diff = difficulties[currentDifficulty];
    
    // Create new pipes
    if (frameCount % diff.pipeInterval === 0) {
        createPipe();
    }
    
    // Update pipe positions
    pipes.forEach((pipe, index) => {
        pipe.x -= diff.pipeSpeed;
        
        // Remove off-screen pipes
        if (pipe.x + PIPE_WIDTH < 0) {
            pipes.splice(index, 1);
        }
        
        // Check for scoring
        if (!pipe.scored && pipe.x + PIPE_WIDTH < bird.x) {
            pipe.scored = true;
            score++;
            scoreValue.textContent = score;
        }
        
        // Check collision
        if (
            bird.x + bird.width > pipe.x &&
            bird.x < pipe.x + PIPE_WIDTH &&
            (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY)
        ) {
            endGame();
        }
    });
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // Check ground and ceiling collision
    if (bird.y + bird.height >= canvas.height - 100 || bird.y <= 0) {
        endGame();
    }
}

function endGame() {
    gameOver = true;
    finalScore.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

function drawClouds() {
    // Draw clouds in background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    
    // Cloud 1
    ctx.beginPath();
    ctx.arc(100, 80, 25, 0, Math.PI * 2);
    ctx.arc(130, 80, 30, 0, Math.PI * 2);
    ctx.arc(160, 80, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Cloud 2
    ctx.beginPath();
    ctx.arc(400, 120, 20, 0, Math.PI * 2);
    ctx.arc(425, 120, 25, 0, Math.PI * 2);
    ctx.arc(450, 120, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Cloud 3
    ctx.beginPath();
    ctx.arc(650, 60, 22, 0, Math.PI * 2);
    ctx.arc(680, 60, 28, 0, Math.PI * 2);
    ctx.arc(710, 60, 22, 0, Math.PI * 2);
    ctx.fill();
}

function drawGround() {
    const groundHeight = 100;
    const buildingY = canvas.height - groundHeight;
    
    // Draw city skyline (buildings)
    const buildings = [
        { x: 0, width: 60, height: 60, color: '#34495e' },
        { x: 60, width: 50, height: 80, color: '#2c3e50' },
        { x: 110, width: 45, height: 50, color: '#95a5a6' },
        { x: 155, width: 70, height: 90, color: '#34495e' },
        { x: 225, width: 55, height: 70, color: '#7f8c8d' },
        { x: 280, width: 50, height: 55, color: '#2c3e50' },
        { x: 330, width: 65, height: 85, color: '#34495e' },
        { x: 395, width: 45, height: 65, color: '#95a5a6' },
        { x: 440, width: 60, height: 75, color: '#2c3e50' },
        { x: 500, width: 70, height: 95, color: '#34495e' },
        { x: 570, width: 50, height: 60, color: '#7f8c8d' },
        { x: 620, width: 55, height: 80, color: '#2c3e50' },
        { x: 675, width: 65, height: 70, color: '#34495e' },
        { x: 740, width: 60, height: 90, color: '#95a5a6' }
    ];
    
    buildings.forEach(building => {
        // Draw building
        ctx.fillStyle = building.color;
        ctx.fillRect(building.x, buildingY + (groundHeight - building.height), building.width, building.height);
        
        // Draw windows
        ctx.fillStyle = '#f39c12';
        const windowRows = Math.floor(building.height / 15);
        const windowCols = Math.floor(building.width / 12);
        
        for (let row = 0; row < windowRows; row++) {
            for (let col = 0; col < windowCols; col++) {
                const windowX = building.x + 5 + col * 12;
                const windowY = buildingY + (groundHeight - building.height) + 5 + row * 15;
                ctx.fillRect(windowX, windowY, 6, 8);
            }
        }
    });
    
    // Draw ground/street
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, canvas.height - 15, canvas.width, 15);
    
    // Draw street lines
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 7);
    ctx.lineTo(canvas.width, canvas.height - 7);
    ctx.stroke();
    ctx.setLineDash([]);
}

function gameLoop() {
    if (gameOver) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw clouds first (background)
    drawClouds();
    
    // Draw ground/buildings
    drawGround();
    
    // Update and draw
    updateBird();
    updatePipes();
    drawBird();
    drawPipes();
    
    frameCount++;
    requestAnimationFrame(gameLoop);
}

// Initialize with easy level selected
selectLevel('easy');