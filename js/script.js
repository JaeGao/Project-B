let video;
let player;
let coin;
let platforms = [];
let score = 0;
let gameState = 'start';
let playerX;
let playerY;
let playerSpeed = 5;
let playerSize = 30;
let coinSize = 20;
let lavaY = 600;
let scrollSpeed = 1;
let startPlatform;
let playerVelocity = 0;
const jumpForce = -12;
const gravity = 0.6;
let playerWidth = 154;
let playerHeight = 365;
function preload() {
  player = loadImage('assets/player.png');
  coin = loadImage('assets/coin.png');
}

function setup() {
  let canvas = createCanvas(800, 600);
  canvas.parent("canvasContainer");
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  playerX = width / 2 - playerSize / 2;
  playerY = height - playerSize - 100;

  startPlatform = new Platform(width / 2 - 50, height - 100, 100, 20, 'rect');
}

function draw() {
  if (gameState === 'start') {
    drawStartMenu();
  } else if (gameState === 'play') {
    drawGame();
  }
}

function drawStartMenu() {
  background(255);
  textAlign(CENTER);
  textSize(32);
  text('Two-Player Platformer', width / 2, height / 2 - 50);
  textSize(24);
  text('Click to Start', width / 2, height / 2);
}

function drawGame() {
  tint(255, 128);
  image(video, 0, 0, width, height);
  noTint();

  updatePlatforms();

  let newPlayerX = playerX;
  if (keyIsDown(LEFT_ARROW)) {
    newPlayerX -= playerSpeed;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    newPlayerX += playerSpeed;
  }

  let onPlatform = playerY + playerSize >= startPlatform.y &&
    playerX + playerSize > startPlatform.x &&
    playerX < startPlatform.x + startPlatform.width;

  for (let platform of platforms) {
    if (
      newPlayerX < platform.x + platform.width &&
      newPlayerX + playerSize > platform.x &&
      playerY < platform.y + platform.height &&
      playerY + playerSize > platform.y
    ) {
      onPlatform = true;
      break;
    }
  }

  if (onPlatform) {
    playerX = newPlayerX;
    playerVelocity = 0;
  } else {
    playerVelocity += gravity;
  }

  // Handle jumping
  if (keyIsDown(UP_ARROW) && onPlatform) {
    playerVelocity = jumpForce;
  }

  playerY += playerVelocity;

  lavaY -= scrollSpeed;

  fill(255, 0, 0);
  noStroke();
  rect(0, lavaY, width, height - lavaY);

  if (playerY + playerSize > lavaY || playerY > height) {
    gameState = 'start';
    lavaY = height;
    score = 0;
    playerY = startPlatform.y - playerSize;
    playerX = startPlatform.x + startPlatform.width / 2 - playerSize / 2;
  }

  if (playerY < height / 2) {
    let offset = height / 2 - playerY;
    playerY += offset;
    lavaY += offset;
    platforms.forEach(platform => platform.y += offset);
    startPlatform.y += offset;
  }

  platforms.forEach(platform => platform.draw());
  startPlatform.draw();

  // Draw player
  image(player, playerX, playerY - playerSize, playerSize, playerSize * 2.37);
  image(coin, width / 2 - coinSize / 2, 50, coinSize, coinSize);

  score = Math.max(score, height - playerY);

  textAlign(LEFT);
  textSize(24);
  text('Score: ' + score, 20, 40);
}

function updatePlatforms() {
  platforms = [];
  video.loadPixels();
  for (let y = 0; y < video.height; y += 20) {
    for (let x = 0; x < video.width; x += 20) {
      let index = (x + y * video.width) * 4;
      let r = video.pixels[index];
      let g = video.pixels[index + 1];
      let b = video.pixels[index + 2];

      if (r > 150 && g < 100 && b < 100) {
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

function mousePressed() {
  if (gameState === 'start') {
    gameState = 'play';
  }
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
    fill(255, 0, 0);
    noStroke();
    if (this.shape === 'ellipse') {
      ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width, this.height);
    } else if (this.shape === 'rect') {
      rect(this.x, this.y, this.width, this.height);
    } else if (this.shape === 'triangle') {
      triangle(
        this.x,
        this.y + this.height,
        this.x + this.width,
        this.y + this.height,
        this.x + this.width / 2,
        this.y
      );
    }
  }
}