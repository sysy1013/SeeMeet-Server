const admin = require('firebase-admin');
const serviceAccount = require('./seemeet-700c2-firebase-adminsdk-wxykw-df07d8058e.json');
const dotenv = require('dotenv');

dotenv.config();

let firebase;
if (admin.apps.length === 0) {
  firebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  firebase = admin.app();
}

module.exports = {
  api: require('./api'),
};
