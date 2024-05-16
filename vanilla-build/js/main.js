import View from "./view.js";
import Store from "./store.js";

const App = {
  // All of our selected HTML elements
  $: {
    menu: document.querySelector('[data-id="menu"]'),
    menuItems: document.querySelector('[data-id="menu-items"]'),
    resetBtn: document.querySelector('[data-id="reset-btn"]'),
    newRoundBtn: document.querySelector('[data-id="new-round-btn"]'),
    squares: document.querySelectorAll('[data-id="square"]'),
    modal: document.querySelector('[data-id="modal"]'),
    modalText: document.querySelector('[data-id="modal-text"]'),
    modalBtn: document.querySelector('[data-id="modal-btn"]'),
    turn: document.querySelector('[data-id="turn"]'),
  },

  state: {
    moves: [],
  },

  getGameStatus(moves) {
    const p1Moves = moves
      .filter((move) => move.playerId === 1)
      .map((move) => +move.squareId);
    const p2Moves = moves
      .filter((move) => move.playerId === 2)
      .map((move) => +move.squareId);

    const winningPatterns = [
      [1, 2, 3],
      [1, 5, 9],
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
      [3, 5, 7],
      [4, 5, 6],
      [7, 8, 9],
    ];

    let winner = null;

    winningPatterns.forEach((pattern) => {
      const p1Wins = pattern.every((value) => p1Moves.includes(value));
      const p2Wins = pattern.every((value) => p2Moves.includes(value));

      if (p1Wins) winner = 1;
      if (p2Wins) winner = 2;
    });

    return {
      status: moves.length === 9 || winner != null ? "complete" : "in-progress",
      winner: winner,
    };
  },

  init() {
    App.registerEventListeners();
  },

  registerEventListeners() {
    App.$.menu.addEventListener("click", (event) => {
      App.$.menuItems.classList.toggle("hidden");
    });

    App.$.resetBtn.addEventListener("click", (event) => {
      console.log("Reset the game");
    });

    App.$.newRoundBtn.addEventListener("click", (event) => {
      console.log("Add a new round");
    });

    App.$.modalBtn.addEventListener("click", (event) => {
      App.state.moves = [];
      App.$.squares.forEach((square) => square.replaceChildren());
      App.$.modal.classList.add("hidden");
    });

    App.$.squares.forEach((square) => {
      square.addEventListener("click", (event) => {
        // Check if there is already a play, if so, return early
        const hasMove = (squareId) => {
          const existingMove = App.state.moves.find(
            (move) => move.squareId === squareId
          );
          return existingMove !== undefined;
        };

        if (hasMove(+square.id)) {
          return;
        }

        // Determine which player icon to add to the square
        const lastMove = App.state.moves.at(-1);
        const getOppositePlayer = (playerId) => (playerId === 1 ? 2 : 1);
        const currentPlayer =
          App.state.moves.length === 0
            ? 1
            : getOppositePlayer(lastMove.playerId);

        const nextPlayer = getOppositePlayer(currentPlayer);

        const squareIcon = document.createElement("i");
        const turnIcon = document.createElement("i");
        const turnLabel = document.createElement("p");
        turnLabel.innerText = `Player ${nextPlayer} you are up!`;

        if (currentPlayer === 1) {
          squareIcon.classList.add("ph-bold", "ph-x", "yellow");
          turnIcon.classList.add("ph-bold", "ph-circle", "turquoise");
          turnLabel.classList.add("turquoise");
        } else {
          squareIcon.classList.add("ph-bold", "ph-circle", "turquoise");
          turnIcon.classList.add("ph-bold", "ph-x", "yellow");
          turnLabel.classList.add("yellow");
        }

        App.$.turn.replaceChildren(turnIcon, turnLabel);

        App.state.moves.push({
          squareId: +square.id,
          playerId: currentPlayer,
        });

        square.replaceChildren(squareIcon);

        // Check if there is a winner or tie game
        const game = App.getGameStatus(App.state.moves);

        if (game.status === "complete") {
          App.$.modal.classList.remove("hidden");

          let message = "";
          if (game.winner) {
            message = `Player ${game.winner} wins!`;
          } else {
            message = "Tie game!";
          }

          App.$.modalText.textContent = message;
        }
      });
    });
  },
};

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
  const store = new Store(players);

  view.bindGameResetEvent((event) => {
    view.closeAll();

    store.reset();

    view.clearMoves();
    view.setTurnIndicator(store.game.currentPlayer);
    view.updateScoreboard(
      store.stats.playerWithStats[0].wins,
      store.stats.playerWithStats[1].wins,
      store.stats.ties
    );
  });

  view.bindNewRoundEvent((event) => {
    store.newRound();

    view.closeAll();
    view.clearMoves();
    view.setTurnIndicator(store.game.currentPlayer);
    view.updateScoreboard(
      store.stats.playerWithStats[0].wins,
      store.stats.playerWithStats[1].wins,
      store.stats.ties
    );
  });

  view.bindPlayerMoveEvent((square) => {
    const existingMove = store.game.moves.find(
      (move) => move.squareId === +square.id
    );

    if (existingMove) {
      return;
    }

    // Place an icon of the CURRENT player in a square
    view.handlePlayerMove(square, store.game.currentPlayer);

    // Advance to the next state by pushing a move to the moves array
    store.playerMove(+square.id);

    if (store.game.status.isComplete) {
      view.openModal(
        store.game.status.winner
          ? `${store.game.status.winner.name} wins!`
          : "Tie!"
      );

      return;
    }

    // Set the NEXT player's turn indicator
    view.setTurnIndicator(store.game.currentPlayer); // Since the playerMove() method has updated the current player, store.game.currentPlayer now refers to a different player than the one used in the handlePlayerMove() method.
  });
}

window.addEventListener("load", init);
