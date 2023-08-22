import { RenderingEngine, GameEngine, Direction, } from "./lib/renderingEngine.js";
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
