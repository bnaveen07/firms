const admin = require('firebase-admin');
const path = require('path');
const logger = require('../utils/logger');

let firebaseApp;

const initFirebase = () => {
  if (firebaseApp) return firebaseApp;

  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const credential = serviceAccountPath
      ? admin.credential.cert(require(path.resolve(serviceAccountPath)))
      : admin.credential.applicationDefault();

    firebaseApp = admin.initializeApp({
      credential,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    logger.info('Firebase Admin SDK initialized');
  } catch (error) {
    logger.warn(`Firebase Admin SDK not initialized: ${error.message}`);
  }

  return firebaseApp;
};

const getStorage = () => admin.storage().bucket();

module.exports = { initFirebase, getStorage };
