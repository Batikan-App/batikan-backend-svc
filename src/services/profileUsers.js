const { Firestore } = require('@google-cloud/firestore');

async function updateUserProfile(email, data) {
  const db = new Firestore();

  // Find existing user by email
  const userDoc = await db.collection('credential').doc(email).update(data);

  return userDoc;
}

async function getUserProfile(email) {
  const db = new Firestore();

  // Find existing user by email
  const userDoc = await db.collection('credential').doc(email).get();

  return userDoc;
}

module.exports = { updateUserProfile, getUserProfile };
