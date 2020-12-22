/* global loadImage createCanvas noStroke background enemyImage gameOverSound loadSound
  fill circle mouseX mouseY constrain width height textSize CENTER
  collideCircleCircle noLoop time gameIsOver text image frameCount textAlign
*/

let backgroundImage, playerImage, enemyImage, gameOverSound, powerUpImage;
let health = 500;
let time = 5000;
let cloneTime = 0;

const healthSpan = document.querySelector("#health");
const timer = document.querySelector("#time");

function preload() {
  backgroundImage = loadImage(
    "https://cdn.glitch.com/108b931c-e8fa-49e1-8782-f4a7a76e8479%2Fspongebob%20image%20%234.png?v=1608612008808"
  );
  playerImage = loadImage(
    "https://cdn.glitch.com/108b931c-e8fa-49e1-8782-f4a7a76e8479%2FPngItem_1407656.png?v=1608520084482"
  );
  enemyImage = loadImage(
    "https://cdn.glitch.com/108b931c-e8fa-49e1-8782-f4a7a76e8479%2FPngItem_1243236.png?v=1608521377241"
  );
  gameOverSound = loadSound(
    "https://cdn.glitch.com/108b931c-e8fa-49e1-8782-f4a7a76e8479%2Fspongebob-disappointed-sound_5bQzQdN.mp3?v=1608541378185"
  );
}

function setup() {
  game.initialize();
}

function draw() {
  game.update();
  runTimer();
}

function mouseMoved() {
  game.mouseMoved();
}

class Field {
  constructor(width, height, color) {
    Object.assign(this, { width, height, color });
  }
  clear() {
    background(backgroundImage);
  }
  clamp(x, y) {
    return { x: constrain(x, 0, this.width), y: constrain(y, 0, this.height) };
  }
}

class Agent {
  constructor(x, y, speed, target, diameter) {
    Object.assign(this, { x, y, speed, target, diameter });
  }
  move(field) {
    const [dx, dy] = [this.target.x - this.x, this.target.y - this.y];
    const distance = Math.hypot(dx, dy);
    if (distance > 1) {
      const step = this.speed / distance;
      Object.assign(this, field.clamp(this.x + step * dx, this.y + step * dy));
    }
  }
  collidesWith(other) {
    return collideCircleCircle(
      this.x,
      this.y,
      this.diameter,
      other.x,
      other.y,
      other.diameter
    );
  }
}

class Player extends Agent {
  constructor(x, y, speed, target) {
    super(x, y, speed, target, 45);
  }
  draw() {
    fill("green");
    image(playerImage, this.x - 20, this.y - 95, 80, 120);
  }
}

class Enemy extends Agent {
  constructor(x, y, speed, target) {
    super(x, y, speed, target, 70);
  }
  draw() {
    fill("red");

    image(enemyImage, this.x - 40, this.y - 60, 100, 100);
  }
}

class PowerUp {
  constructor(x, y, diameter) {
    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.visible = false;
  }
  draw() {
    if (this.visible) {
      fill("orange");
      circle(this.x, this.y, this.diameter);
    }
  }
  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
  hitByPlayer() {
    return (
      this.visible &&
      collideCircleCircle(
        this.x,
        this.y,
        this.diameter,
        game.player.x,
        game.player.y,
        game.player.diameter
      )
    );
  }
}

class Decoy {
  constructor(x, y, diameter) {
    Object.assign(this, { x, y, diameter });
    this.showTime = 300;
    this.initialTime;
  }
  draw() {
    fill("green");
    image(playerImage, this.x - 20, this.y - 95, 80, 120);
  }
}

const game = {
  initialize() {
    createCanvas(800, 800);
    this.field = new Field(width, height);
    this.mouse = { x: 0, y: 0 };
    this.player = new Player(20, 20, 2.5, this.mouse);
    this.decoy = {};
    this.powerUp = new PowerUp(400, 400, 50);
    this.enemies = [
      new Enemy(width, 0, 2, this.player),
      new Enemy(width, height, 1.5, this.player),
      new Enemy(0, height, 1.8, this.player)
    ];
  },
  mouseMoved() {
    Object.assign(this.mouse, { x: mouseX, y: mouseY });
  },
  checkForCollisions() {
    for (let enemy of this.enemies) {
      if (enemy.collidesWith(this.player)) {
        health -= 1;
      }
    }
  },

  initializeDecoy() {
    this.decoy = new Decoy(50, 50, 20);
    for (let agent of [...this.enemies]) {
      agent.target = this.decoy;
    }
    this.decoy.initialTime = frameCount;
  },
  handleDecoy() {
    if (
      Object.keys(this.decoy).length > 0 &&
      frameCount < game.decoy.showTime + game.decoy.initialTime
    ) {
      this.decoy.draw();
    } else {
      for (let agent of [...this.enemies]) {
        agent.target = this.player;
      }
    }
  },

  update() {
    this.field.clear();
    for (let agent of [this.player, ...this.enemies]) {
      agent.move(this.field);
      agent.draw();
    }
    this.powerUp.draw();
    this.handleDecoy();
    this.checkForCollisions();
    if (this.powerUp.hitByPlayer()) {
      health += 200;
      this.powerUp.hide();
    } else if (health < 100 && !this.visible) {
      this.powerUp.show();
    }
    healthSpan.textContent = Math.max(health, 0);
    if (health <= 0) {
      gameIsOver();
    }
  }
};

function mouseClicked() {
  game.initializeDecoy();
}

function runTimer() {
  timer.textContent = time;
  if (time > 0) {
    time -= 1;
  } else {
    gameIsOver();
  }
}

function gameIsOver() {
  noLoop();
  gameOverSound.play();
  textSize(50);
  textAlign(CENTER);
  fill("purple");
  text("GAME OVER", width / 2, height / 2);
}
