export default class GameObject {
    public x: number;
    public y: number;
    public color = "white";
    public name: string = "";

    constructor(x: number, y: number, color?: string, name?: string) {
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
