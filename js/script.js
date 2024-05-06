let video;
let player;
let coin;
let platforms = [];
let score = 0;
let coinCount = 0;
let gameState = 'start';
let playerX;
let playerY;
let playerSpeed = 5;
let playerSize = 30;
let coinSize = 20;
let lavaY = 600;
let scrollSpeed = 1;
let playerVelocity = 0;
const jumpForce = -12;
const gravity = 0.6;
let playerWidth = 154;
let playerHeight = 365;
let firstJump = false;
let startTime;
let gameTime = 0;
let gameTimer = 60000; // 1 minute in milliseconds
let jumpSound;
let collectSound;
let gameMusic;
let loseSound;
let winSound;
let isCrouching = false;

function preload() {
  player = loadImage('assets/player.png');
  coinImage = loadImage('assets/coin.png');
  jumpSound = loadSound('assets/jump.mp3');
  collectSound = loadSound('assets/collect.mp3');
  gameMusic = loadSound('assets/game-music-loop.mp3');
  loseSound = loadSound('assets/violin-lose.mp3');
  winSound = loadSound('assets/game-win.mp3');
}

function setup() {
  let canvas = createCanvas(800, 600);
  canvas.parent("canvasContainer");
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  playerX = width / 2 - playerSize / 2;
  playerY = height - playerSize - 100;

  platforms.push(new Platform(width / 2 - 50, height - 100, 100, 20, 'rect'));
  coin = createCoin();
}

function draw() {
  if (gameState === 'start') {
    drawStartMenu();
  } else if (gameState === 'play') {
    drawGame();
  } else if (gameState === 'end') {
    drawEndScreen();
  }
}

function drawStartMenu() {
  background('#fff0f5');
  textAlign(CENTER);
  textSize(48);
  textFont('Press Start 2P');
  fill('#d64d4d');
  text('Two-Player Platformer', width / 2, height / 2 - 100);
  textSize(24);
  textFont('Courier New');
  fill('#333');
  text('Press Enter to Start', width / 2, height / 2);
}

function drawGame() {
  if (gameState === 'play') {
    updatePlatforms();
    updateCoin();

    let newPlayerX = playerX;
    if (keyIsDown(65)) { // A key
      newPlayerX -= playerSpeed;
    }
    if (keyIsDown(68)) { // D key
      newPlayerX += playerSpeed;
    }

    let onPlatform = false;
    for (let platform of platforms) {
      if (platform.collidesWith(newPlayerX, playerY, playerSize)) {
        onPlatform = true;
        break;
      }
    }

    playerX = newPlayerX;

    playerY += playerVelocity;
    playerVelocity += gravity;

    onPlatform = false; // Reset onPlatform before collision detection
    for (let platform of platforms) {
      if (platform.collidesWith(playerX, playerY, playerSize)) {
        playerY = platform.y - playerSize;
        playerVelocity = 0;
        onPlatform = true;
        break;
      }
    }

    // Handle jumping
    if (keyIsDown(87) && onPlatform) { // W key
      playerVelocity = jumpForce;
      jumpSound.play();
      if (!firstJump) {
        firstJump = true; // Set firstJump to true when the player makes the first jump
      }
    }

    // Handle crouching
    if (keyIsDown(83)) { // S key
      isCrouching = true;
    } else {
      isCrouching = false;
    }

    // Check collision with the coin
    if (dist(playerX + playerSize / 2, playerY + playerSize / 2, coin.x + coinSize / 2, coin.y + coinSize / 2) < (playerSize + coinSize) / 2) {
      coin = createCoin();
      coinCount++;
      score += 100; // Increase the score by 100 points for collecting a coin
      flashMessage("COIN COLLECTED!", 60);
      collectSound.play();
    }

    if (firstJump) {
      lavaY -= scrollSpeed;

      // Update platforms and coin positions
      platforms.forEach(platform => {
        platform.y -= scrollSpeed;
      });

      coin.y -= scrollSpeed;
    }

    // Draw the mirrored video
    push();
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);
    pop();

    // Draw platforms and coin
    platforms.forEach(platform => {
      platform.draw();
    });
    image(coinImage, coin.x, coin.y, coinSize, coinSize);

    fill(255, 100, 0);
    noStroke();
    rect(0, lavaY, width, height - lavaY);

    if (playerY + playerSize > lavaY || playerY > height) {
      gameState = 'end';
      gameMusic.stop();
      loseSound.play();
    } else if (gameTime >= gameTimer) {
      gameState = 'end';
      gameMusic.stop();
      winSound.play();
    }

    if (playerY < height / 2) {
      let offset = height / 2 - playerY;
      playerY += offset;
      lavaY += offset;
      platforms.forEach(platform => platform.y += offset);
      coin.y += offset;
    }

    // Remove off-screen platforms and coin
    platforms = platforms.filter(platform => platform.y < height);
    if (coin.y > height) {
      coin = createCoin();
    }
  }

  // Draw player
  if (isCrouching) {
    image(player, playerX, playerY - playerSize + (playerSize * 1.37), playerSize, playerSize);
  } else {
    image(player, playerX, playerY - playerSize, playerSize, playerSize * 2.37);
  }

  updateGameTime();

  textAlign(LEFT);
  textSize(24);
  textFont('Roboto Mono');
  fill('#3a4660');
  text('Score: ' + score, 20, 40);
  text('Coins: ' + coinCount, 20, 70);
  text('Time: ' + formatTime(gameTime), 20, 100);
}

function drawEndScreen() {
  background('#fff0f5');
  textAlign(CENTER);
  textSize(48);
  textFont('Press Start 2P');
  fill('#d64d4d');
  if (gameTime >= gameTimer) {
    text('Congratulations!', width / 2, height / 2 - 100);
  } else {
    text('Game Over!', width / 2, height / 2 - 100);
  }
  textSize(24);
  textFont('Courier New');
  fill('#333');
  text('Final Score: ' + score, width / 2, height / 2);
  text('Coins Collected: ' + coinCount, width / 2, height / 2 + 40);
  text('Time Survived: ' + formatTime(gameTime), width / 2, height / 2 + 80);
  text('Press Enter to Restart', width / 2, height / 2 + 120);
}

function resetPlayer() {
  playerY = height - playerSize - 100;
  playerX = width / 2 - playerSize / 2;
  playerVelocity = 0;
}

function resetPlatforms() {
  platforms = [];
  platforms.push(new Platform(width / 2 - 50, height - 100, 100, 20, 'rect'));
}

function resetCoin() {
  coin = createCoin();
}

function updatePlatforms() {
  platforms = platforms.filter(platform => platform.y < height);

  video.loadPixels();
  for (let y = 0; y < video.height; y += 20) {
    for (let x = 0; x < video.width; x += 20) {
      let index = (x + y * video.width) * 4;
      let r = video.pixels[index];
      let g = video.pixels[index + 1];
      let b = video.pixels[index + 2];

      if (r > 250 && g > 250 && b > 250) {
        let choice = floor(random(3));
        if (choice === 0) {
          platforms.push(new Platform(x, y, 20, 20, 'ellipse'));
        } else if (choice === 1) {
          platforms.push(new Platform(x, y, 20, 20, 'rect'));
        } else {
          platforms.push(new Platform(x, y, 20, 20, 'triangle'));
        }
      }
    }
  }
}

function updateCoin() {
  if (dist(playerX + playerSize / 2, playerY + playerSize / 2, coin.x + coinSize / 2, coin.y + coinSize / 2) < (playerSize + coinSize) / 2) {
    coin = createCoin();
    coinCount++;
    score += 100; // Increase the score by 100 points for collecting a coin
    flashMessage("COIN COLLECTED!", 60);
    collectSound.play();
  }
}

function createCoin() {
  return {
    x: random(width - coinSize),
    y: random(height - coinSize)
  };
}

function keyPressed() {
  if (gameState === 'start' && keyCode === ENTER) {
    gameState = 'play';
    startTime = millis(); // Record the start time when the game begins
    gameMusic.loop();
  } else if (gameState === 'end' && keyCode === ENTER) {
    resetGame();
  }
}

function resetGame() {
  gameState = 'start';
  lavaY = height;
  score = 0;
  coinCount = 0;
  firstJump = false;
  resetPlayer();
  resetPlatforms();
  resetCoin();
  gameTime = 0;
}

class Platform {
  constructor(x, y, w, h, shape) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.shape = shape;
  }

  draw() {
    fill(0, 255, 255);
    noStroke();
    if (this.shape === 'ellipse') {
      ellipse(width - this.x - this.width / 2, this.y + this.height / 2, this.width, this.height);
    } else if (this.shape === 'rect') {
      rect(width - this.x - this.width, this.y, this.width, this.height);
    } else if (this.shape === 'triangle') {
      triangle(
        width - this.x - this.width,
        this.y + this.height,
        width - this.x,
        this.y + this.height,
        width - this.x - this.width / 2,
        this.y
      );
    }
  }

  collidesWith(playerX, playerY, playerSize) {
    return (
      playerX < width - this.x &&
      playerX + playerSize > width - this.x - this.width &&
      playerY + playerSize > this.y &&
      playerY + playerSize < this.y + this.height
    );
  }
}

function flashMessage(message, size) {
  textAlign(CENTER);
  textSize(size);
  fill(255, 255, 0);
  text(message, width / 2, height / 2);
}

function updateGameTime() {
  if (gameState === 'play') {
    gameTime = millis() - startTime;
  }
}

function formatTime(time) {
  let minutes = floor(time / 60000);
  let seconds = floor((time % 60000) / 1000);
  let milliseconds = floor((time % 1000) / 100);
  return nf(minutes, 2) + ":" + nf(seconds, 2) + "." + nf(milliseconds, 1);
}