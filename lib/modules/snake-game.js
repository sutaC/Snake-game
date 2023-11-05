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
    #gameStateActive = false;
    #particles = [];
    #assets = [];
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
        this.#render(0);
    }
    // Draw Methods
    #drawParticle(particle) {
        if (!this.#ctx) {
            throw new Error("Could not connect to the Context");
        }
        this.#ctx.beginPath();
        this.#ctx.fillStyle = particle.color;
        this.#ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        this.#ctx.closePath();
    }
    #drawRect(x, y, color) {
        if (!this.#ctx) {
            throw new Error("Could not connect to the Context");
        }
        this.#ctx.beginPath();
        this.#ctx.fillStyle = color;
        this.#ctx.fillRect(x, y, this.#cellSize, this.#cellSize);
        this.#ctx.closePath();
    }
    #drawImage(x, y, image) {
        if (!this.#ctx) {
            throw new Error("Could not connect to the Context");
        }
        this.#ctx.beginPath();
        this.#ctx.drawImage(image, x, y, this.#cellSize, this.#cellSize);
        this.#ctx.closePath();
    }
    // Render methods
    #render(timeStamp) {
        if (!this.#ctx) {
            throw new Error("Could not connect to the Context");
        }
        if (!this.#gameStateActive) {
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
        // Clears board
        this.#ctx.clearRect(0, 0, this.#width, this.#height);
        // Draw border
        for (let y = 0; y <= this.#gameGrid + 1; y++) {
            for (let x = 0; x <= this.#gameGrid + 1; x++) {
                if (y === 0 ||
                    y === this.#gameGrid + 1 ||
                    x === 0 ||
                    x === this.#gameGrid + 1) {
                    this.#drawRect(this.#gap + x * (this.#cellSize + this.#gap), this.#gap + y * (this.#cellSize + this.#gap), "#d4d0ec");
                }
            }
        }
        // Draw on update
        this.#update(this, deltaTime);
        // Draw particles
        if (this.#particles.length > 0) {
            for (let i = 0; i < this.#particles.length; i++) {
                if (!this.#particles[i]) {
                    continue;
                }
                this.#particles[i].update(deltaTime);
                this.#drawParticle(this.#particles[i]);
                if (this.#particles[i].size <= 5 ||
                    this.#particles[i].size === Infinity) {
                    delete this.#particles[i];
                }
            }
        }
        return requestAnimationFrame(this.#render.bind(this));
    }
    // Controll methods
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
        const asset = this.#assets.find((asset) => asset.name === gameObject.name)?.img;
        if (asset) {
            this.#drawImage(posX, posY, asset);
        }
        else if (gameObject.color.length > 0) {
            this.#drawRect(posX, posY, gameObject.color);
        }
    }
    summonParticles(x, y, color) {
        const posX = this.#gap * 2 +
            this.#cellSize * 1.5 +
            x * (this.#cellSize + this.#gap), posY = this.#gap * 2 +
            this.#cellSize * 1.5 +
            y * (this.#cellSize + this.#gap);
        for (let i = 0; i < 15; i++) {
            this.#particles.push(new Particle(posX, posY, this.#cellSize / 3, color, this.#width));
        }
    }
    // Getters & Setters
    get gameGrid() {
        return this.#gameGrid;
    }
    set gameStateActive(state) {
        this.#gameStateActive = state;
        if (state)
            this.#render(0);
    }
    get gameStateActive() {
        return this.#gameStateActive;
    }
    get canvas() {
        return this.#canvas;
    }
    set update(update) {
        this.#update = update;
    }
    set assets(assets) {
        this.#assets = [];
        assets.forEach((asset) => {
            const img = new Image(this.#cellSize, this.#cellSize);
            img.src = asset.imgSrc;
            this.#assets.push({
                name: asset.name,
                imgSrc: asset.imgSrc,
                img,
            });
        });
    }
    get assets() {
        return this.#assets;
    }
}
// Game
export class GameEngine {
    #graphicEngine;
    #direction = Direction.Right;
    #oldDirection = this.#direction;
    #snake = [
        new GameObject(4, 5, "#0ff409", GameAssetsNames.snakeHeadRight),
        new GameObject(3, 5, "#0ff409", GameAssetsNames.snakeTail),
    ];
    #apple = new GameObject(7, 5, "#f50a8b", GameAssetsNames.apple);
    #score = 0;
    // Movement variables
    #time = 0;
    #grow = false;
    #snakeStateActive = true;
    constructor(graphicEngine) {
        this.#graphicEngine = graphicEngine;
        // Preload game assets
        this.#graphicEngine.assets = [
            {
                name: GameAssetsNames.snakeHeadRight,
                imgSrc: "docs/assets/snake-head-right.svg",
            },
            {
                name: GameAssetsNames.snakeHeadDown,
                imgSrc: "docs/assets/snake-head-down.svg",
            },
            {
                name: GameAssetsNames.snakeHeadLeft,
                imgSrc: "docs/assets/snake-head-left.svg",
            },
            {
                name: GameAssetsNames.snakeHeadUp,
                imgSrc: "docs/assets/snake-head-up.svg",
            },
            {
                name: GameAssetsNames.snakeTail,
                imgSrc: "docs/assets/snake-tail.svg",
            },
            {
                name: GameAssetsNames.apple,
                imgSrc: "docs/assets/apple.svg",
            },
        ];
        this.#graphicEngine.update = this.#update.bind(this);
    }
    #update(ge, deltaTime) {
        this.#drawScene(ge);
        this.#time += deltaTime;
        if (this.#time >= 150 - this.#score * 0.75 && this.#snakeStateActive) {
            this.#time = 0;
            this.#snakeMovment();
            if (this.#checkCollison(ge)) {
                return;
            }
        }
    }
    // Update steps
    #snakeMovment() {
        // Snakes head movment
        let prevX = this.#snake[0].x, prevY = this.#snake[0].y;
        switch (this.#direction) {
            case Direction.Right:
                this.#snake[0].x++;
                this.#snake[0].name = GameAssetsNames.snakeHeadRight;
                break;
            case Direction.Left:
                this.#snake[0].x--;
                this.#snake[0].name = GameAssetsNames.snakeHeadLeft;
                break;
            case Direction.Up:
                this.#snake[0].y--;
                this.#snake[0].name = GameAssetsNames.snakeHeadUp;
                break;
            case Direction.Down:
                this.#snake[0].y++;
                this.#snake[0].name = GameAssetsNames.snakeHeadDown;
                break;
        }
        this.#oldDirection = this.#direction;
        // Snakes tail movment
        if (this.#grow) {
            this.#snake = [
                this.#snake[0],
                new GameObject(prevX, prevY, "#0ff409", GameAssetsNames.snakeTail),
                ...this.#snake.slice(1),
            ];
            this.#grow = false;
            this.#graphicEngine.summonParticles(this.#snake[this.#snake.length - 1].x, this.#snake[this.#snake.length - 1].y, this.#snake[this.#snake.length - 1].color);
        }
        else {
            this.#snake[this.#snake.length - 1].x = prevX;
            this.#snake[this.#snake.length - 1].y = prevY;
            this.#snake = [
                this.#snake[0],
                this.#snake[this.#snake.length - 1],
                ...this.#snake.slice(1, this.#snake.length - 1),
            ];
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
            .slice(1)
            .find((segment) => segment.x === this.#snake[0].x &&
            segment.y === this.#snake[0].y)) {
            this.#gameOver();
            return true;
        }
        // Apple collison
        if (this.#snake[0].x === this.#apple.x &&
            this.#snake[0].y === this.#apple.y) {
            this.#grow = true;
            this.#score++;
            ge.canvas.dispatchEvent(new CustomEvent("scoreupdate", {
                detail: { score: this.#score },
            }));
            ge.summonParticles(this.#apple.x, this.#apple.y, this.#apple.color);
            this.#summonApple();
        }
        return false;
    }
    #drawScene(graphicEngine) {
        this.#snake.forEach((segment) => {
            graphicEngine.drawGameObject(segment);
        });
        graphicEngine.drawGameObject(this.#apple);
    }
    // Game events
    async #gameOver() {
        this.#snakeStateActive = false;
        for (let i = 0; i < this.#snake.length; i++) {
            this.#graphicEngine.summonParticles(this.#snake[i].x, this.#snake[i].y, this.#snake[i].color);
            delete this.#snake[i];
        }
        setTimeout(() => {
            this.#graphicEngine.canvas.dispatchEvent(new CustomEvent("gameover", {
                detail: { win: this.#score >= 98 },
            }));
            this.#graphicEngine.gameStateActive = false;
        }, 2000);
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
            new GameObject(4, 5, "#0ff409", GameAssetsNames.snakeHeadRight),
            new GameObject(3, 5, "#0ff409", GameAssetsNames.snakeTail),
        ];
        this.#apple = new GameObject(7, 5, "#f50a8b", GameAssetsNames.apple);
        this.#direction = Direction.Right;
        this.#oldDirection = this.#direction;
        this.#snakeStateActive = true;
        this.#score = 0;
        // Starts game
        this.#graphicEngine.gameStateActive = true;
    }
    changeDirection(desiredDirection) {
        if (!this.#graphicEngine.gameStateActive)
            return;
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
        }
        this.#direction = desiredDirection;
    }
    set gameStateActive(state) {
        this.#graphicEngine.gameStateActive = state;
    }
}
// ---
class GameObject {
    x;
    y;
    color = "white";
    name = "";
    constructor(x, y, color, name) {
        this.x = x;
        this.y = y;
        if (color) {
            this.color = color;
        }
        if (name) {
            this.name = name;
        }
    }
}
class Particle {
    #x;
    #y;
    #size;
    #speedX;
    #speedY;
    #speedShrink;
    #color;
    constructor(x, y, size, color, resolution) {
        this.#x = x;
        this.#y = y;
        this.#size = Math.floor(size * 10) / 10;
        this.#speedX = (Math.random() * size * 2 - size) / size;
        this.#speedY = (Math.random() * size * 2 - size) / size;
        this.#speedShrink = (size / resolution) * (2 + Math.random() * 10);
        this.#color = color;
    }
    update(deltaTime) {
        this.#x += this.#speedX * deltaTime;
        this.#y += this.#speedY * deltaTime;
        this.#size -= this.#speedShrink * deltaTime;
    }
    // Getters
    get x() {
        return this.#x;
    }
    get y() {
        return this.#y;
    }
    get size() {
        return this.#size;
    }
    get color() {
        return this.#color;
    }
}
// ---
var GameAssetsNames;
(function (GameAssetsNames) {
    GameAssetsNames["snakeHeadRight"] = "snake-head-right";
    GameAssetsNames["snakeHeadDown"] = "snake-head-down";
    GameAssetsNames["snakeHeadLeft"] = "snake-head-left";
    GameAssetsNames["snakeHeadUp"] = "snake-head-up";
    GameAssetsNames["snakeTail"] = "snake-head-tail";
    GameAssetsNames["apple"] = "apple";
})(GameAssetsNames || (GameAssetsNames = {}));
export var Direction;
(function (Direction) {
    Direction["Up"] = "ArrowUp";
    Direction["Right"] = "ArrowRight";
    Direction["Down"] = "ArrowDown";
    Direction["Left"] = "ArrowLeft";
})(Direction || (Direction = {}));