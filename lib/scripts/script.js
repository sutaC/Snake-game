import { GraphicEngine, GameEngine, Direction } from "../modules/snake-game.js";
import SwipeDetector from "../modules/swipe-detector.js";
const canvas = document.querySelector("#game");
const btnPause = document.querySelector("#pause");
const pScore = document.querySelector("#score");
if (!canvas) {
    throw new Error("Could not connect to Canvas");
}
canvas.width = window.innerWidth;
canvas.height = window.innerWidth;
const renderingEngine = new GraphicEngine(canvas);
const gameEngine = new GameEngine(renderingEngine);
const swipeDetector = new SwipeDetector(document.body);
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
            gameEngine.pauseGame();
            break;
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
if (btnPause) {
    btnPause.addEventListener("click", () => {
        gameEngine.pauseGame();
    });
}
if (pScore) {
    canvas.addEventListener("scoreupdate", (event) => {
        const { score } = event.detail;
        pScore.textContent = `Score: ${score ?? 0}`;
    });
    canvas.addEventListener("gameover", (event) => {
        pScore.textContent = `Score: 0`;
    });
}
