import RenderingEngine from "./lib/renderingEngine.js";

const canvas: HTMLCanvasElement | null = document.querySelector("#game");

if (!canvas) {
	throw new Error("Could not connect to Canvas");
}
canvas.width = window.innerWidth;
canvas.height = window.innerWidth;

const renderingEngine = new RenderingEngine(canvas);
