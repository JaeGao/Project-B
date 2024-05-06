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
let playerVelocity = 0;
const jumpForce = -12;
const gravity = 0.6;
let playerWidth = 154;
let playerHeight = 365;
let firstJump = false;
function preload() {
  player = loadImage('assets/player.png');
  coinImage = loadImage('assets/coin.png');
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
  if (gameState === 'play') {
    updatePlatforms();
    updateCoin();

    let newPlayerX = playerX;
    if (keyIsDown(LEFT_ARROW)) {
      newPlayerX -= playerSpeed;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      newPlayerX += playerSpeed;
    }

    let onPlatform = true;


    playerX = newPlayerX;

    // Handle jumping
    if (keyIsDown(UP_ARROW) && onPlatform) {
      playerVelocity = jumpForce;
      if (!firstJump) {
        firstJump = true; // Set firstJump to true when the player makes the first jump
      }
      console.log("Jump initiated. playerVelocity:", playerVelocity);
    }

    playerY += playerVelocity;
    playerVelocity += gravity;

    console.log("playerY:", playerY, "playerVelocity:", playerVelocity);

    for (let platform of platforms) {
      if (platform.collidesWith(playerX, playerY, playerSize)) {
        playerY = platform.y - playerSize;
        playerVelocity = 0;
        onPlatform = true;
        console.log("Collision detected. playerY adjusted:", playerY);
        break;
      }
    }

    console.log("onPlatform:", onPlatform);

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

    fill(255, 0, 0);
    noStroke();
    rect(0, lavaY, width, height - lavaY);

    if (playerY + playerSize > lavaY || playerY > height) {
      gameState = 'start';
      lavaY = height;
      score = 0;
      firstJump = false; // Reset firstJump when the game restarts
      resetPlayer(); // Reset the player's position
      resetPlatforms(); // Reset the platforms' positions
      resetCoin(); // Reset the coin's position
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
  image(player, playerX, playerY - playerSize, playerSize, playerSize * 2.37);

  score = Math.max(score, height - playerY);

  textAlign(LEFT);
  textSize(24);
  text('Score: ' + score, 20, 40);
}
function resetPlayer() {
  playerY = height - playerSize - 100;
  playerX = width / 2 - playerSize / 2;
  playerVelocity = 0;
} function resetPlatforms() {
  platforms.forEach(platform => {
    platform.y = height - 100; // Reset the platforms' y-position
  });
}

function resetCoin() {
  coin.y = height - coinSize - 100; // Reset the coin's y-position
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

      if (r > 200 && g > 200 && b > 200) {
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
    score++;
  }
}

function createCoin() {
  return {
    x: random(width - coinSize),
    y: random(height - coinSize)
  };
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
    fill(0, 255, 255);
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

  collidesWith(playerX, playerY, playerSize) {
    return (
      playerX < this.x + this.width &&
      playerX + playerSize > this.x &&
      playerY + playerSize > this.y &&
      playerY + playerSize < this.y + this.height
    );
  }
}