const spaceContainer = document.querySelector(".spaceContainer");
const spaceship = document.querySelector(".spaceship");
const playerName = document.querySelector(".name");
const playerLife = document.querySelector(".life");
const playerScore = document.querySelector(".score");
const gameOverButton = document.querySelector(".gameOver button");

const spaceContainerWidth = spaceContainer.offsetWidth;
const spaceContainerHeight = spaceContainer.offsetHeight;

const spaceshipWidth = spaceship.offsetWidth;
const spaceshipHeight = spaceship.offsetHeight;

const spaceshipSpeed = 10; // 1px to upper
const shotSpeed = 10; // shoots per second
const spaceshipDamage = 25; // -20 of life

let enemies = [];
let isGameOver = false;
let canShoot = true;
let shootPower = 25; // lifeEnemy-=shootPower
let positionX = 0;
let positionY = 0;
let moveX = spaceContainerWidth / 2;
let moveY = 0;
let enemyX = Math.random() * (spaceContainerWidth - spaceshipWidth);
let enemyY = 100;
let enemiesDifficulty = 1; // one by one
let life = 100;
let score = 0;
let explosionSoundVolume = 0.4;

function spaceshipMove() {
  if (isGameOver) return;

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
  if (canShoot) {
    const shot = document.createElement("div");
    shot.classList.add("shot");
    shot.style.left = moveX + "px";
    shot.style.bottom = moveY + spaceshipHeight + spaceshipHeight / 4 + "px";
    spaceContainer.appendChild(shot);

    const shootSound = new Audio("../audios/shoot.mp3");
    shootSound.play();

    canShoot = false;
    setTimeout(() => {
      canShoot = true;
    }, 1000 / shotSpeed);
  }
}

function spaceshipShoots() {
  const shoots = document.querySelectorAll(".shot");

  shoots.forEach((shot) => {
    let shotComputedStyle = getComputedStyle(shot);

    const yArray = shotComputedStyle.transform.split(",");
    const yString = yArray[yArray.length - 1];

    const x = Number(shotComputedStyle.left.replace("px", ""));
    const y = Number(yString.trim().replace(")", ""));

    // console.log({ x, y });

    shot.addEventListener("animationend", () => {
      shot.remove();
    });
  });

  requestAnimationFrame(spaceshipShoots);
}

class EnemySpaceship {
  constructor(enemyNumber) {
    // enemyNumber 1, 2 or 3
    this.life = enemyNumber * 100;
    this.points = enemyNumber * 250;
    this.flyCategory = (Math.random() - 0.5) * 3; // random negative/positive number
    this.x = 0;
    this.y = 0;
    this.baseX = Math.ceil(Math.random() * spaceContainerWidth - spaceshipWidth);
    this.speed = Math.ceil(Math.random() * 5 + 5) / 10; // add 5 in a range

    this.element = document.createElement("img");
    this.element.src = `../images/enemy${enemyNumber}.gif`;
    this.element.alt = `enemy${enemyNumber}.gif`;

    this.element.style.position = "absolute";
    this.element.style.top = "-100px";

    document.querySelector(".enemies").appendChild(this.element);
  }

  destroyEnemySpaceship() {
    this.element.src = `../images/explosion2.gif`;
    enemies = enemies.filter((enemy) => enemy != this);

    const explosionSound = new Audio("../audios/explosion1.mp3");
    explosionSound.volume = explosionSoundVolume;
    explosionSound.play();

    setTimeout(() => {
      this.element.remove();
    }, 1000);
  }

  fly() {
    this.y += this.speed;
    this.x =
      Math.cos((this.y / 100) * this.flyCategory) * 100 * this.flyCategory + this.baseX;
    this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;

    // if (this.y - spaceshipHeight / 2 > spaceContainerHeight || this.life <= 0) {
    //   this.destroyEnemySpaceship();
    //   setPlayerLife(10);
    // }

    if (this.y - spaceshipHeight > spaceContainerHeight || this.life <= 0) {
      this.element.remove();
    }
  }
}

function createEnemies() {
  const intervalID = setInterval(() => {
    let randomTypeEnemy = Math.ceil(Math.random() * 10);

    if (randomTypeEnemy < 5) {
      randomTypeEnemy = 1; // 50%
    } else if (randomTypeEnemy < 8) {
      randomTypeEnemy = 1; //30%
    } else if (randomTypeEnemy <= 10) {
      randomTypeEnemy = 2; //20%
    }

    console.log(randomTypeEnemy);

    enemies.push(new EnemySpaceship(randomTypeEnemy));
    enemiesDifficulty = score == 0 ? 1 : Math.ceil(score / 5000); // 1 more level for 5000 points

    if (isGameOver) clearInterval(intervalID);
  }, Math.random() * 1000 + 1000 / enemiesDifficulty);
}

function animateEnemies() {
  enemies.forEach((enemy) => {
    enemy.fly();
  });

  requestAnimationFrame(animateEnemies);
}

function collisionEnemiesShot() {
  const enemiesDOM = document.querySelectorAll(".enemies img");
  const shootsDOM = document.querySelectorAll(".shot");

  enemiesDOM.forEach((enemyDOM) => {
    const enemy = enemies.find((enemy) => enemy.element == enemyDOM);
    if (!enemy) return;

    shootsDOM.forEach((shotDOM) => {
      const shotRect = shotDOM.getBoundingClientRect();
      const enemyRect = enemyDOM.getBoundingClientRect();

      if (
        enemyRect.left < shotRect.right &&
        enemyRect.right > shotRect.left &&
        enemyRect.top < shotRect.bottom &&
        enemyRect.bottom > shotRect.top
      ) {
        shotDOM.remove();
        enemy.life -= Math.ceil(shootPower * (Math.random() + 1)); // ex: shootPower * 1.2

        setPlayerScore(10);
        if (enemy.life <= 0) {
          enemy.destroyEnemySpaceship();
          setPlayerScore(enemy.points);
        }
      }
    });
  });

  requestAnimationFrame(collisionEnemiesShot);
}

function collisionEnemiesWithSpaceship() {
  const enemiesDOM = document.querySelectorAll(".enemies img");
  const spaceshipRect = spaceship.getBoundingClientRect();

  enemiesDOM.forEach((enemyDOM) => {
    const enemy = enemies.find((enemy) => enemy.element == enemyDOM);
    if (!enemy) return;

    const enemyRect = enemyDOM.getBoundingClientRect();

    if (
      spaceshipRect.left + 20 < enemyRect.right &&
      spaceshipRect.right - 20 > enemyRect.left &&
      spaceshipRect.top + 40 < enemyRect.bottom &&
      spaceshipRect.bottom - 40 > enemyRect.top
    ) {
      const explosionSound = new Audio("../audios/explosion1.mp3");
      explosionSound.volume = explosionSoundVolume;
      explosionSound.play();

      enemy.destroyEnemySpaceship();

      setPlayerLife(spaceshipDamage);
    }
  });

  requestAnimationFrame(collisionEnemiesWithSpaceship);
}

function setPlayerName() {
  const storagePlayerName = localStorage.getItem("@spaceshipGame:playerName");

  playerName.innerHTML = storagePlayerName;
}

function setPlayerLife(damage) {
  if (damage) {
    const criticalDamage = Math.ceil(damage * (Math.random() + 1)); // ex: damage * 1.2
    life -= criticalDamage;
  } else {
    life -= 20;
  }

  if (life < 30) {
    playerLife.style.color = "red";
  }

  const hitSound = new Audio("../audios/hit.mp3");
  hitSound.volume = 0.8;
  hitSound.play();

  playerLife.innerHTML = `Nave ${life < 0 ? 0 : life}%`;

  if (life <= 0) {
    GameOver();
  }
}

function setPlayerScore(points) {
  score += points;
  playerScore.innerHTML = String(score).padStart(9, "0");
}

function gameControls(key) {
  switch (key.code) {
    case "Space":
      createShot();
      break;
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
    default:
      break;
  }
}

function gameControlsCancel(key) {
  switch (key.code) {
    case "Space":
      break;
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
    default:
      break;
  }
}

function saveUserScore({ name, score }) {
  const storageRank = JSON.parse(localStorage.getItem("@spaceshipGame:rank"));

  if (storageRank) {
    localStorage.setItem(
      "@spaceshipGame:rank",
      JSON.stringify([...storageRank, { name, score }])
    );
  } else {
    localStorage.setItem("@spaceshipGame:rank", JSON.stringify([{ name, score }]));
  }
}

function GameOver() {
  isGameOver = true;

  const gameOverElement = document.querySelector(".gameOver");
  gameOverElement.style.display = "flex";

  saveUserScore({ name: playerName.innerHTML, score });

  spaceship.style.backgroundImage = `url(../images/explosion2.gif)`;
  spaceship.style.backgroundSize = `contain`;
  spaceship.style.backgroundPosition = `center`;

  const explosionSound = new Audio("../audios/explosion2.mp3");
  explosionSound.volume = explosionSoundVolume;
  explosionSound.play();

  setTimeout(() => {
    spaceship.remove();
  }, 1000);
}

document.addEventListener("keydown", gameControls);
document.addEventListener("keyup", gameControlsCancel);

gameOverButton.addEventListener("click", () => {
  window.location.replace("/");
});

const startSound = new Audio("../audios/aero-fighters.mp3");
startSound.loop = true;
startSound.volume = 1;
startSound.play();

const nextLevelSound = new Audio("../audios/next_level.mp3");
nextLevelSound.volume = 1;
nextLevelSound.play();

spaceshipMove();
spaceshipShoots();
createEnemies();
animateEnemies();
collisionEnemiesShot();
collisionEnemiesWithSpaceship();
setPlayerName();
