const spaceContainer = document.querySelector(".spaceContainer");
const spaceship = document.querySelector(".spaceship");
const startGameButton = document.querySelector(".startGameButton");

const spaceContainerWidth = spaceContainer.offsetWidth;
const spaceContainerHeight = spaceContainer.offsetHeight;

const spaceshipWidth = spaceship.offsetWidth;
const spaceshipHeight = spaceship.offsetHeight;

const spaceshipSpeed = 10;

let spaceshipPositionX = 0;
let spaceshipPositionY = 0;
let spaceshipMoveX = spaceContainerWidth / 2;
let spaceshipMoveY = 0;

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
      break;
    case "ArrowRight":
      spaceshipPositionX = 1;
      break;
    default:
      break;
  }
};

const holdKey = (key) => {
  if (key.code == "ArrowUp" || key.code == "ArrowDown") {
    spaceshipPositionY = 0;
  }

  if (key.code == "ArrowLeft" || key.code == "ArrowRight") {
    spaceshipPositionX = 0;
  }
};

function spaceshipMove() {
  spaceshipMoveX += spaceshipPositionX * spaceshipSpeed;
  spaceshipMoveY += spaceshipPositionY * spaceshipSpeed;

  // screen limit
  const descontScreenLimit = 50;
  if (spaceshipMoveX < descontScreenLimit) {
    spaceshipMoveX = descontScreenLimit;
  } else if (spaceshipMoveX + descontScreenLimit > spaceContainerWidth) {
    spaceshipMoveX = spaceContainerWidth - descontScreenLimit;
  }

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

function startGame() {
  if (gameOver) {
    document.addEventListener("keyup", holdKey);
    document.addEventListener("keydown", pressKey);

    checkMoveSpaceship = setInterval(spaceshipMove, 20);

    startGameButton.style.display = "none";
  }

  gameOver = false;
}

let gameOver = true;
addEventListener("keypress", (key) => {
  if (key.code == "Enter") startGame();
});
