const cacheNameStatic = "app-cache-static";
const cacheNameDynamic = "app-cache-dynamic";
const assets = [
    "/",
    "/manifest.json",
    "/index.html",
    "/src/style/style.css",
    "/src/scripts/main.js",
    "/src/scripts/swHandler.js",
    "/src/scripts/modules/swipe-detector.js",
    "/src/scripts/modules/GameEngine.js",
    "/src/scripts/modules/GameObject.js",
    "/src/scripts/modules/GraphicEngine.js",
    "/src/scripts/modules/Particle.js",
    "/src/images/illustration-win.png",
    "/src/images/illustration-pause.png",
    "/src/images/illustration-lose.png",
    "/src/images/favicon-48x48.png",
    "/src/images/favicon-128x128.png",
    "/src/images/favicon-512x512.png",
    "/src/images/assets/snake-head-down.svg",
    "/src/images/assets/snake-head-left.svg",
    "/src/images/assets/snake-head-right.svg",
    "/src/images/assets/snake-head-up.svg",
    "/src/images/assets/snake-tail.svg",
    "/src/images/assets/apple.svg",
    "/src/images/icons/icon-pause.svg",
    "/src/images/icons/icon-play.svg",
    "/src/images/icons/icon-sound-enabled.svg",
    "/src/images/icons/icon-sound-disabled.svg",
    "/src/images/icons/icon-reset.svg",
    "/src/audio/snake-dead.mp3",
    "/src/audio/snake-eat.mp3",
    "/src/audio/snake-grow.mp3",
    "/src/audio/snake-turn.mp3",
    "https://fonts.googleapis.com/css2?family=Offside&display=swap",
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
