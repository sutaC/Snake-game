export default class SwipeDetector {
    private element;

    private startX: number | null = null;
    private startY: number | null = null;

    private treshold = 0;

    constructor(element: HTMLElement) {
        this.element = element;

        this.element.addEventListener(
            "touchstart",
            this.handleTouchStart.bind(this)
        );

        this.element.addEventListener(
            "touchmove",
            this.handleTouchMove.bind(this)
        );
    }

    private handleTouchStart(event: TouchEvent) {
        const touch = event.touches.item(0);

        if (!touch) {
            return;
        }

        this.startX = touch.clientX;
        this.startY = touch.clientY;
    }

    private handleTouchMove(event: TouchEvent) {
        if (!(this.startX && this.startY)) {
            return;
        }

        const touch = event.touches.item(0);

        if (!touch) {
            return;
        }

        let deltaX = this.startX - touch.clientX,
            deltaY = this.startY - touch.clientY;

        if (
            Math.abs(deltaX) < this.treshold &&
            Math.abs(deltaY) < this.treshold
        ) {
            return;
        }

        let direction: "up" | "down" | "left" | "right";

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                // Swipe left
                direction = "left";
            } else {
                // Swipe right
                direction = "right";
            }
        } else {
            if (deltaY > 0) {
                // Swipe up
                direction = "up";
            } else {
                // Swipe down
                direction = "down";
            }
        }

        this.element.dispatchEvent(
            new CustomEvent("swipe", { detail: { direction } })
        );

        this.startX = null;
        this.startY = null;
    }

    // Getters & Setters

    public getElement() {
        return this.element;
    }

    public setTreshold(treshold: number) {
        if (treshold < 0) {
            throw new Error("Treshold out of scope");
        }
        this.treshold = treshold;
    }
}
