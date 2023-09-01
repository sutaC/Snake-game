import { GraphicEngine, GameEngine, Direction } from "./modules/snake-game.js";
import SwipeDetector from "./modules/swipe-detector.js";
// Elements
const canvas = document.querySelector("#game");
const dialog = document.querySelector("#game-dialog");
const btnPause = document.querySelector("#btn-pause");
const btnPlay = document.querySelector("#btn-play");
const btnReset = document.querySelector("#btn-reset");
const pScore = document.querySelector("#score");
const pBestScore = document.querySelector("#best-score");
const imgIllustration = document.querySelector("#illustration");
const h2DialogHeader = document.querySelector("#dialogHeader");
// Game setup
if (!canvas) {
    throw new Error("Could not connect to Canvas");
}
canvas.width = window.innerWidth;
canvas.height = window.innerWidth;
const renderingEngine = new GraphicEngine(canvas);
const gameEngine = new GameEngine(renderingEngine);
const swipeDetector = new SwipeDetector(document.body);
// Modal illustrations
var Illustration;
(function (Illustration) {
    Illustration["win"] = "./images/drawings/illustration-win.png";
    Illustration["pause"] = "./images/drawings/illustration-pause.png";
    Illustration["lose"] = "./images/drawings/illustration-lose.png";
})(Illustration || (Illustration = {}));
// Buttons
if (btnPause && dialog && imgIllustration && h2DialogHeader) {
    btnPause.addEventListener("click", () => {
        gameEngine.pauseGame(true);
        h2DialogHeader.textContent = "Pause";
        imgIllustration.src = Illustration.pause;
        dialog.showModal();
    });
}
if (btnPlay && dialog) {
    btnPlay.addEventListener("click", () => {
        gameEngine.pauseGame(false);
        dialog.close();
        dialog.classList.remove("gameStart");
    });
}
if (btnReset && dialog && pScore) {
    btnReset.addEventListener("click", () => {
        dialog.close();
        dialog.classList.remove("gameOver");
        pScore.textContent = `Score 0`;
        gameEngine.reset();
    });
}
// Controls
window.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "ArrowRight":
            gameEngine.changeDirection(Direction.Right);
            break;
        case "ArrowLeft":
            gameEngine.changeDirection(Direction.Left);
            break;
        case "ArrowUp":
            gameEngine.changeDirection(Direction.Up);
            break;
        case "ArrowDown":
            gameEngine.changeDirection(Direction.Down);
            break;
        case "Escape":
            event.preventDefault();
        default:
            return;
    }
    event.preventDefault();
});
swipeDetector.element.addEventListener("swipe", (event) => {
    switch (event.detail.direction) {
        case "right":
            gameEngine.changeDirection(Direction.Right);
            break;
        case "left":
            gameEngine.changeDirection(Direction.Left);
            break;
        case "up":
            gameEngine.changeDirection(Direction.Up);
            break;
        case "down":
            gameEngine.changeDirection(Direction.Down);
            break;
    }
});
//  Score
let bestScore = 0;
if (pScore && pBestScore) {
    canvas.addEventListener("scoreupdate", (event) => {
        const { score } = event.detail;
        pScore.textContent = `Score ${score ?? 0}`;
        if (score > bestScore) {
            bestScore = score;
            pBestScore.textContent = `Best Score ${score ?? 0}`;
        }
    });
}
// Game Over
if (dialog && imgIllustration && h2DialogHeader) {
    canvas.addEventListener("gameover", (event) => {
        const { win } = event.detail;
        if (win) {
            imgIllustration.src = Illustration.win;
            h2DialogHeader.textContent = "You Win!";
        }
        else {
            imgIllustration.src = Illustration.lose;
            h2DialogHeader.textContent = "You Lose!";
        }
        dialog.classList.add("gameOver");
        dialog.showModal();
    });
}
// Game Start
if (dialog) {
    dialog.classList.add("gameStart");
    dialog.showModal();
}
