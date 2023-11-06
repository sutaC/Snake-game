export {};

if ("serviceWorker" in navigator) {
	if (
		location.hostname === "localhost" ||
		location.hostname === "127.0.0.1"
	) {
		const sw = await navigator.serviceWorker.register("sw.js", {
			scope: "/",
		});
		console.info(`Service worker registerd on localhost: ${sw}`);
	} else {
		const sw = await navigator.serviceWorker.register("sw.js", {
			scope: "/Snake-game/",
		});
		console.info(`Service worker registerd on github pages: ${sw}`);
	}
} else {
	console.warn(
		"Could not register service worker, becouse this browser doesn't support it..."
	);
}
