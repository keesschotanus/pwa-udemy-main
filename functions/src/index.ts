import * as functions from 'firebase-functions';
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const fs = require('fs');

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebasevar!");
// });

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
        response.status(201).json({ message: 'Data stored', id: request.body.id}) 
    })
    .catch((err: any) => {
        response.status(500).json({error: err})
    });
  });
});

