const stataicCacheName = "site-static";
const dynamicCacheName = "site-dynamic";
const fallbackName = "/docs/pages/fallback.html";
const assets = [
	fallbackName,
	"/",
	"/index.html",
	"/lib/style/style.css",
	"https://fonts.googleapis.com/css2?family=Offside&display=swap",
	"/lib/scripts/script.js",
	"/lib/scripts/app.js",
	"/lib/modules/swipe-detector.js",
	"/lib/modules/snake-game.js",
	"/docs/assets/illustration-win.png",
	"/docs/assets/illustration-pause.png",
	"/docs/assets/illustration-lose.png",
	"/docs/assets/logo.png",
	"/docs/assets/snake-head-down.svg",
	"/docs/assets/snake-head-left.svg",
	"/docs/assets/snake-head-right.svg",
	"/docs/assets/snake-head-up.svg",
	"/docs/assets/snake-tail.svg",
	"/docs/assets/apple.svg",
	"/docs/assets/icon-pause.svg",
	"/docs/assets/icon-play.svg",
	"/docs/assets/icon-reset.svg",
];

async function cacheStatic(): Promise<void> {
	const cache = await caches.open(stataicCacheName);
	await cache.addAll(assets);
}

async function deleteCache(): Promise<void> {
	const keys = await caches.keys();
	keys.forEach((key) => {
		if (key != stataicCacheName) caches.delete(key);
	});
}

async function limitCacheSize(name: string, size: number): Promise<void> {
	const cache = await caches.open(name);
	const keys = await cache.keys();

	if (keys.length <= size || keys.length === 0) {
		return;
	}

	await cache.delete(keys[0]);
	await limitCacheSize(name, size);
}

async function handleRespond(req: Request): Promise<Response | null> {
	let cacheRes;
	try {
		cacheRes = (await caches.match(req)) as Response;
	} catch (error) {
		console.error(error);
	}

	if (cacheRes) return cacheRes;

	let fetchRes;
	try {
		fetchRes = await fetch(req);
	} catch (error) {
		console.error(error);
	}

	if (fetchRes) {
		const cache = await caches.open(dynamicCacheName);
		cache.put(req, fetchRes.clone());
		await limitCacheSize(dynamicCacheName, 15);
		return fetchRes;
	}

	// Handle no cache & no connection
	if (req.url.endsWith(".html")) {
		const fallback = await caches.match(fallbackName);
		if (fallback) return fallback;
	}

	return null;
}

// ---

self.addEventListener("install", (event: any) => {
	try {
		event.waitUntil(cacheStatic());
	} catch (error) {
		console.error(error);
	}
});

self.addEventListener("activate", (event: any) => {
	try {
		event.waitUntil(deleteCache());
	} catch (error) {
		console.error(error);
	}
});

self.addEventListener("fetch", (event: any) => {
	try {
		event.respondWith(handleRespond(event.request));
	} catch (error) {
		console.error(error);
	}
});
