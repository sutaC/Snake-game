const cacheNameStatic = "app-cache-static";
const cacheNameDynamic = "app-cache-dynamic";
const assets = [
    "/",
    "/manifest.json",
    "/index.html",
    "/style/style.css",
    "/style/fonts/Offside-Regular.ttf",
    "/scripts/main.js",
    "/scripts/swHandler.js",
    "/scripts/modules/SwipeDetector.js",
    "/scripts/modules/GameEngine.js",
    "/scripts/modules/GameObject.js",
    "/scripts/modules/GraphicEngine.js",
    "/scripts/modules/Particle.js",
    "/images/illustration-win.png",
    "/images/illustration-pause.png",
    "/images/illustration-lose.png",
    "/images/favicon-48x48.png",
    "/images/favicon-128x128.png",
    "/images/favicon-512x512.png",
    "/images/assets/snake-head-down.svg",
    "/images/assets/snake-head-left.svg",
    "/images/assets/snake-head-right.svg",
    "/images/assets/snake-head-up.svg",
    "/images/assets/snake-tail.svg",
    "/images/assets/apple.svg",
    "/images/icons/icon-pause.svg",
    "/images/icons/icon-play.svg",
    "/images/icons/icon-sound-enabled.svg",
    "/images/icons/icon-sound-disabled.svg",
    "/images/icons/icon-reset.svg",
    "/audio/snake-dead.mp3",
    "/audio/snake-eat.mp3",
    "/audio/snake-grow.mp3",
    "/audio/snake-turn.mp3",
];

// Functions
async function resizeCache(cacheName: string, size: number) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    if (keys.length <= size) return;

    for (let i = 0; i < size - keys.length; i++) {
        await cache.delete(keys[i]);
    }
}

async function updateCache(request: Request) {
    let fRes: Response | undefined;
    try {
        fRes = await fetch(request);
    } catch (error) {}

    if (!fRes || !fRes?.ok) return;

    const cache = await caches.open(cacheNameStatic);
    await cache.delete(request);
    await cache.put(request, fRes.clone());
}

// Handlers
async function handleInstall() {
    // Delete old cache
    await caches.delete(cacheNameStatic);

    // Installs stataic cache
    const cache = await caches.open(cacheNameStatic);
    assets.forEach(async (asset) => {
        await cache.add(asset);
    });
}

async function handleActivate() {
    // Deletes unwanted data
    const keys = await caches.keys();

    keys.forEach(async (key) => {
        if (key !== cacheNameStatic) {
            await caches.delete(key);
        }
    });
}

async function handleFetch(request: Request): Promise<Response> {
    const cRes = await caches.match(request);

    if (cRes) {
        updateCache(request);
        return cRes;
    }

    // Add data to dynamic cache
    let fRes: Response | undefined;
    try {
        fRes = await fetch(request);
        await (async () => {
            if (!fRes.ok) return;
            if (fRes.status === 206) return;

            const cacheS = await caches.open(cacheNameStatic);
            if (await cacheS.match(request)) return;

            const cacheD = await caches.open(cacheNameDynamic);
            await cacheD.put(request, fRes.clone());
        })();
    } catch (error) {
        console.error("Unable to put response into dynamic cache: ", error);
    } finally {
        return fRes || Response.error();
    }
}

// Setup

self.addEventListener("install", (event: any) => {
    event.waitUntil(handleInstall());
    console.log("Service worker installed");
});

self.addEventListener("activate", (event: any) => {
    event.waitUntil(handleActivate());
    console.log("Service worker activated");
});

self.addEventListener("fetch", (event: any) => {
    event.respondWith(handleFetch(event.request));
    resizeCache(cacheNameDynamic, 20);
});
