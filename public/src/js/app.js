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

var promise = new Promise((resolve, reject) => {
  setTimeout(() => {
      reject({code: 500, msg: 'An error occurred!'});
  }, 3000);  
});

promise.then(text => {
    console.log('text:', text);
    return text;
}, error => {
    console.log(`Error# ${error.code}, Message: ${error.msg}`);
}).then(otherText => {
    console.log('Other text:', otherText);
});

console.log('This will be executed first!');