if ("serviceWorker" in navigator) {
    await navigator.serviceWorker.register("sw.js");
}
export {};
