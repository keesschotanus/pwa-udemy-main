
var deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function(err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

function displayConfirmNotification() {
  if ('serviceWorker' in navigator) {
    const options = {
      body: 'You successfully subscribed to our service!',
      icon: '/src/images/icons/app-icon-96x96.png',
      actions: [
        { action: 'confirm', title: 'Okay', icon: '/src/image/icons/app-icon-96x96.png' },
        { action: 'cancel', title: 'Cancel', icon: '/src/image/icons/app-icon-96x96.png' },
      ],
      vibrate: [100, 50, 200],
      badge: '/src/images/icons/app-icon-96x96.png',
      tag: 'confirm-notification',
      renotify: true
    };

    navigator.serviceWorker.ready
      .then(swreg =>{
        swreg.showNotification('Successfully subscribed', options);
      })
  }
}

function askForNotificationPermission() {
  Notification.requestPermission(result => {
    console.log('User Choice', result);
    if (result !== 'granted') {
      console.log('User did not grant permission');
    } else {
      configurePushSub();
    }
  });
}

function configurePushSub() {
  var reg;
  navigator.serviceWorker.ready
    .then(swreg => {
      reg = swreg;
      return swreg.pushManager.getSubscription();
    })
    .then(sub => {
      if (sub) {
        // Use existing subscription
      } else {
        // Create a new subscription
        var vapidPublicKey = 'BGKUmnOytLjQkNUJvI6tGPY1KmuJ5JG5J2yPO8KWhouDaVe2nxDR1d3oV0J62jPTzpyrLn7ehx667PQ3VDCP1VY';
        var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey          
        });
      }
    })
    .then(newSub => {
      // Pass new subscription to firebase backend
      return fetch('https://udemy-pwa-bc405.firebaseio.com/subscriptions.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newSub)
      })
    })
    .then(res => {
      if (res.ok) {
        displayConfirmNotification();
      }
    })
    .catch(err => {
      console.log(err);
    })
}

if ('Notification' in window && 'serviceWorker' in navigator) {
  for (var i = 0; i < enableNotificationsButtons.length; ++i) {
    enableNotificationsButtons[i].style.display = 'inline-block';
    enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
  }
}