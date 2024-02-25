import GraphicEngine from "./GraphicEngine.js";
import GameObject from "./GameObject.js";

enum GameAssetsNames {
    snakeHeadRight = "snake-head-right",
    snakeHeadDown = "snake-head-down",
    snakeHeadLeft = "snake-head-left",
    snakeHeadUp = "snake-head-up",
    snakeTail = "snake-head-tail",
    apple = "apple",
}

export enum Direction {
    Up = "ArrowUp",
    Right = "ArrowRight",
    Down = "ArrowDown",
    Left = "ArrowLeft",
}

// ---

export default class GameEngine {
    private graphicEngine;

    private direction: string = Direction.Right;
    private oldDirection: string = this.direction;

    private snake: Array<GameObject> = [
        new GameObject(4, 5, "#0ff409", GameAssetsNames.snakeHeadRight),
        new GameObject(3, 5, "#0ff409", GameAssetsNames.snakeTail),
    ];
    private apple = new GameObject(7, 5, "#f50a8b", GameAssetsNames.apple);

    private score = 0;

    // Movement variables

    private time = 0;
    private grow = false;
    private snakeStateActive = true;

    private gameAudio: {
        turn: HTMLAudioElement | null;
        grow: HTMLAudioElement | null;
        eat: HTMLAudioElement | null;
        dead: HTMLAudioElement | null;
    } = {
        turn: null,
        grow: null,
        eat: null,
        dead: null,
    };

    public soundEnabled: boolean = true;

    constructor(graphicEngine: GraphicEngine) {
        this.graphicEngine = graphicEngine;

        // Preload game assets
        this.graphicEngine.setAssets([
            {
                name: GameAssetsNames.snakeHeadRight,
                imgSrc: "/src/images/assets/snake-head-right.svg",
            },
            {
                name: GameAssetsNames.snakeHeadDown,
                imgSrc: "/src/images/assets/snake-head-down.svg",
            },
            {
                name: GameAssetsNames.snakeHeadLeft,
                imgSrc: "/src/images/assets/snake-head-left.svg",
            },
            {
                name: GameAssetsNames.snakeHeadUp,
                imgSrc: "/src/images/assets/snake-head-up.svg",
            },
            {
                name: GameAssetsNames.snakeTail,
                imgSrc: "/src/images/assets/snake-tail.svg",
            },
            {
                name: GameAssetsNames.apple,
                imgSrc: "/src/images/assets/apple.svg",
            },
        ]);

        // Game audio setup
        this.gameAudio.dead = new Audio("/src/audio/snake-dead.mp3");
        this.gameAudio.eat = new Audio("/src/audio/snake-eat.mp3");
        this.gameAudio.grow = new Audio("/src/audio/snake-grow.mp3");
        this.gameAudio.turn = new Audio("/src/audio/snake-turn.mp3");

        this.gameAudio.turn.volume = 0.5;
        // Startup
        this.graphicEngine.setUpdate(this.update.bind(this));
    }

    private update(ge: GraphicEngine, deltaTime: number) {
        this.drawScene(ge);

        this.time += deltaTime;

        if (this.time >= 150 - this.score * 0.75 && this.snakeStateActive) {
            this.time = 0;

            this.snakeMovment();

            if (this.checkCollison(ge)) {
                if (this.soundEnabled) this.gameAudio.dead?.play();
                return;
            }
        }
    }

    // Update steps

    private snakeMovment() {
        // Snakes head movment

        let prevX = this.snake[0].x,
            prevY = this.snake[0].y;

        switch (this.direction) {
            case Direction.Right:
                this.snake[0].x++;
                this.snake[0].name = GameAssetsNames.snakeHeadRight;
                break;
            case Direction.Left:
                this.snake[0].x--;
                this.snake[0].name = GameAssetsNames.snakeHeadLeft;

                break;
            case Direction.Up:
                this.snake[0].y--;
                this.snake[0].name = GameAssetsNames.snakeHeadUp;

                break;
            case Direction.Down:
                this.snake[0].y++;
                this.snake[0].name = GameAssetsNames.snakeHeadDown;
                break;
        }

        if (this.oldDirection !== this.direction) {
            if (this.soundEnabled) this.gameAudio.turn?.play();
            this.oldDirection = this.direction;
        }

        // Snakes tail movment

        if (this.grow) {
            if (this.soundEnabled) this.gameAudio.grow?.play();

            this.snake = [
                this.snake[0],
                new GameObject(
                    prevX,
                    prevY,
                    "#0ff409",
                    GameAssetsNames.snakeTail
                ),
                ...this.snake.slice(1),
            ];

            this.grow = false;

            this.graphicEngine.summonParticles(
                this.snake[this.snake.length - 1].x,
                this.snake[this.snake.length - 1].y,
                this.snake[this.snake.length - 1].color
            );
        } else {
            this.snake[this.snake.length - 1].x = prevX;
            this.snake[this.snake.length - 1].y = prevY;

            this.snake = [
                this.snake[0],
                this.snake[this.snake.length - 1],
                ...this.snake.slice(1, this.snake.length - 1),
            ];
        }
    }

    private checkCollison(ge: GraphicEngine) {
        // Snake wall collison

        if (
            this.snake[0].x >= ge.getGameGrid() ||
            this.snake[0].x < 0 ||
            this.snake[0].y >= ge.getGameGrid() ||
            this.snake[0].y < 0
        ) {
            this.gameOver();
            return true;
        }

        // Snake self collison

        if (
            this.snake
                .slice(1)
                .find(
                    (segment) =>
                        segment.x === this.snake[0].x &&
                        segment.y === this.snake[0].y
                )
        ) {
            this.gameOver();
            return true;
        }

        // Apple collison

        if (
            this.snake[0].x === this.apple.x &&
            this.snake[0].y === this.apple.y
        ) {
            if (this.soundEnabled) this.gameAudio.eat?.play();
            this.grow = true;
            this.score++;

            ge.getCanvas().dispatchEvent(
                new CustomEvent("scoreupdate", {
                    detail: { score: this.score },
                })
            );

            ge.summonParticles(this.apple.x, this.apple.y, this.apple.color);

            this.summonApple();
        }

        return false;
    }

    private drawScene(graphicEngine: GraphicEngine) {
        this.snake.forEach((segment) => {
            graphicEngine.drawGameObject(segment);
        });

        graphicEngine.drawGameObject(this.apple);
    }

    // Game events

    private async gameOver() {
        this.snakeStateActive = false;

        for (let i = 0; i < this.snake.length; i++) {
            this.graphicEngine.summonParticles(
                this.snake[i].x,
                this.snake[i].y,
                this.snake[i].color
            );

            delete this.snake[i];
        }

        setTimeout(() => {
            this.graphicEngine.getCanvas().dispatchEvent(
                new CustomEvent("gameover", {
                    detail: { win: this.score >= 98 },
                })
            );
            this.graphicEngine.setGameStateActive(false);
        }, 2000);
    }

    private summonApple() {
        let x: number, y: number;

        do {
            x = Math.floor(Math.random() * 10);
            y = Math.floor(Math.random() * 10);
        } while (
            this.snake.find((segment) => segment.x === x && segment.y === y)
        );

        this.apple.x = x;
        this.apple.y = y;
    }

    // User interaction

    public reset() {
        this.snake = [
            new GameObject(4, 5, "#0ff409", GameAssetsNames.snakeHeadRight),
            new GameObject(3, 5, "#0ff409", GameAssetsNames.snakeTail),
        ];
        this.apple = new GameObject(7, 5, "#f50a8b", GameAssetsNames.apple);

        this.direction = Direction.Right;
        this.oldDirection = this.direction;

        this.snakeStateActive = true;
        this.score = 0;
        // Starts game
        this.graphicEngine.setGameStateActive(true);
    }

    public changeDirection(desiredDirection: Direction) {
        if (!this.graphicEngine.getGameStateActive()) return;

        switch (desiredDirection) {
            case Direction.Right:
                if (this.oldDirection === Direction.Left) return;
                break;
            case Direction.Left:
                if (this.oldDirection === Direction.Right) return;
                break;
            case Direction.Up:
                if (this.oldDirection === Direction.Down) return;
                break;
            case Direction.Down:
                if (this.oldDirection === Direction.Up) return;
                break;
        }

        this.direction = desiredDirection;
    }

    public setGameStateActive(state: boolean) {
        this.graphicEngine.setGameStateActive(state);
    }
}
