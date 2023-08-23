import { RenderingEngine, GameEngine, Direction } from "./lib/snake-game.js";
import SwipeDetector from "./lib/swipe-detector.js";
const canvas = document.querySelector("#game");
if (!canvas) {
    throw new Error("Could not connect to Canvas");
}
canvas.width = window.innerWidth;
canvas.height = window.innerWidth;
const renderingEngine = new RenderingEngine(canvas);
const gameEngine = new GameEngine(renderingEngine);
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
const swipeDetector = new SwipeDetector(document.body);
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
const btnPause = document.querySelector("#pause");
if (!btnPause) {
    throw new Error("Could not connect to Button");
}
btnPause.addEventListener("click", () => {
    gameEngine.pauseGame();
});
