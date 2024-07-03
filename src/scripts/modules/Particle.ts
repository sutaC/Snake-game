export default class Particle {
    public x: number;
    public y: number;
    public size: number;
    public color: string;

    private speedShrink: number;
    private speedY: number;
    private speedX: number;

    constructor(
        x: number,
        y: number,
        size: number,
        color: string,
        resolution: number
    ) {
        this.x = x;
        this.y = y;
        this.size = Math.floor(size * 10) / 10;
        this.speedX = (Math.random() * size * 2 - size) / size;
        this.speedY = (Math.random() * size * 2 - size) / size;
        this.speedShrink = (size / resolution) * (2 + Math.random() * 10);
        this.color = color;
    }

    public update(deltaTime: number) {
        this.x += this.speedX * deltaTime;
        this.y += this.speedY * deltaTime;
        this.size -= this.speedShrink * deltaTime;
    }
}
