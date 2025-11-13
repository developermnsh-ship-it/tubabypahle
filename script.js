const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = Math.min(window.innerWidth * 0.9, 400);
  canvas.height = Math.min(window.innerHeight * 0.8, 600);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const birdImg = new Image();
birdImg.src = "bird.png";

const pipeImg = new Image();
pipeImg.src = "pipe.png";

const bgMusic = document.getElementById("bg-music");
const gameoverMusic = document.getElementById("gameover-music");
const gameoverImg = document.getElementById("gameover-img");
const startScreen = document.getElementById("start-screen");

let bird = {
  x: 50,
  y: 150,
  width: 34,
  height: 24,
  gravity: 0.32,   // ⚖️ smooth fall
  lift: -3.8,      // 🎯 perfect mid jump (balanced)
  velocity: 0,
};

let pipes = [];
let frame = 0;
let score = 0;
let gameOver = false;
let started = false;
let canRestart = false;

// Difficulty vars
let gap = 150;
let speed = 2;

function startGame() {
  if (!started) {
    started = true;
    startScreen.style.display = "none";
    bgMusic.currentTime = 0;
    bgMusic.play().catch(() => {});
    gameLoop();
  }

  if (!gameOver) bird.velocity = bird.lift;
}

document.addEventListener("keydown", startGame);
document.addEventListener("click", startGame);
document.addEventListener("touchstart", startGame);

function createPipe() {
  const pipeHeight = 300;
  const top = Math.random() * (canvas.height - gap - 150) + 50;
  pipes.push({ x: canvas.width, y: top, width: 60, height: pipeHeight });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Bird
  ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  // Pipes
  pipes.forEach(pipe => {
    // top pipe (flipped)
    ctx.save();
    ctx.translate(pipe.x + pipe.width / 2, pipe.y);
    ctx.scale(1, -1);
    ctx.drawImage(pipeImg, -pipe.width / 2, 0, pipe.width, pipe.height);
    ctx.restore();

    // bottom pipe
    ctx.drawImage(pipeImg, pipe.x, pipe.y + gap, pipe.width, pipe.height);
  });

  // Score
  ctx.fillStyle = "black";
  ctx.font = "bold 24px Arial";
  ctx.fillText("Score: " + score, 10, 30);
}

function update() {
  if (gameOver) return;

  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if (frame % 100 === 0) createPipe();

  pipes.forEach(pipe => {
    pipe.x -= speed;

    // Collision
    if (
      bird.x < pipe.x + pipe.width &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.y || bird.y + bird.height > pipe.y + gap)
    ) {
      endGame();
    }

    if (pipe.x + pipe.width === bird.x) score++;
  });

  // Bird hits ground or ceiling
  if (bird.y + bird.height >= canvas.height || bird.y <= 0) {
    endGame();
  }

  // Difficulty progression
  if (score > 5 && gap > 130) gap = 130;
  if (score > 10 && gap > 115) gap = 115;
  if (score > 20 && gap > 100) gap = 100;
  if (score > 30 && gap > 90) gap = 90;
  if (score > 40 && gap > 80) gap = 80;

  if (score > 5 && speed < 2.5) speed = 2.5;
  if (score > 10 && speed < 3) speed = 3;
  if (score > 20 && speed < 3.5) speed = 3.5;
  if (score > 30 && speed < 4) speed = 4;
  if (score > 40 && speed < 4.5) speed = 4.5;
}

function endGame() {
  if (gameOver) return;
  gameOver = true;
  bgMusic.pause();
  gameoverMusic.currentTime = 0;
  gameoverMusic.play();
  gameoverImg.style.display = "block";

  // 3 sec delay before restart
  setTimeout(() => {
    canRestart = true;
  }, 3000);
}

function restartGame() {
  if (gameOver && canRestart) location.reload();
}

document.addEventListener("keydown", restartGame);
document.addEventListener("click", restartGame);
document.addEventListener("touchstart", restartGame);

function gameLoop() {
  update();
  draw();
  frame++;
  if (!gameOver) requestAnimationFrame(gameLoop);
}
