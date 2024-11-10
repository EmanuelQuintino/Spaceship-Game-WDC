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

let spaceshipPositionX = 0;
let spaceshipPositionY = 0;
let spaceshipMoveX = spaceContainerWidth / 2;
let spaceshipMoveY = 0;
let life = 100;
let score = 0;

const pressKey = (key) => {
  switch (key.code) {
    case "ArrowUp":
      spaceshipPositionY = 1;
      break;
    case "ArrowDown":
      spaceshipPositionY = -1;
      break;
    case "ArrowLeft":
      spaceshipPositionX = -1;
      spaceship.style.transform = "rotate(-10deg) translate(-50%, -50%)";
      break;
    case "ArrowRight":
      spaceshipPositionX = 1;
      spaceship.style.transform = "rotate(10deg) translate(-50%, -50%)";
      break;
    default:
      break;
  }
};

const holdKey = (key) => {
  switch (key.code) {
    case "ArrowUp":
    case "ArrowDown":
      spaceshipPositionY = 0;
      spaceship.style.transform = "rotate(0deg) translate(-50%, -50%)";
      break;
    case "ArrowLeft":
    case "ArrowRight":
      spaceshipPositionX = 0;
      spaceship.style.transform = "rotate(0deg) translate(-50%, -50%)";
      break;
    default:
      break;
  }
};

function spaceshipMove() {
  spaceshipMoveX += spaceshipPositionX * spaceshipSpeed;
  spaceshipMoveY += spaceshipPositionY * spaceshipSpeed;

  // screen limit
  const descontScreenLimit = 50;

  // X: left, right
  if (spaceshipMoveX < descontScreenLimit) {
    spaceshipMoveX = descontScreenLimit;
  } else if (spaceshipMoveX + descontScreenLimit > spaceContainerWidth) {
    spaceshipMoveX = spaceContainerWidth - descontScreenLimit;
  }

  // Y: top, bottom
  if (spaceshipMoveY < -descontScreenLimit) {
    spaceshipMoveY = -descontScreenLimit;
  } else if (
    spaceshipMoveY + spaceshipHeight + descontScreenLimit >
    spaceContainerHeight
  ) {
    spaceshipMoveY = spaceContainerHeight - spaceshipHeight - descontScreenLimit;
  }

  spaceship.style.left = spaceshipMoveX + "px";
  spaceship.style.bottom = spaceshipMoveY + "px";
}

function setPlayerName() {
  const storagePlayerName = localStorage.getItem("@spaceGame:playerName");

  playerName.innerHTML = storagePlayerName;
}

function setPlayerLife(damage) {
  if (damage) {
    const criticalDamage = Math.ceil(damage * (Math.random() + 1));
    life -= criticalDamage;
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

document.addEventListener("keydown", pressKey);
document.addEventListener("keyup", holdKey);

checkMoveSpaceship = setInterval(spaceshipMove, 20);

setPlayerName();
setPlayerLife(25);
setPlayerScore(150);
