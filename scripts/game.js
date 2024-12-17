const spaceContainer = document.querySelector(".spaceContainer");
const spaceship = document.querySelector(".spaceship");
const playerName = document.querySelector(".playerName");
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
const timeToEndSpecialShot = 30 * 1000; // 30000ms (30s) to the end

let positionX = 0;
let positionY = 0;
let moveX = spaceContainerWidth / 2;
let moveY = 0;

let canShoot = true;
let specialShotIsActive = false;
let shootPower = 25; // lifeEnemy-=shootPower

let enemies = [];
let enemyX = 0;
let enemyY = 0;
let totalEnemiesDestroyed = 0;

let isGameOver = false;
let life = 100;
let score = 0;
let explosionSoundVolume = 0.4;
let gameLevel = 1;

function spaceshipMove() {
  if (isGameOver) return;

  moveX += positionX * spaceshipSpeed;
  moveY += positionY * spaceshipSpeed;

  const discountScreenLimit = spaceshipWidth / 2;

  // limit X: left, right
  moveX = Math.max(
    discountScreenLimit,
    Math.min(moveX, spaceContainerWidth - discountScreenLimit)
  );

  // limit Y: top, bottom
  moveY = Math.max(
    -discountScreenLimit,
    Math.min(moveY, spaceContainerHeight - spaceshipHeight - discountScreenLimit)
  );

  spaceship.style.left = moveX - discountScreenLimit + "px";
  spaceship.style.bottom = moveY + discountScreenLimit + "px";

  requestAnimationFrame(spaceshipMove);
}

function createShot(className = "shot") {
  if (canShoot && !isGameOver) {
    const shot = document.createElement("div");
    shot.classList.add(className);

    const adjustShotCenter = 0.75;

    if (specialShotIsActive) {
      shot.classList.add("specialShot");
      const shootSound = new Audio("../audios/shootSpecial.mp3");
      shootSound.volume = 0.3;
      shootSound.play();

      shot.style.left = moveX + adjustShotCenter + "px";
      shot.style.bottom = moveY + spaceshipHeight + spaceshipHeight / 20 + "px";
    } else {
      const shootSound = new Audio("../audios/shoot.mp3");
      shootSound.volume = 1;
      shootSound.play();

      shot.style.left = moveX + adjustShotCenter + "px";
      shot.style.bottom = moveY + spaceshipHeight + spaceshipHeight / 4 + "px";
    }

    spaceContainer.appendChild(shot);

    canShoot = false;
    setTimeout(() => {
      canShoot = true;
    }, 1000 / shotSpeed);
  }
}

function spaceshipShootsRemove() {
  shoots = document.querySelectorAll(".shot");

  shoots.forEach((shot) => {
    shot.addEventListener("animationend", () => {
      shot.remove();
    });
  });

  requestAnimationFrame(spaceshipShootsRemove);
}

class EnemySpaceship {
  constructor(enemyNumber = 1, src, alt, className) {
    this.enemyNumber = enemyNumber; // 1, 2 , 3 or specialCharge
    this.life = enemyNumber == 1 ? 100 : enemyNumber == 2 ? 300 : 600;
    this.points = enemyNumber == 1 ? 250 : enemyNumber == 2 ? 500 : 1000; // to score
    this.damage = enemyNumber == 1 ? 20 : enemyNumber == 2 ? 30 : 50;
    this.flyCategory = (Math.random() - 0.5) * 5; // random negative/positive number
    this.x = 0;
    this.y = 0;
    this.baseX = Math.ceil(Math.random() * spaceContainerWidth - spaceshipWidth);
    this.speed = Math.ceil(Math.random() * 5 + 5) / 20 + gameLevel / 10; // add 5 in a range
    this.offScreenTopElementDiscount = 200; // px
    this.#createElement(src, alt, className);
  }

  #createElement(src, alt, className) {
    this.element = document.createElement("img");
    this.element.src = src;
    this.element.alt = alt;
    this.element.className = className;

    this.element.style.position = "absolute";
    this.element.style.top = `-${this.offScreenTopElementDiscount}px`;

    document.querySelector(".enemies").appendChild(this.element);
  }

  fly() {
    this.y += this.speed;
    this.x =
      ((Math.cos((this.y / 100) * this.flyCategory) * totalEnemiesDestroyed * 100) /
        100) *
        this.flyCategory +
      this.baseX;

    this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;

    if (this.y - this.offScreenTopElementDiscount > spaceContainerHeight) {
      this.element.remove();
    }
  }

  destroyEnemySpaceship() {
    totalEnemiesDestroyed++;

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
  const randomInterval = Math.max(Math.random() * 1000 + 2000 - score / 100, 500);

  setTimeout(() => {
    let randomEnemyType = Math.ceil(Math.random() * 100);

    if (randomEnemyType <= 50) {
      randomEnemyType = 1; // 50%
    } else if (randomEnemyType <= 80) {
      randomEnemyType = 2; // 30%
    } else if (randomEnemyType <= 95) {
      randomEnemyType = 3; // 15%
    } else if (randomEnemyType <= 100) {
      enemies.push(
        new SpecialCharge(1, `../images/logo-rj.png`, `logo-rj`, `chargeSpecialShot`)
      ); // 5%

      if (!isGameOver) createEnemies();
      return;
    }

    enemies.push(
      new EnemySpaceship(
        randomEnemyType,
        `../images/enemy${randomEnemyType}.gif`,
        `enemy${randomEnemyType}`,
        `enemy${randomEnemyType}`
      )
    );

    if (!isGameOver) createEnemies();
  }, randomInterval);
}

function animateFlyEnemies() {
  enemies.forEach((enemy) => {
    enemy.fly();
  });

  requestAnimationFrame(animateFlyEnemies);
}

function collisionEnemiesShot() {
  const enemiesDOM = document.querySelectorAll(".enemies img");
  const shootsDOM = document.querySelectorAll(".shot");

  enemiesDOM.forEach((enemyDOM) => {
    const enemy = enemies.find((enemy) => enemy.element == enemyDOM);
    if (!enemy) return;

    if (enemy.element.className == "chargeSpecialShot") return;

    shootsDOM.forEach((shootDOM) => {
      const shootRect = shootDOM.getBoundingClientRect();
      const enemyRect = enemyDOM.getBoundingClientRect();

      let discountCollision = enemy.enemyNumber == 3 ? 40 : 10;

      if (
        enemyRect.left < shootRect.right &&
        enemyRect.right > shootRect.left &&
        enemyRect.top + discountCollision < shootRect.bottom &&
        enemyRect.bottom - discountCollision > shootRect.top
      ) {
        shootDOM.remove();
        enemy.life -= Math.ceil(shootPower * (Math.random() + 1)); // ex: shootPower * 1.2
        setPlayerScoreAndLevelGame(specialShotIsActive ? 20 : 10);

        if (enemy.life <= 0) {
          enemy.destroyEnemySpaceship();
          setPlayerScoreAndLevelGame(enemy.points);
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
        setPlayerScoreAndLevelGame(2000);
        enemy.removeElement();

        setTimeout(() => {
          specialShotIsActive = false;
          shootPower = 25;
        }, timeToEndSpecialShot);
      } else {
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

function setPlayerScoreAndLevelGame(points) {
  score += points;
  playerScore.innerHTML = String(score).padStart(9, "0");

  const calcLevel = Math.max(Math.floor(score / 10000), 1); // one more level each 10000 points

  if (calcLevel > gameLevel) {
    gameLevel++;
  }
}

function setPlayerDamage(damage) {
  const hitSound = new Audio("../audios/hit.mp3");
  hitSound.volume = 0.8;
  hitSound.play();

  if (damage) {
    const criticalDamage = Math.ceil(damage * (Math.random() + 1)); // ex: damage * 1.2
    life -= criticalDamage;
  } else {
    life -= 20;
  }

  if (life <= 30) {
    playerLife.style.color = "red";
  }

  playerLife.innerHTML = `Nave ${life < 0 ? 0 : life}%`;

  if (life <= 0) {
    GameOver();
  }
}

function saveUserScore({ name, score }) {
  const storageRank = JSON.parse(localStorage.getItem("@spaceshipGame:rank"));

  let rankSorted;
  if (storageRank) {
    rankSorted = [...storageRank, { name, score }]
      .sort((a, b) => b.score - a.score)
      .filter((_rank, index) => index < 20);

    localStorage.setItem("@spaceshipGame:rank", JSON.stringify([...rankSorted]));
  } else {
    localStorage.setItem("@spaceshipGame:rank", JSON.stringify([{ name, score }]));
  }
}

function GameOver() {
  isGameOver = true;

  const gameOverElement = document.querySelector(".gameOver");
  gameOverElement.style.display = "flex";

  const explosionSound = new Audio("../audios/explosion2.mp3");
  explosionSound.volume = explosionSoundVolume;
  explosionSound.play();

  spaceship.style.backgroundImage = `url(../images/explosion2.gif)`;

  setTimeout(() => {
    spaceship.remove();
  }, 1000);

  saveUserScore({ name: playerName.innerHTML, score });
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

document.addEventListener("keydown", gameControls);
document.addEventListener("keyup", gameControlsCancel);

gameOverButton.addEventListener("click", () => {
  window.history.back();
});

const startSound = new Audio("../audios/aero-fighters.mp3");
startSound.loop = true;
startSound.volume = 0;
startSound.play();

const nextLevelSound = new Audio("../audios/next_level.mp3");
nextLevelSound.volume = 1;
nextLevelSound.play();

spaceshipMove();
spaceshipShootsRemove();
createEnemies();
animateFlyEnemies();
collisionEnemiesShot();
collisionEnemiesWithSpaceship();
setPlayerName();
