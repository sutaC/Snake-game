import Particle from "./Particle.js";
import GameObject from "./GameObject.js";

export default class GraphicEngine {
    private canvas;
    private ctx: CanvasRenderingContext2D | null | undefined = null;
    private width;
    private height;

    private gameGrid = 10;
    private cellSize;
    private gap = 5;

    private lastTime = 0;
    private timer = 0;
    private interval = 1000 / 60;

    private gameStateActive = false;

    private particles: Array<Particle> = [];
    private assets: Array<{
        name: string;
        imgSrc: string;
        img?: CanvasImageSource;
    }> = [];

    update: (graphicEngine: GraphicEngine, deltaTime: number) => void = (
        ge: GraphicEngine,
        dt: number
    ) => {};

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");

        if (!this.ctx) {
            throw new Error("Could not create Context");
        }

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.gap = this.width / 100;
        this.cellSize =
            (this.width - this.gap * (this.gameGrid + 3)) / (this.gameGrid + 2);

        this.render(0);
    }

    // Draw Methods

    drawParticle(particle: Particle) {
        if (!this.ctx) {
            throw new Error("Could not connect to the Context");
        }

        this.ctx.beginPath();

        this.ctx.fillStyle = particle.color;
        this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);

        this.ctx.closePath();
    }

    drawRect(x: number, y: number, color: string) {
        if (!this.ctx) {
            throw new Error("Could not connect to the Context");
        }

        this.ctx.beginPath();

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);

        this.ctx.closePath();
    }

    drawImage(x: number, y: number, image: CanvasImageSource) {
        if (!this.ctx) {
            throw new Error("Could not connect to the Context");
        }

        this.ctx.beginPath();

        this.ctx.drawImage(image, x, y, this.cellSize, this.cellSize);

        this.ctx.closePath();
    }

    // Render methods

    render(timeStamp: number): number {
        if (!this.ctx) {
            throw new Error("Could not connect to the Context");
        }

        if (!this.gameStateActive) {
            this.timer = 0;
            this.lastTime = 0;
            return 0;
        }

        const deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;

        if (this.timer < this.interval) {
            this.timer += deltaTime;
            return requestAnimationFrame(this.render.bind(this));
        }

        this.timer = 0;

        // Clears board
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw border
        for (let y = 0; y <= this.gameGrid + 1; y++) {
            for (let x = 0; x <= this.gameGrid + 1; x++) {
                if (
                    y === 0 ||
                    y === this.gameGrid + 1 ||
                    x === 0 ||
                    x === this.gameGrid + 1
                ) {
                    this.drawRect(
                        this.gap + x * (this.cellSize + this.gap),
                        this.gap + y * (this.cellSize + this.gap),
                        "d4d0ec"
                    );
                }
            }
        }

        // Draw on update
        this.update(this, deltaTime);

        // Draw particles
        if (this.particles.length > 0) {
            for (let i = 0; i < this.particles.length; i++) {
                if (!this.particles[i]) {
                    continue;
                }

                this.particles[i].update(deltaTime);
                this.drawParticle(this.particles[i]);

                if (
                    this.particles[i].size <= 5 ||
                    this.particles[i].size === Infinity
                ) {
                    delete this.particles[i];
                }
            }
        }

        return requestAnimationFrame(this.render.bind(this));
    }

    // Controll methods

    drawGameObject(gameObject: GameObject) {
        if (gameObject.x < 0 || gameObject.x >= this.gameGrid) {
            throw new Error("X index out of scope");
        }
        if (gameObject.y < 0 || gameObject.y >= this.gameGrid) {
            throw new Error("Y index out of scope");
        }

        const posX =
                this.gap * 2 +
                this.cellSize +
                gameObject.x * (this.cellSize + this.gap),
            posY =
                this.gap * 2 +
                this.cellSize +
                gameObject.y * (this.cellSize + this.gap);

        const asset = this.assets.find(
            (asset) => asset.name === gameObject.name
        )?.img;
        if (asset) {
            this.drawImage(posX, posY, asset);
        } else if (gameObject.color.length > 0) {
            this.drawRect(posX, posY, gameObject.color);
        }
    }

    summonParticles(x: number, y: number, color: string) {
        const posX =
                this.gap * 2 +
                this.cellSize * 1.5 +
                x * (this.cellSize + this.gap),
            posY =
                this.gap * 2 +
                this.cellSize * 1.5 +
                y * (this.cellSize + this.gap);
        for (let i = 0; i < 15; i++) {
            this.particles.push(
                new Particle(posX, posY, this.cellSize / 3, color, this.width)
            );
        }
    }

    // Getters & Setters

    getGameGrid() {
        return this.gameGrid;
    }

    setGameStateActive(state: boolean) {
        this.gameStateActive = state;
        if (state) this.render(0);
    }
    getGameStateActive() {
        return this.gameStateActive;
    }

    getCanvas() {
        return this.canvas;
    }

    setUpdate(
        update: (renderingEngine: GraphicEngine, deltaTime: number) => void
    ) {
        this.update = update;
    }

    setAssets(assets: Array<{ name: string; imgSrc: string }>) {
        this.assets = [];
        assets.forEach((asset) => {
            const img = new Image(this.cellSize, this.cellSize);
            img.src = asset.imgSrc;

            this.assets.push({
                name: asset.name,
                imgSrc: asset.imgSrc,
                img,
            });
        });
    }
    getAssets() {
        return this.assets;
    }
}
