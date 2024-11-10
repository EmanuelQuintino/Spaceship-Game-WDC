function backPage() {
  window.history.back();
}

function createBodyTableRank() {
  const storageRank = JSON.parse(localStorage.getItem("@spaceGame:rank"));

  let rankSorted;
  if (storageRank) {
    rankSorted = storageRank
      .sort((a, b) => {
        if (a.time > b.time) return 1;
        if (a.time < b.time) return -1;
        return 0;
      })
      .filter((_rank, index) => index < 10);
  }

  bodyTableRank.innerHTML = "";
  for (let i = 0; i < 10; i++) {
    bodyTableRank.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${rankSorted ? rankSorted[i]?.name || "" : ""}</td>
        <td>${rankSorted ? rankSorted[i]?.score || "" : ""}</td>
      </tr>
    `;
  }
}

const backButton = document.querySelector(".backButton");
const bodyTableRank = document.querySelector(".tableRank tbody");

backButton.addEventListener("click", backPage);

createBodyTableRank();
