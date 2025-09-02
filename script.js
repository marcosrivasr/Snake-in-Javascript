class SnakeGame {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.gridSize = 20;
    this.tileCount = this.canvas.width / this.gridSize;

    this.snake = [{ x: 10, y: 10 }];
    this.food = {};
    this.dx = 0;
    this.dy = 0;
    this.score = 0;
    this.highScore = localStorage.getItem("snakeHighScore") || 0;

    this.gameRunning = false;
    this.gamePaused = false;

    this.initializeElements();
    this.bindEvents();
    this.generateFood();
    this.updateScore();
  }

  initializeElements() {
    this.scoreElement = document.getElementById("score");
    this.highScoreElement = document.getElementById("highScore");
    this.finalScoreElement = document.getElementById("finalScore");
    this.gameOverElement = document.getElementById("gameOver");
    this.startScreenElement = document.getElementById("startScreen");
    this.startBtn = document.getElementById("startBtn");
    this.restartBtn = document.getElementById("restartBtn");
  }

  bindEvents() {
    // Keyboard controls
    document.addEventListener("keydown", (e) => {
      if (!this.gameRunning && e.code !== "Space") return;

      switch (e.code) {
        case "ArrowUp":
          if (this.dy === 0) {
            this.dx = 0;
            this.dy = -1;
          }
          e.preventDefault();
          break;
        case "ArrowDown":
          if (this.dy === 0) {
            this.dx = 0;
            this.dy = 1;
          }
          e.preventDefault();
          break;
        case "ArrowLeft":
          if (this.dx === 0) {
            this.dx = -1;
            this.dy = 0;
          }
          e.preventDefault();
          break;
        case "ArrowRight":
          if (this.dx === 0) {
            this.dx = 1;
            this.dy = 0;
          }
          e.preventDefault();
          break;
        case "Space":
          this.togglePause();
          e.preventDefault();
          break;
      }
    });

    // Button events
    this.startBtn.addEventListener("click", () => this.startGame());
    this.restartBtn.addEventListener("click", () => this.restartGame());
  }

  startGame() {
    this.gameRunning = true;
    this.gamePaused = false;
    this.startScreenElement.classList.add("hidden");
    this.gameLoop();
  }

  restartGame() {
    this.snake = [{ x: 10, y: 10 }];
    this.dx = 0;
    this.dy = 0;
    this.score = 0;
    this.updateScore();
    this.generateFood();
    this.gameOverElement.classList.add("hidden");
    this.startGame();
  }

  togglePause() {
    if (this.gameRunning) {
      this.gamePaused = !this.gamePaused;
      if (!this.gamePaused) {
        this.gameLoop();
      }
    }
  }

  generateFood() {
    this.food = {
      x: Math.floor(Math.random() * this.tileCount),
      y: Math.floor(Math.random() * this.tileCount),
    };

    // Make sure food doesn't spawn on snake
    for (let segment of this.snake) {
      if (segment.x === this.food.x && segment.y === this.food.y) {
        this.generateFood();
        return;
      }
    }
  }

  updateScore() {
    this.scoreElement.textContent = this.score;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.highScoreElement.textContent = this.highScore;
      localStorage.setItem("snakeHighScore", this.highScore);
    }
  }

  moveSnake() {
    const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
    this.snake.unshift(head);

    // Check if food is eaten
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.updateScore();
      this.generateFood();
      this.playEatSound();
    } else {
      this.snake.pop();
    }
  }

  checkCollision() {
    const head = this.snake[0];

    // Wall collision
    if (
      head.x < 0 ||
      head.x >= this.tileCount ||
      head.y < 0 ||
      head.y >= this.tileCount
    ) {
      return true;
    }

    // Self collision
    for (let i = 1; i < this.snake.length; i++) {
      if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
        return true;
      }
    }

    return false;
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = "#111";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw snake
    this.ctx.fillStyle = "#00ff00";
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = "#00ff00";

    for (let i = 0; i < this.snake.length; i++) {
      const segment = this.snake[i];

      // Head is brighter
      if (i === 0) {
        this.ctx.fillStyle = "#00ff00";
        this.ctx.shadowBlur = 15;
      } else {
        this.ctx.fillStyle = "#00cc00";
        this.ctx.shadowBlur = 5;
      }

      this.ctx.fillRect(
        segment.x * this.gridSize + 1,
        segment.y * this.gridSize + 1,
        this.gridSize - 2,
        this.gridSize - 2
      );
    }

    // Draw food
    this.ctx.fillStyle = "#00ff00";
    this.ctx.shadowColor = "#00ff00";
    this.ctx.shadowBlur = 15;

    // Animated food (pulsing effect)
    const pulse = Math.sin(Date.now() * 0.01) * 2;
    this.ctx.fillRect(
      this.food.x * this.gridSize + 2 - pulse,
      this.food.y * this.gridSize + 2 - pulse,
      this.gridSize - 4 + pulse * 2,
      this.gridSize - 4 + pulse * 2
    );

    // Reset shadow
    this.ctx.shadowBlur = 0;

    // Draw grid (subtle)
    this.ctx.strokeStyle = "rgba(0, 255, 0, 0.1)";
    this.ctx.lineWidth = 1;

    for (let i = 0; i <= this.tileCount; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.gridSize, 0);
      this.ctx.lineTo(i * this.gridSize, this.canvas.height);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.gridSize);
      this.ctx.lineTo(this.canvas.width, i * this.gridSize);
      this.ctx.stroke();
    }

    // Draw pause indicator
    if (this.gamePaused) {
      this.ctx.fillStyle = "rgba(204, 255, 204, 0.8)";
      this.ctx.font = '20px "Press Start 2P"';
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        "PAUSED",
        this.canvas.width / 2,
        this.canvas.height / 2
      );
      this.ctx.textAlign = "start";
    }
  }

  gameOver() {
    this.gameRunning = false;
    this.finalScoreElement.textContent = this.score;
    this.gameOverElement.classList.remove("hidden");
    this.playGameOverSound();
  }

  playEatSound() {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "square";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.1
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }

  playGameOverSound() {
    // Create a game over sound
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      200,
      audioContext.currentTime + 0.5
    );
    oscillator.type = "sawtooth";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }

  gameLoop() {
    if (!this.gameRunning || this.gamePaused) return;

    setTimeout(() => {
      this.moveSnake();

      if (this.checkCollision()) {
        this.gameOver();
        return;
      }

      this.draw();
      this.gameLoop();
    }, 150 - Math.min(this.score, 100)); // Game speeds up as score increases
  }
}

// Initialize game when page loads
window.addEventListener("load", () => {
  new SnakeGame();
});

// Add some particle effects for extra visual appeal
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
  }

  addParticle(x, y, color) {
    this.particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1,
      decay: 0.02,
      color: color,
    });
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= particle.decay;

      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw() {
    this.particles.forEach((particle) => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.life;
      this.ctx.fillStyle = particle.color;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = particle.color;
      this.ctx.fillRect(particle.x - 1, particle.y - 1, 2, 2);
      this.ctx.restore();
    });
  }
}