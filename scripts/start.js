function handleSubmitNewGame(event) {
  event.preventDefault();
  localStorage.setItem("@spaceGame:playerName", inputName.value);
  inputName.value = "";
  window.location.href = "pages/game.html";
}

function navigateToRank() {
  window.location.href = "pages/rank.html";
}

const inputName = document.querySelector("#name");
const newGameForm = document.querySelector("#newGameForm");
const buttonRank = document.querySelector(".buttonRank");

newGameForm.addEventListener("submit", handleSubmitNewGame);
buttonRank.addEventListener("click", navigateToRank);
