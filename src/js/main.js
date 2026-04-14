let swRegistration = null;

if ("serviceWorker" in navigator){
    navigator.serviceWorker
        .register("service-worker.js")
        .then((reg) => {
            swRegistration = reg;
        });
}