export class GraphicEngine {
    #canvas;
    #ctx = null;
    #width;
    #height;
    #gameGrid = 10;
    #cellSize;
    #gap = 5;
    #lastTime = 0;
    #timer = 0;
    #interval = 1000 / 60;
    #gameState = State.Stop;
    #update = (ge, dt) => { };
    constructor(canvas) {
        this.#canvas = canvas;
        this.#ctx = this.#canvas.getContext("2d");
        if (!this.#ctx) {
            throw new Error("Could not create Context");
        }
        this.#width = this.#canvas.width;
        this.#height = this.#canvas.height;
        this.#gap = this.#width / 100;
        this.#cellSize =
            (this.#width - this.#gap * (this.#gameGrid + 3)) /
                (this.#gameGrid + 2);
        this.#drawBorder();
        this.#render(0);
    }
    // Draw Methods
    #drawRect(x, y, color, imgSrc) {
        if (!this.#ctx) {
            throw new Error("Could not connect to the Context");
        }
        this.#ctx.beginPath();
        this.#ctx.fillStyle = color;
        this.#ctx.fillRect(x, y, this.#cellSize, this.#cellSize);
        this.#ctx.closePath();
    }
    #drawImage(x, y, imgSrc) {
        if (!this.#ctx) {
            throw new Error("Could not connect to the Context");
        }
        const img = new Image(this.#cellSize, this.#cellSize);
        img.src = imgSrc;
        this.#ctx.beginPath();
        this.#ctx.drawImage(img, x, y, this.#cellSize, this.#cellSize);
        this.#ctx.closePath();
    }
    #drawBorder() {
        if (!this.#ctx) {
            throw new Error("Could not connect to the Context");
        }
        for (let y = this.#gap; y < this.#height; y += this.#cellSize + this.#gap) {
            for (let x = this.#gap; x < this.#height; x += this.#cellSize + this.#gap) {
                this.#drawRect(x, y, "#d4d0ec");
            }
        }
        this.clearGameBoard();
    }
    // Render methods
    #render(timeStamp) {
        if (!this.#ctx) {
            throw new Error("Could not connect to the Context");
        }
        if (this.#gameState === State.Stop) {
            this.#timer = 0;
            this.#lastTime = 0;
            return 0;
        }
        const deltaTime = timeStamp - this.#lastTime;
        this.#lastTime = timeStamp;
        if (this.#timer < this.#interval) {
            this.#timer += deltaTime;
            return requestAnimationFrame(this.#render.bind(this));
        }
        this.#timer = 0;
        // Draw on update
        this.#update(this, deltaTime);
        return requestAnimationFrame(this.#render.bind(this));
    }
    // Controll methods
    set update(update) {
        this.#update = update;
    }
    drawGameObject(gameObject) {
        if (gameObject.x < 0 || gameObject.x >= this.#gameGrid) {
            throw new Error("X index out of scope");
        }
        if (gameObject.y < 0 || gameObject.y >= this.#gameGrid) {
            throw new Error("Y index out of scope");
        }
        const posX = this.#gap * 2 +
            this.#cellSize +
            gameObject.x * (this.#cellSize + this.#gap), posY = this.#gap * 2 +
            this.#cellSize +
            gameObject.y * (this.#cellSize + this.#gap);
        if (gameObject.imgSrc.length > 0) {
            this.#drawImage(posX, posY, gameObject.imgSrc);
        }
        else if (gameObject.color.length > 0) {
            this.#drawRect(posX, posY, gameObject.color);
        }
    }
    clearGameBoard() {
        if (!this.#ctx) {
            throw new Error("Could not connect to the Context");
        }
        this.#ctx.clearRect(this.#gap + this.#cellSize, this.#gap + this.#cellSize, (this.#cellSize + this.#gap) * this.#gameGrid + this.#gap, (this.#cellSize + this.#gap) * this.#gameGrid + this.#gap);
    }
    // Getters & Setters
    get gameGrid() {
        return this.#gameGrid;
    }
    set gameState(state) {
        this.#gameState = state;
        if (state === State.Playing)
            this.#render(0);
    }
    get gameState() {
        return this.#gameState;
    }
    get canvas() {
        return this.#canvas;
    }
}
// Game
export class GameEngine {
    #graphicEngine;
    #direction = Direction.Right;
    #oldDirection = this.#direction;
    #snake = [
        new GameObject(4, 5, "#0ff409", GameAssets.snakeHeadRight),
        new GameObject(3, 5, "#0ff409", GameAssets.snakeTail),
    ];
    #apple = new GameObject(7, 5, "#f50a8b", GameAssets.apple);
    #score = 0;
    // Movement variables
    #time = 0;
    #speed = 30;
    constructor(graphicEngine) {
        this.#graphicEngine = graphicEngine;
        this.#graphicEngine.update = this.#update.bind(this);
    }
    #update(ge, deltaTime) {
        this.#time += deltaTime;
        if (this.#time >= 100 - (this.#speed + this.#score / 3)) {
            this.#time = 0;
            this.#snakeMovment();
            if (this.#checkCollison(ge)) {
                return;
            }
        }
        this.#drawScene(ge);
    }
    // Update steps
    #snakeMovment() {
        // Snakes head movment
        let prevX = this.#snake[0].x, prevY = this.#snake[0].y;
        switch (this.#direction) {
            case Direction.Right:
                this.#snake[0].x++;
                this.#snake[0].imgSrc = GameAssets.snakeHeadRight;
                break;
            case Direction.Left:
                this.#snake[0].x--;
                this.#snake[0].imgSrc = GameAssets.snakeHeadLeft;
                break;
            case Direction.Up:
                this.#snake[0].y--;
                this.#snake[0].imgSrc = GameAssets.snakeHeadUp;
                break;
            case Direction.Down:
                this.#snake[0].y++;
                this.#snake[0].imgSrc = GameAssets.snakeHeadDown;
                break;
        }
        this.#oldDirection = this.#direction;
        // Snakes tail movment
        let tmp;
        for (let i = 1; i < this.#snake.length; i++) {
            tmp = this.#snake[i].x;
            this.#snake[i].x = prevX;
            prevX = tmp;
            tmp = this.#snake[i].y;
            this.#snake[i].y = prevY;
            prevY = tmp;
        }
    }
    #checkCollison(ge) {
        // Snake wall collison
        if (this.#snake[0].x >= ge.gameGrid ||
            this.#snake[0].x < 0 ||
            this.#snake[0].y >= ge.gameGrid ||
            this.#snake[0].y < 0) {
            this.#gameOver();
            return true;
        }
        // Snake self collison
        if (this.#snake
            .slice(2)
            .find((segment) => segment.x === this.#snake[0].x &&
            segment.y === this.#snake[0].y)) {
            this.#gameOver();
            return true;
        }
        // Apple collison
        if (this.#snake[0].x === this.#apple.x &&
            this.#snake[0].y === this.#apple.y) {
            this.#snake.push(new GameObject(this.#snake[this.#snake.length - 1].x, this.#snake[this.#snake.length - 1].y, this.#snake[this.#snake.length - 1].color, this.#snake[this.#snake.length - 1].imgSrc));
            this.#score++;
            ge.canvas.dispatchEvent(new CustomEvent("scoreupdate", {
                detail: { score: this.#score },
            }));
            this.#summonApple();
        }
        return false;
    }
    #drawScene(graphicEngine) {
        graphicEngine.clearGameBoard();
        this.#snake.forEach((segment) => {
            graphicEngine.drawGameObject(segment);
        });
        graphicEngine.drawGameObject(this.#apple);
    }
    // Game events
    #gameOver() {
        this.#graphicEngine.canvas.dispatchEvent(new CustomEvent("gameover", { detail: { win: this.#score >= 98 } }));
        this.#graphicEngine.gameState = State.Stop;
    }
    #summonApple() {
        let x, y;
        do {
            x = Math.floor(Math.random() * 10);
            y = Math.floor(Math.random() * 10);
        } while (this.#snake.find((segment) => segment.x === x && segment.y === y));
        this.#apple.x = x;
        this.#apple.y = y;
    }
    // User interaction
    reset() {
        this.#snake = [
            new GameObject(4, 5, "#0ff409", GameAssets.snakeHeadRight),
            new GameObject(3, 5, "#0ff409", GameAssets.snakeTail),
        ];
        this.#apple = new GameObject(7, 5, "#f50a8b", GameAssets.apple);
        this.#direction = Direction.Right;
        this.#oldDirection = this.#direction;
        this.#score = 0;
        // Starts game
        this.#graphicEngine.gameState = State.Playing;
    }
    changeDirection(desiredDirection) {
        switch (desiredDirection) {
            case Direction.Right:
                if (this.#oldDirection === Direction.Left)
                    return;
                break;
            case Direction.Left:
                if (this.#oldDirection === Direction.Right)
                    return;
                break;
            case Direction.Up:
                if (this.#oldDirection === Direction.Down)
                    return;
                break;
            case Direction.Down:
                if (this.#oldDirection === Direction.Up)
                    return;
                break;
            default:
                return;
        }
        this.#direction = desiredDirection;
    }
    pauseGame(pause) {
        if (pause) {
            this.#graphicEngine.gameState = State.Stop;
        }
        else {
            this.#graphicEngine.gameState = State.Playing;
        }
    }
}
// ---
class GameObject {
    imgSrc = "";
    x;
    y;
    color = "white";
    constructor(x, y, color, imgSrc) {
        this.x = x;
        this.y = y;
        if (color) {
            this.color = color;
        }
        if (imgSrc) {
            this.imgSrc = imgSrc;
        }
    }
}
export var Direction;
(function (Direction) {
    Direction["Up"] = "ArrowUp";
    Direction["Right"] = "ArrowRight";
    Direction["Down"] = "ArrowDown";
    Direction["Left"] = "ArrowLeft";
})(Direction || (Direction = {}));
var State;
(function (State) {
    State[State["Playing"] = 0] = "Playing";
    State[State["Stop"] = 1] = "Stop";
})(State || (State = {}));
var GameAssets;
(function (GameAssets) {
    GameAssets["snakeHeadRight"] = "/scripts/modules/assets/snake-head-right.svg";
    GameAssets["snakeHeadDown"] = "/scripts/modules/assets/snake-head-down.svg";
    GameAssets["snakeHeadLeft"] = "/scripts/modules/assets/snake-head-left.svg";
    GameAssets["snakeHeadUp"] = "/scripts/modules/assets/snake-head-up.svg";
    GameAssets["snakeTail"] = "/scripts/modules/assets/snake-tail.svg";
    GameAssets["apple"] = "/scripts/modules/assets/apple.svg";
})(GameAssets || (GameAssets = {}));
