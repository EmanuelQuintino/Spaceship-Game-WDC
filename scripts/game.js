const spaceContainer = document.querySelector(".spaceContainer");
const spaceship = document.querySelector(".spaceship");
const playerName = document.querySelector(".name");
const playerLife = document.querySelector(".life");
const playerScore = document.querySelector(".score");

const spaceContainerWidth = spaceContainer.offsetWidth;
const spaceContainerHeight = spaceContainer.offsetHeight;

const spaceshipWidth = spaceship.offsetWidth;
const spaceshipHeight = spaceship.offsetHeight;

const spaceshipSpeed = 10;
const enemySpaceshipSpeed = 2;
const shotSpeed = 200;

let isShooting = false;

let positionX = 0;
let positionY = 0;
let moveX = spaceContainerWidth / 2;
let moveY = 0;
let enemyX = Math.random() * (spaceContainerWidth - spaceshipWidth);
let enemyY = 100;
let life = 100;
let score = 0;

function spaceshipMove() {
  moveX += positionX * spaceshipSpeed;
  moveY += positionY * spaceshipSpeed;

  const descontScreenLimit = spaceshipWidth / 2;

  // limit X: left, right
  moveX = Math.max(
    descontScreenLimit,
    Math.min(moveX, spaceContainerWidth - descontScreenLimit)
  );

  // limit Y: top, bottom
  moveY = Math.max(
    -descontScreenLimit,
    Math.min(moveY, spaceContainerHeight - spaceshipHeight - descontScreenLimit)
  );

  spaceship.style.left = moveX - descontScreenLimit + "px";
  spaceship.style.bottom = moveY + descontScreenLimit + "px";

  requestAnimationFrame(spaceshipMove);
}

function createShot() {
  const shot = document.createElement("div");
  shot.classList.add("shot");
  shot.style.left = moveX + "px";
  shot.style.bottom = moveY + spaceshipHeight + spaceshipHeight / 4 + "px";
  spaceContainer.appendChild(shot);

  const shootSound = new Audio("../audios/shoot.mp3");
  shootSound.play();

  isShooting = false;
}

function spaceshipShoots() {
  const shoots = document.querySelectorAll(".shot");

  shoots.forEach((shot) => {
    let shotBottom = parseInt(shot.style.bottom.replace("px", ""), 10) || 0;
    shotBottom += shotSpeed / 10;
    shot.style.bottom = `${shotBottom}px`;

    if (shotBottom > spaceContainerHeight) {
      spaceContainer.removeChild(shot);
    }
  });

  requestAnimationFrame(spaceshipShoots);
}

class EnemySpaceship {
  constructor(enemyNumber) {
    this.x = 0;
    this.y = 0;
    this.baseX = Math.random() * 300;
    this.speed = Math.ceil(Math.random() * 5 + 5); // add 5 in range

    this.element = document.createElement("img");
    this.element.src = `../images/enemy${enemyNumber}.gif`;
    this.element.alt = `enemy${enemyNumber}.gif`;

    document.querySelector(".enemies").appendChild(this.element);
  }

  fly() {
    this.y += this.speed / 10;
    this.x = Math.cos(this.y / 10) * 20 + this.baseX;

    this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;

    if (this.y > spaceContainerHeight) {
      spaceContainer.removeChild(this.element);
      enemies.shift();
    }
  }
}

function animateEnemies() {
  enemies.forEach((enemy) => {
    enemy.fly();
  });

  requestAnimationFrame(animateEnemies);
}

function setPlayerName() {
  const storagePlayerName = localStorage.getItem("@spaceGame:playerName");

  playerName.innerHTML = storagePlayerName;
}

function setPlayerLife(damage) {
  if (damage) {
    const criticalDamage = Math.ceil(damage * (Math.random() + 1));
    life -= criticalDamage;
  } else {
    life -= 20;
  }

  if (life < 25) {
    playerLife.style.color = "red";
  }

  playerLife.innerHTML = `Nave ${life < 0 ? 0 : life}%`;
}

function setPlayerScore(points) {
  score += points;
  playerScore.innerHTML = String(score).padStart(9, "0");
}

function gameControls(key) {
  switch (key.code) {
    case "ArrowUp":
    case "KeyW":
      positionY = 1;
      break;
    case "ArrowDown":
    case "KeyS":
      positionY = -1;
      break;
    case "ArrowLeft":
    case "KeyA":
      positionX = -1;
      spaceship.style.transform = "rotate(-15deg)";
      break;
    case "ArrowRight":
    case "KeyD":
      positionX = 1;
      spaceship.style.transform = "rotate(15deg)";
      break;
    case "Space":
      if (isShooting) {
        createShot();
      }
    default:
      break;
  }
}

function gameControlsCancel(key) {
  switch (key.code) {
    case "ArrowUp":
    case "ArrowDown":
    case "KeyW":
    case "KeyS":
      positionY = 0;
      spaceship.style.transform = "rotate(0deg)";
      break;
    case "ArrowLeft":
    case "ArrowRight":
    case "KeyA":
    case "KeyD":
      positionX = 0;
      spaceship.style.transform = "rotate(0deg)";
      break;
    case "Space":
      isShooting = false;
    default:
      break;
  }
}

document.addEventListener("keydown", gameControls);
document.addEventListener("keyup", gameControlsCancel);

setInterval(() => {
  isShooting = true;
}, shotSpeed);

const enemies = [];

setInterval(() => {
  enemies.push(new EnemySpaceship(1));
}, 1000);

spaceshipMove();
spaceshipShoots();
animateEnemies();
setPlayerName();
setPlayerLife(25);
setPlayerScore(150);
