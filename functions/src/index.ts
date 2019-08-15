import * as functions from 'firebase-functions';
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const fs = require('fs');
const webpush = require('web-push');

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(fs.readFileSync("./udemy-pwa-firebase.json"))),
  databaseURL: 'https://udemy-pwa-bc405.firebaseio.com/'
});

exports.storePostData = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    admin.database().ref('posts').push({
      id: request.body.id,
      title: request.body.title,
      location: request.body.location,
      image: request.body.image,
    })
    .then(() => {
      webpush.setVapidDetails(
        'mailto:kees.schotanus@planet.nl',
        'pubBGKUmnOytLjQkNUJvI6tGPY1KmuJ5JG5J2yPO8KWhouDaVe2nxDR1d3oV0J62jPTzpyrLn7ehx667PQ3VDCP1VYkey',
        'mvewgDDdG82wnzK8mdXB9D-TjPOxr1tNVesMnWu0cwA');
      return admin.database().ref('subscriptions').once('value');
    })
    .then((subscriptions: any) => {
      subscriptions.forEach((subscription: any) => {
        const pushConfig = {
          endpoint: subscription.val().endpoint,
          keys: {
            auth: subscription.val().keys.auth,
            p256dh: subscription.val().p256dh
          }
        }
        webpush.sendNotification(pushConfig, JSON.stringify({
          title: "New Post",
          content: 'New Post added!'
        }))
        .catch((err: any) => {
          console.log(err);
        })
      });
      response.status(201).json({ message: 'Data stored', id: request.body.id }) 
    })
  })
  .catch((err: any) => {
    response.status(500).json({error: err})
  });
});

