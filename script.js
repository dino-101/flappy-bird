const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreValue = document.getElementById('scoreValue');
const finalScore = document.getElementById('finalScore');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const restartBtn = document.getElementById('restartBtn');

// Game variables
let bird = {
    x: 80,
    y: 250,
    width: 34,
    height: 24,
    velocity: 0,
    gravity: 0.5,
    jumpStrength: -9
};

let pipes = [];
let score = 0;
let gameStarted = false;
let gameOver = false;
let frameCount = 0;

const PIPE_WIDTH = 60;
const PIPE_GAP = 180;
const PIPE_SPEED = 2;
const PIPE_INTERVAL = 90; // frames between pipes

// Event listeners
canvas.addEventListener('click', jump);
restartBtn.addEventListener('click', restart);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
    }
});

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
    gameLoop();
}

function restart() {
    bird.y = 250;
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
    const minHeight = 50;
    const maxHeight = canvas.height - PIPE_GAP - minHeight - 100;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + PIPE_GAP,
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
    // Create new pipes
    if (frameCount % PIPE_INTERVAL === 0) {
        createPipe();
    }
    
    // Update pipe positions
    pipes.forEach((pipe, index) => {
        pipe.x -= PIPE_SPEED;
        
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

function drawGround() {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
    
    // Draw grass on top
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvas.height - 100, canvas.width, 10);
}

function gameLoop() {
    if (gameOver) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    drawGround();
    
    // Update and draw
    updateBird();
    updatePipes();
    drawBird();
    drawPipes();
    
    frameCount++;
    requestAnimationFrame(gameLoop);
}