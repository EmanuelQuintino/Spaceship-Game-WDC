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

const spaceshipSpeed = 10; // px to upper
const shotSpeed = 10; // shoots per second
const spaceshipDamage = 25; // -25 per shot
const timeToSpecialShot = 30 * 1000; // 30000ms to the end

let enemies = [];
let isGameOver = false;
let life = 100;
let score = 0;
let explosionSoundVolume = 0.4;

let canShoot = true;
let specialShotIsActive = false;
let shootPower = 25; // lifeEnemy-=shootPower

let positionX = 0;
let positionY = 0;
let moveX = spaceContainerWidth / 2;
let moveY = 0;

let enemyX = Math.random() * (spaceContainerWidth - spaceshipWidth);
let enemyY = 100;
let enemiesDifficultyLevel = 1;
let pointsToIncrementDifficultyLevel = 1000; // 1 more level for each step points

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

function createShot(className = "shot") {
  if (canShoot) {
    const shot = document.createElement("div");
    shot.classList.add(className);

    if (specialShotIsActive) {
      shot.classList.add("specialShot");
      const shootSound = new Audio("../audios/shootSpecial.mp3");
      shootSound.volume = 0.3;
      shootSound.play();

      shot.style.left = moveX + "px";
      shot.style.bottom = moveY + spaceshipHeight + spaceshipHeight / 8 + "px";
    } else {
      const shootSound = new Audio("../audios/shoot.mp3");
      shootSound.volume = 1;
      shootSound.play();

      shot.style.left = moveX + "px";
      shot.style.bottom = moveY + spaceshipHeight + spaceshipHeight / 4 + "px";
    }

    spaceContainer.appendChild(shot);

    canShoot = false;
    setTimeout(() => {
      canShoot = true;
    }, 1000 / shotSpeed);
  }
}

function spaceshipShoots() {
  shoots = document.querySelectorAll(".shot");

  shoots.forEach((shot) => {
    shot.addEventListener("animationend", () => {
      shot.remove();
    });
  });

  requestAnimationFrame(spaceshipShoots);
}

class EnemySpaceship {
  constructor(enemyNumber = 1, src, alt, className) {
    this.enemyNumber = enemyNumber; // 1, 2 , 3 or specialCharge
    this.life = enemyNumber == 1 ? 100 : enemyNumber == 2 ? 300 : 600;
    this.points = enemyNumber == 1 ? 250 : enemyNumber == 2 ? 500 : 1000; // to score
    this.damage = enemyNumber == 1 ? 20 : enemyNumber == 2 ? 30 : 50;
    this.flyCategory = (Math.random() - 0.5) * 3; // random negative/positive number
    this.x = 0;
    this.y = 0;
    this.baseX = Math.ceil(Math.random() * spaceContainerWidth - spaceshipWidth);
    this.speed = (Math.ceil(Math.random() * 5 + 5) / 10) * enemiesDifficultyLevel; // add 5 in a range
    this.offScreenElementDiscount = 200; // px
    this.#createElement(src, alt, className);
  }

  #createElement(src, alt, className) {
    this.element = document.createElement("img");
    this.element.src = src;
    this.element.alt = alt;
    this.element.className = className;

    this.element.style.position = "absolute";
    this.element.style.top = `-${this.offScreenElementDiscount}px`;

    document.querySelector(".enemies").appendChild(this.element);
  }

  destroyEnemySpaceship() {
    this.element.src = `../images/explosion2.gif`;
    enemies = enemies.filter((enemy) => enemy != this);

    let explosionSound;
    if (this.enemyNumber == 3) {
      explosionSound = new Audio("../audios/explosion2.mp3");
    } else {
      explosionSound = new Audio("../audios/explosion1.mp3");
    }

    explosionSound.volume = explosionSoundVolume;
    explosionSound.play();

    setTimeout(() => {
      this.element.remove();
    }, 1000);
  }

  fly() {
    this.y += this.speed;
    this.x =
      ((Math.cos((this.y / 100) * this.flyCategory) * score) / 100) * this.flyCategory +
      this.baseX;
    this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;

    if (this.y - this.offScreenElementDiscount > spaceContainerHeight || this.life <= 0) {
      this.element.remove();
    }
  }
}

class SpecialCharge extends EnemySpaceship {
  constructor(enemyNumber, src, alt, className) {
    super(enemyNumber, src, alt, className);
  }

  removeElement() {
    enemies = enemies.filter((enemy) => enemy != this);
    this.element.remove();
  }
}

function createEnemies() {
  enemiesDifficultyLevel =
    score == 0 ? 1 : Math.ceil(score / pointsToIncrementDifficultyLevel);

  const downIntervalTime = Math.max(
    500,
    Math.random() * 1000 + 1000 / enemiesDifficultyLevel
  );

  const intervalID = setInterval(() => {
    let randomTypeEnemy = Math.ceil(Math.random() * 100);
    if (randomTypeEnemy <= 50) {
      randomTypeEnemy = 1; // 50%
    } else if (randomTypeEnemy <= 80) {
      randomTypeEnemy = 2; // 30%
    } else if (randomTypeEnemy <= 95) {
      randomTypeEnemy = 3; // 15%
    } else if (randomTypeEnemy <= 100) {
      enemies.push(
        new SpecialCharge(1, `../images/logo-rj.png`, `logo-rj`, `chargeSpecialShot`)
      ); // 5%
      return;
    }

    enemies.push(
      new EnemySpaceship(
        randomTypeEnemy,
        `../images/enemy${randomTypeEnemy}.gif`,
        `enemy${randomTypeEnemy}`,
        `enemy${randomTypeEnemy}`
      )
    );

    if (isGameOver) clearInterval(intervalID);
  }, downIntervalTime);
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

    if (enemy.element.className == "chargeSpecialShot") return;

    shootsDOM.forEach((shotDOM) => {
      const shotRect = shotDOM.getBoundingClientRect();
      const enemyRect = enemyDOM.getBoundingClientRect();

      let discountCollision = enemy.enemyNumber == 3 ? 40 : 10;

      if (
        enemyRect.left < shotRect.right &&
        enemyRect.right > shotRect.left &&
        enemyRect.top + discountCollision < shotRect.bottom &&
        enemyRect.bottom - discountCollision > shotRect.top
      ) {
        shotDOM.remove();
        enemy.life -= Math.ceil(shootPower * (Math.random() + 1)); // ex: shootPower * 1.2

        setPlayerScore(specialShotIsActive ? 20 : 10);
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

    let discountCollision = enemy.enemyNumber == 3 ? 40 : 20;

    if (
      spaceshipRect.left + discountCollision < enemyRect.right &&
      spaceshipRect.right - discountCollision > enemyRect.left &&
      spaceshipRect.top + discountCollision * 2 < enemyRect.bottom &&
      spaceshipRect.bottom - discountCollision * 2 > enemyRect.top
    ) {
      if (enemy.element.className == "chargeSpecialShot") {
        const chargeSpecialShotSound = new Audio("../audios/next_level.mp3");
        chargeSpecialShotSound.volume = 1;
        chargeSpecialShotSound.play();

        specialShotIsActive = true;
        shootPower = 100;
        // setPlayerLife(100);
        setPlayerScore(2000);
        enemy.removeElement();

        setTimeout(() => {
          specialShotIsActive = false;
          shootPower = 25;
        }, timeToSpecialShot);
      } else {
        const explosionSound = new Audio("../audios/explosion1.mp3");
        explosionSound.volume = explosionSoundVolume;
        explosionSound.play();

        enemy.destroyEnemySpaceship();

        setPlayerDamage(enemy.damage);
      }
    }
  });

  requestAnimationFrame(collisionEnemiesWithSpaceship);
}

function setPlayerName() {
  const storagePlayerName = localStorage.getItem("@spaceshipGame:playerName");

  playerName.innerHTML = storagePlayerName;
}

function setPlayerLife(lifePoints) {
  life = lifePoints;
  playerLife.innerHTML = `Nave ${life}%`;

  if (life < 30) {
    playerLife.style.color = "red";
  } else {
    playerLife.style.color = "var(--color-light-200)";
  }
}

function setPlayerDamage(damage) {
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
