import * as PIXI from 'pixi.js';
import { Engine } from './Engine';

class GameUI {
  constructor() {
    this.scoreBoard = document.getElementById('score-board');
    this.highScoreBoard = document.getElementById('high-score');
    this.startScreen = document.getElementById('start-screen');
    this.gameOverScreen = document.getElementById('game-over');
    this.finalScore = document.getElementById('final-score');
    this.startBtn = document.getElementById('start-btn');
    this.restartBtn = document.getElementById('restart-btn');

    // Load high score from localStorage
    this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
    this.updateHighScore();
  }

  updateScore(score) {
    this.scoreBoard.innerText = `Score: ${score}`;

    // Update high score if current score is higher
    if (score > this.highScore) {
      this.highScore = score;
      localStorage.setItem('highScore', score);
      this.updateHighScore();
    }
  }

  updateHighScore() {
    this.highScoreBoard.innerText = `High Score: ${this.highScore}`;
  }

  showStartScreen() {
    this.startScreen.classList.remove('hidden');
  }

  hideStartScreen() {
    this.startScreen.classList.add('hidden');
  }

  showGameOver(score) {
    this.gameOverScreen.classList.remove('hidden');
    this.finalScore.innerText = `Final Score: ${score}`;
  }

  hideGameOver() {
    this.gameOverScreen.classList.add('hidden');
  }
}

async function init() {
  const canvas = document.getElementById('game-canvas');
  const container = document.getElementById('game-container');

  const app = new PIXI.Application();
  await app.init({
    view: canvas,
    resizeTo: container,
    backgroundAlpha: 0, // Let the CSS gradient show through
    antialias: true
  });

  // Load assets before starting
  PIXI.Assets.add({ alias: 'background', src: '/assets/background.png' });
  PIXI.Assets.add({ alias: 'lion', src: '/assets/lion.png' });
  PIXI.Assets.add({ alias: 'hunter', src: '/assets/hunter.png' });
  PIXI.Assets.add({ alias: 'arrow', src: '/assets/arrow.png' });
  PIXI.Assets.add({ alias: 'cub', src: '/assets/cub.png' });
  PIXI.Assets.add({ alias: 'tree', src: '/assets/tree.png' });
  PIXI.Assets.add({ alias: 'rock', src: '/assets/rock.png' });
  PIXI.Assets.add({ alias: 'water', src: '/assets/water-pond.png' });
  PIXI.Assets.add({ alias: 'monkey', src: '/assets/monkey.png' });
  PIXI.Assets.add({ alias: 'yellow-monkey', src: '/assets/yellow-monkey.png' });

  // Parrot animation frames
  PIXI.Assets.add({ alias: 'p1-a', src: '/assets/p1-a.png' });
  PIXI.Assets.add({ alias: 'p1-b', src: '/assets/p1-b.png' });
  PIXI.Assets.add({ alias: 'p1-c', src: '/assets/p1-c.png' });
  PIXI.Assets.add({ alias: 'p1-d', src: '/assets/p1-d.png' });
  PIXI.Assets.add({ alias: 'p1-e', src: '/assets/p1-e.png' });
  PIXI.Assets.add({ alias: 'p1-f', src: '/assets/p1-f.png' });
  PIXI.Assets.add({ alias: 'p1-g', src: '/assets/p1-g.png' });
  PIXI.Assets.add({ alias: 'p1-h', src: '/assets/p1-h.png' });

  await PIXI.Assets.load(['background', 'lion', 'hunter', 'arrow', 'cub', 'tree', 'rock', 'water', 'monkey', 'yellow-monkey', 'p1-a', 'p1-b', 'p1-c', 'p1-d', 'p1-e', 'p1-f', 'p1-g', 'p1-h']);

  const ui = new GameUI();
  const engine = new Engine(app, ui);

  ui.startBtn.onclick = () => engine.start();
  ui.restartBtn.onclick = () => {
    engine.reset();
    engine.start();
  };

  app.ticker.add((ticker) => {
    engine.update(ticker.deltaTime);
  });
}

init();
