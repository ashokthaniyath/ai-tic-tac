const navbar = document.getElementById("navbar");
const page = document.getElementById("allContent");
const loader = document.getElementById("loader");
navbar.innerHTML = `<nav>
<div class="logo">
<img src="./images/tictactoe-logo.jpg" id="navlogo" alt="">
    <h6 id="logo"> X/O Game</h6>
</div>
<div class="toggle-btn">
<span class="bar"></span>
<span class="bar"></span>
<span class="bar"></span>
</div>
<div class="nav-links">
<ul id="myDIV">
    <li> <div class="toggle-switch">
      <label class="switch">
        <input id="lightmode-gen" value="on" type="checkbox" onclick="light_mode_activate()">
        <span class="slider round"></span>
    </label>
  </div></li>
    <li><a class="btn active" href="#home">Home</a></li>
    <li><a class="btn" href="#about-section">About</a></li>
    <li><a class="btn" id="gameBtn" href="#tictactoe">Game</a></li>
</ul>
</div>
</nav>`;

const toggleBtn = document.getElementsByClassName("toggle-btn")[0];
const navLinks = document.getElementsByClassName("nav-links")[0];
toggleBtn.addEventListener("click", () => {
  navLinks.classList.toggle("display");
});

window.onload = function () {
  loader.style.display = "none";
  page.style.display = "";
};

// Get the container element
var btnContainer = document.getElementById("myDIV");

// Get all buttons with class="btn" inside the container
var btns = btnContainer.getElementsByClassName("btn");

// Loop through the buttons and add the active class to the current/clicked button
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function() {
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
  });
}

// Scroll to the game section when clicking the "Game" button
document.getElementById("gameBtn").addEventListener("click", function(event) {
  event.preventDefault(); // Prevent default link behavior
  document.getElementById("sudoku").scrollIntoView({ behavior: "smooth" });
});

// Scrolling navbar activity
const li = document.querySelectorAll(".btn");
const sec = document.querySelectorAll("section");

function activeMenu(){
  let len = sec.length;
  while(--len && window.scrollY + 70 < sec[len].offsetTop){}
  li.forEach(ltx => ltx.classList.remove("active"));
  li[len].classList.add("active");
}
activeMenu();
window.addEventListener("scroll", activeMenu);


//Tica-Tac-Toe
class TicTacToe {
  constructor(size) {
      this.size = size;
      this.board = Array(size * size).fill(' ');
      this.currentPlayer = 'X';
  }

  makeMove(position) {
      if (this.board[position] === ' ') {
          this.board[position] = this.currentPlayer;
          this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
          return true;
      }
      return false;
  }

  //Check Winner
  checkWinner() {
    for (let i = 0; i < this.size; i++) {
        if (this.checkLine(i * this.size, 1, this.size)) {
            return this.board[i * this.size]; // Row winner
        }
        if (this.checkLine(i, this.size, this.size)) {
            return this.board[i]; // Column winner
        }
    }
    // Check diagonals
    if (this.checkLine(0, this.size + 1, this.size)) {
        return this.board[0]; // First diagonal winner
    }
    if (this.checkLine(this.size - 1, this.size - 1, this.size)) {
        return this.board[this.size - 1]; // Second diagonal winner
    }
    return null;
}

  checkLine(start, step, count) {
      const symbol = this.board[start];
      if (symbol === ' ') return false;
      for (let i = 0; i < count; i++) {
          if (this.board[start + i * step] !== symbol) return false;
      }
      return true;
  }

  isFull() {
      return !this.board.includes(' ');
  }

  getEmptyCells() {
      return this.board.map((cell, index) => cell === ' ' ? index : -1).filter(index => index !== -1);
  }

  evaluate() {
      const winner = this.checkWinner();
      if (winner === 'X') return 1;
      if (winner === 'O') return -1;
      return 0;
  }
}

function bdfAlgorithm(game, depth, maximizingPlayer) {
  if (depth === 0 || game.checkWinner() || game.isFull()) {
      return [game.evaluate(), null];
  }

  let bestValue = maximizingPlayer ? -Infinity : Infinity;
  let bestMove = null;

  for (const move of game.getEmptyCells()) {
      const simulatedGame = cloneGame(game); // Create a copy of the game state
      simulatedGame.makeMove(move);
      const [value] = bdfAlgorithm(simulatedGame, depth - 1, !maximizingPlayer);

      if (maximizingPlayer && value > bestValue) {
          bestValue = value;
          bestMove = move;
      } else if (!maximizingPlayer && value < bestValue) {
          bestValue = value;
          bestMove = move;
      }
  }

  return [bestValue, bestMove];
}

function cloneGame(game) {
  const clonedGame = new TicTacToe(game.size);
  clonedGame.board = [...game.board];
  clonedGame.currentPlayer = game.currentPlayer;
  return clonedGame;
}

let game;

function createBoard() {
  const size = parseInt(document.getElementById('board-size').value);
  game = new TicTacToe(size);
  const gameContainer = document.getElementById('game-container');
  gameContainer.innerHTML = '';
  const board = document.createElement('div');
  board.className = 'board';
  board.style.gridTemplateColumns = `repeat(${size}, 80px)`;

  for (let i = 0; i < size * size; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = i;
      cell.addEventListener('click', onCellClick);
      board.appendChild(cell);
  }

  gameContainer.appendChild(board);
  updateStatus('Player X\'s turn');
}

function onCellClick(event) {
  const index = parseInt(event.target.dataset.index);
  if (game.makeMove(index)) {
      updateBoard();
      const winner = game.checkWinner();
      if (winner) {
          endGame(`Player ${winner} wins!`);
      } else if (game.isFull()) {
          endGame("It's a tie!");
      } else {
          // AI's turn
          updateStatus('AI is thinking...');
          setTimeout(() => {
              const [, aiMove] = bdfAlgorithm(game, 5, false);
              game.makeMove(aiMove);
              updateBoard();
              const winner = game.checkWinner();
              if (winner) {
                  endGame(`Player ${winner} wins!`);
              } else if (game.isFull()) {
                  endGame("It's a tie!");
              } else {
                  updateStatus('Player X\'s turn');
              }
          }, 500);
      }
  }
}

function updateBoard() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, index) => {
      cell.textContent = game.board[index];
  });
}

function updateStatus(message) {
  document.getElementById('status').textContent = message;
}

function endGame(message) {
  updateStatus(message);
  document.querySelectorAll('.cell').forEach(cell => {
      cell.removeEventListener('click', onCellClick);
  });
}

document.getElementById('new-game').addEventListener('click', createBoard);
createBoard(); // Initialize the game