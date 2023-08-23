export default class SwipeDetector {
	#element;

	#startX: number | null = null;
	#startY: number | null = null;

	#treshold = 100;

	constructor(element: HTMLElement) {
		this.#element = element;

		this.#element.addEventListener(
			"touchstart",
			this.#handleTouchStart.bind(this)
		);

		this.#element.addEventListener(
			"touchmove",
			this.#handleTouchMove.bind(this)
		);
	}

	#handleTouchStart(event: TouchEvent) {
		const touch = event.touches.item(0);

		if (!touch) {
			return;
		}

		this.#startX = touch.clientX;
		this.#startY = touch.clientY;
	}

	#handleTouchMove(event: TouchEvent) {
		if (!(this.#startX && this.#startY)) {
			return;
		}

		const touch = event.touches.item(0);

		if (!touch) {
			return;
		}

		let deltaX = this.#startX - touch.clientX,
			deltaY = this.#startY - touch.clientY;

		if (
			Math.abs(deltaX) < this.#treshold &&
			Math.abs(deltaY) < this.#treshold
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

		// const swipeEvent: SwipeEvent = new CustomEvent("swipe", { detail: { direction } }

		this.#element.dispatchEvent(
			new CustomEvent("swipe", { detail: { direction } })
		);

		this.#startX = null;
		this.#startY = null;
	}

	// Getters & Setters

	get element() {
		return this.#element;
	}

	set treshold(treshold: number) {
		if (treshold < 0) {
			throw new Error("Treshold out of scope");
		}
		this.#treshold = treshold;
	}
}
