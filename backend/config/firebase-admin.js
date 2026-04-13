const admin = require('firebase-admin');

// Initialize Firebase Admin with project ID only (uses default credentials or just verifies tokens)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

module.exports = admin;
