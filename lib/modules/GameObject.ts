export default class GameObject {
    x: number;
    y: number;
    color = "white";
    name: string = "";

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
