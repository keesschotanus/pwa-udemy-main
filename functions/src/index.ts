// To upload to firebase:
// 1) Copy the content of udemy-pwa-firebase.json
// 2) Paste it as the assignment to serviceAccount
// 3) execute: npx firebase deploy (from the functions directory)

import * as functions from 'firebase-functions';
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const fs = require('fs');
const webpush = require('web-push');
const Busboy = require("busboy");
const os = require("os");
const UUID = require('uuid-v4');
const serviceAccount = JSON.parse(fs.readFileSync("./udemy-pwa-firebase.json"));
const path = require('path');

const gcconfig = {
  projectId: 'udemy-pwa-bc405',
  keyFilename: 'udemy-pwa-firebase.json'
}

const gcs = require('@google-cloud/storage')(gcconfig);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://udemy-pwa-bc405.firebaseio.com/'
});

exports.storePostData = functions.https.onRequest(function (request, response) {
  cors(request, response, function () {
    const uuid = UUID();

    const busboy = new Busboy({ headers: request.headers });
    // These objects will store the values (file + fields) extracted from busboy
    let upload: any;
    const fields:any = {};

    // This callback will be invoked for each file uploaded
    busboy.on("file", (fieldname: string, file: any, filename: string, encoding: string, mimetype: string) => {
      console.log(
        `File [${fieldname}] filename: ${filename}, encoding: ${encoding}, mimetype: ${mimetype}`
      );
      const filepath = path.join(os.tmpdir(), filename);
      upload = { file: filepath, type: mimetype };
      file.pipe(fs.createWriteStream(filepath));
    });

    // This will invoked on every field detected
    busboy.on('field', function (fieldname: string, val: any, fieldnameTruncated: string, valTruncated: any, encoding: string, mimetype: string) {
      fields[fieldname] = val;
    });

    // This callback will be invoked after all uploaded files are saved.
    busboy.on("finish", () => {
      const bucket = gcs.bucket("udemy-pwa-bc405.appspot.com");
      bucket.upload(
        upload.file,
        {
          uploadType: "media",
          metadata: {
            metadata: {
              contentType: upload.type,
              firebaseStorageDownloadTokens: uuid
            }
          }
        },
        function (err: any, uploadedFile: any) {
          if (!err) {
            admin
              .database()
              .ref("posts")
              .push({
                id: fields.id,
                title: fields.title,
                location: fields.location,
                rawLocation: {
                  lat: fields.rawLocationLat,
                  lng: fields.rawLocationLng
                },
                image:
                  "https://firebasestorage.googleapis.com/v0/b/" +
                  bucket.name +
                  "/o/" +
                  encodeURIComponent(uploadedFile.name) +
                  "?alt=media&token=" +
                  uuid
              })
              .then(function () {
                webpush.setVapidDetails(
                  'mailto:kees.schotanus@planet.nl',
                  'pubBGKUmnOytLjQkNUJvI6tGPY1KmuJ5JG5J2yPO8KWhouDaVe2nxDR1d3oV0J62jPTzpyrLn7ehx667PQ3VDCP1VYkey',
                  'mvewgDDdG82wnzK8mdXB9D-TjPOxr1tNVesMnWu0cwA'
                );
                return admin
                  .database()
                  .ref("subscriptions")
                  .once("value");
              })
              .then(function (subscriptions:any) {
                subscriptions.forEach(function (sub: any) {
                  const pushConfig = {
                    endpoint: sub.val().endpoint,
                    keys: {
                      auth: sub.val().keys.auth,
                      p256dh: sub.val().keys.p256dh
                    }
                  };

                  webpush
                    .sendNotification(
                      pushConfig,
                      JSON.stringify({
                        title: "New Post",
                        content: "New Post added!",
                        openUrl: "/help"
                      })
                    )
                    .catch(function (error2: any) {
                      console.log(error2);
                    });
                });
                response
                  .status(201)
                  .json({ message: "Data stored", id: fields.id });
              })
              .catch(function (error: any) {
                response.status(500).json({ error: err });
              });
          } else {
            console.log(err);
          }
        }
      );
    });

    // The raw bytes of the upload will be in request.rawBody.  Send it to busboy, and get
    // a callback when it's finished.
    busboy.end(request.rawBody);
    // formData.parse(request, function(err, fields, files) {
    //   fs.rename(files.file.path, "/tmp/" + files.file.name);
    //   var bucket = gcs.bucket("YOUR_PROJECT_ID.appspot.com");
    // });
  });
});


// exports.storePostData = functions.https.onRequest((request, response) => {
//   cors(request, response, () => {
//     let uuid = UUID();
//     let formData = new formidable.IncomingForm();
//     formData.parse(request, (err, fields, files) => {
//       fs.rename(files.file.path, '/tmp/' + files.file.name);
//       let bucket = gcs.bucket('udemy-pwa-bc405.appspot.com');
//       bucket.upload('/tmp/' + files.file.name, {
//         uploadType: 'media',
//         metadata: {
//           metadata: {
//             contentType: files.file.type,
//             firebaseStorageDownloadTokens: uuid
//           }
//         }
//       }, (err, file) => {
//         if (err) {
//           console.log(err);
//         } else {
//           admin.database().ref('posts').push({
//             id: fields.id,
//             title: fields.title,
//             location: fields.location,
//             image: 'https://firebasestorage.googleapi.com/v0/b/' + bucket.name + '/o/' + encodeURIComponent(file.name) +"?alt=media&token=" + uuid
//           })
//           .then(() => {
//             webpush.setVapidDetails(
//               'mailto:kees.schotanus@planet.nl',
//               'pubBGKUmnOytLjQkNUJvI6tGPY1KmuJ5JG5J2yPO8KWhouDaVe2nxDR1d3oV0J62jPTzpyrLn7ehx667PQ3VDCP1VYkey',
//               'mvewgDDdG82wnzK8mdXB9D-TjPOxr1tNVesMnWu0cwA');
//             return admin.database().ref('subscriptions').once('value');
//           })
//           .then((subscriptions: any) => {
//             subscriptions.forEach((subscription: any) => {
//               const pushConfig = {
//                 endpoint: subscription.val().endpoint,
//                 keys: {
//                   auth: subscription.val().keys.auth,
//                   p256dh: subscription.val().p256dh
//                 }
//               }
//               webpush.sendNotification(pushConfig, JSON.stringify({
//                 title: "New Post",
//                 content: 'New Post added!'
//               }))
//                 .catch((err: any) => {
//                   console.log(err);
//                 })
//             });
//             response.status(201).json({ message: 'Data stored', id: fields.id })
//           })
//         })
//         .catch((err: any) => {
//           response.status(500).json({ error: err })
//         });

//         }
//       });

//     })
// });

