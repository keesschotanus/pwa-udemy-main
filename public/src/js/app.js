var deferredPrompt;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
    .then(() => {
        console.log('Service Worker is registered');
    }); 
}

window.addEventListener('beforeinstallprompt', event => {
    console.log('beforeinstallprompt event fired');
    event.preventDefault();
    deferredPrompt = event;
    return false;
});

fetch('https://httpbin.org/ip')
    .then(response => {
        console.log(response);
        return response.json()
    })
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.log('Oops, something went wrong:', error);
    });

