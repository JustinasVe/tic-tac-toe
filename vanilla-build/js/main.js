import View from "./view.js";
import Store from "./store.js";

const players = [
  {
    id: 1,
    name: "Player 1",
    iconClass: "ph-x",
    colorClass: "yellow",
  },
  {
    id: 2,
    name: "Player 2",
    iconClass: "ph-circle",
    colorClass: "turquoise",
  },
];

function init() {
  const view = new View();
  const store = new Store("tic-tac-toe-storage-key", players);

  window.addEventListener("storage", () => {
    console.log("State changed from another tab");
    view.render(store.game, store.stats);
  });

  view.render(store.game, store.stats);

  view.bindGameResetEvent((event) => {
    store.reset();
    view.render(store.game, store.stats);
  });

  view.bindNewRoundEvent((event) => {
    store.newRound();
    view.render(store.game, store.stats);
  });

  view.bindPlayerMoveEvent((square) => {
    const existingMove = store.game.moves.find(
      (move) => move.squareId === +square.id
    );

    if (existingMove) {
      return;
    }

    // Advance to the next state by pushing a move to the moves array
    store.playerMove(+square.id);

    view.render(store.game, store.stats);
  });
}

window.addEventListener("load", init);
