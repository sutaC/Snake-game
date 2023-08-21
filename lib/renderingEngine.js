export default class RenderingEngine {
    #ctx = null;
    #width;
    #height;
    #gameGrid = 10;
    #cellSize;
    #gap = 5;
    #lastTime = 0;
    #timer = 0;
    interval = (1000 / 60) * 15;
    index = 0;
    direction = -1;
    constructor(canvas) {
        this.#ctx = canvas.getContext("2d");
        if (!this.#ctx) {
            throw new Error("Could not create Context");
        }
        this.#width = canvas.width;
        this.#height = canvas.height;
        this.#gap = this.#width / 100;
        this.#cellSize =
            (this.#width - this.#gap * (this.#gameGrid + 3)) /
                (this.#gameGrid + 2);
        this.#drawBorder();
        this.#update(0);
    }
    // Draw Methods
    #drawRect(x, y, color) {
        if (!this.#ctx) {
            throw new Error("Could not connect to the Context");
        }
        this.#ctx.beginPath();
        this.#ctx.fillStyle = color;
        this.#ctx.fillRect(x, y, this.#cellSize, this.#cellSize);
        this.#ctx.closePath();
    }
    #drawBorder() {
        if (!this.#ctx) {
            throw new Error("Could not connect to the Context");
        }
        for (let y = this.#gap; y < this.#height; y += this.#cellSize + this.#gap) {
            for (let x = this.#gap; x < this.#height; x += this.#cellSize + this.#gap) {
                this.#drawRect(x, y, "white");
            }
        }
        this.#ctx.clearRect(this.#gap + this.#cellSize, this.#gap + this.#cellSize, (this.#cellSize + this.#gap) * this.#gameGrid, (this.#cellSize + this.#gap) * this.#gameGrid);
    }
    // Render methods
    #update(timeStamp) {
        if (!this.#ctx) {
            throw new Error("Could not connect to the Context");
        }
        const deltaTime = timeStamp - this.#lastTime;
        this.#lastTime = timeStamp;
        if (this.#timer < this.interval) {
            this.#timer += deltaTime;
            return requestAnimationFrame(this.#update.bind(this));
        }
        this.#timer = 0;
        this.#ctx.clearRect(this.#gap + this.#cellSize, this.#gap + this.#cellSize, (this.#cellSize + this.#gap) * this.#gameGrid, (this.#cellSize + this.#gap) * this.#gameGrid);
        // Draw on update
        this.#drawRect(this.#gap * 2 +
            this.#cellSize +
            this.index * (this.#cellSize + this.#gap), this.#gap * 2 +
            this.#cellSize +
            this.index * (this.#cellSize + this.#gap), "lime");
        if (this.index + 1 >= this.#gameGrid || this.index - 1 < 0) {
            this.direction *= -1;
        }
        this.index += this.direction;
        // ---
        return requestAnimationFrame(this.#update.bind(this));
    }
}
