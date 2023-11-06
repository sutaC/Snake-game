export {};

if ("serviceWorker" in navigator) {
	await navigator.serviceWorker.register("sw.js", {
		scope: "./",
	});
	console.info(`Service worker registerd`);
} else {
	console.warn(
		"Could not register service worker, becouse this browser doesn't support it..."
	);
}
