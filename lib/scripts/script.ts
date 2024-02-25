import GraphicEngine from "../modules/GraphicEngine.js";
import GameEngine from "../modules/GameEngine.js";
import SwipeDetector from "../modules/swipe-detector.js";
import { Direction } from "../modules/GameEngine.js";

// Elements

const canvas: HTMLCanvasElement | null = document.querySelector("#game");
if (!canvas) throw new ReferenceError("Could not find element #game");
const dialog: HTMLDialogElement | null = document.querySelector("#game-dialog");
if (!dialog) throw new ReferenceError("Could not find element #game-dialog");

const btnPause: HTMLButtonElement | null = document.querySelector("#btn-pause");
if (!btnPause) throw new ReferenceError("Could not find element #btn-pause");
const btnPlay: HTMLButtonElement | null = document.querySelector("#btn-play");
if (!btnPlay) throw new ReferenceError("Could not find element #btn-play");
const btnReset: HTMLButtonElement | null = document.querySelector("#btn-reset");
if (!btnReset) throw new ReferenceError("Could not find element #btn-reset");

const inpSoundEnabled: HTMLInputElement | null =
    document.querySelector("#inpSoundEnabled");
if (!inpSoundEnabled)
    throw new ReferenceError("Could not find element #inpSoundEnabled");
const iSoundEnabled: HTMLElement | null =
    document.querySelector("#iSoundEnabled");
if (!iSoundEnabled)
    throw new ReferenceError("Could not find element #iSoundEnabled");

const pScore = document.querySelector("#score");
if (!pScore) throw new ReferenceError("Could not find element #score");
const pBestScore = document.querySelector("#best-score");
if (!pBestScore) throw new ReferenceError("Could not find element #best-score");

const imgIllustration: HTMLImageElement | null =
    document.querySelector("#illustration");
if (!imgIllustration)
    throw new ReferenceError("Could not find element #illustration");
const h2DialogHeader = document.querySelector("#dialogHeader");
if (!h2DialogHeader)
    throw new ReferenceError("Could not find element #dialogHeader");

// Game setup

canvas.width = window.innerWidth;
canvas.height = window.innerWidth;

const renderingEngine = new GraphicEngine(canvas);
const gameEngine = new GameEngine(renderingEngine);
const swipeDetector = new SwipeDetector(document.body);

// Modal illustrations preload

const preloadImage = (src: string, width?: number, height?: number) => {
    const image = new Image();
    image.src = src;
    return image;
};
enum IllustrationNames {
    win = "ill-win",
    pause = "ill-pause",
    lose = "ill-lose",
}
const illustrations: Array<{
    name: string;
    imgSrc: string;
    img: CanvasImageSource;
}> = [
    {
        name: IllustrationNames.win,
        imgSrc: "docs/assets/illustration-win.png",
        img: preloadImage("docs/assets/illustration-win.png"),
    },
    {
        name: IllustrationNames.pause,
        imgSrc: "docs/assets/illustration-pause.png",
        img: preloadImage("docs/assets/illustration-pause.png"),
    },
    {
        name: IllustrationNames.lose,
        imgSrc: "docs/assets/illustration-lose.png",
        img: preloadImage("docs/assets/illustration-lose.png"),
    },
];

// Buttons

btnPause.addEventListener("click", () => {
    gameEngine.setGameStateActive(false);

    h2DialogHeader.textContent = "Pause";
    imgIllustration.src =
        illustrations.find((ill) => ill.name === IllustrationNames.pause)
            ?.imgSrc ?? "";

    dialog.showModal();
});

btnPlay.addEventListener("click", () => {
    gameEngine.setGameStateActive(true);
    dialog.close();
    dialog.classList.remove("gameStart");
});

btnReset.addEventListener("click", () => {
    dialog.close();
    dialog.classList.remove("gameOver");

    pScore.textContent = `Score 0`;

    gameEngine.reset();
});

let soundEnabled: boolean | undefined = JSON.parse(
    localStorage.getItem("soundEnabled") as string
);
if (typeof soundEnabled !== "boolean") soundEnabled = true;
inpSoundEnabled.checked = soundEnabled;

const handleSoundEnabled = () => {
    soundEnabled = inpSoundEnabled.checked;
    gameEngine.soundEnabled = soundEnabled;
    localStorage.setItem("soundEnabled", JSON.stringify(soundEnabled));

    if (soundEnabled) {
        iSoundEnabled.setAttribute(
            "style",
            "--_icon: url(/docs/assets/icon-sound-enabled.svg);"
        );
    } else {
        iSoundEnabled.setAttribute(
            "style",
            "--_icon: url(/docs/assets/icon-sound-disabled.svg);"
        );
    }
};
inpSoundEnabled.addEventListener("click", handleSoundEnabled);
handleSoundEnabled();

// Controls

window.addEventListener("keydown", (event: KeyboardEvent) => {
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

swipeDetector.element.addEventListener("swipe", (event: CustomEventInit) => {
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

let bestScore: number = Number(localStorage.getItem("bestscore")) ?? 0;

pBestScore.textContent = `Best Score ${bestScore}`;

canvas.addEventListener("scoreupdate", (event: CustomEventInit) => {
    const { score } = event.detail;

    pScore.textContent = `Score ${score ?? 0}`;

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestscore", score);
        pBestScore.textContent = `Best Score ${score ?? 0}`;
        console.log(bestScore);
    }
});

// Game Over

canvas.addEventListener("gameover", (event: CustomEventInit) => {
    const { win } = event.detail;

    if (win) {
        imgIllustration.src =
            illustrations.find((ill) => ill.name === IllustrationNames.win)
                ?.imgSrc ?? "";
        h2DialogHeader.textContent = "You Win!";
    } else {
        imgIllustration.src =
            illustrations.find((ill) => ill.name === IllustrationNames.lose)
                ?.imgSrc ?? "";
        h2DialogHeader.textContent = "You Lose!";
    }

    dialog.classList.add("gameOver");
    dialog.showModal();
});

// Game Start

dialog.classList.add("gameStart");
dialog.showModal();
