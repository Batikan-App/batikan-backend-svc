const { Firestore } = require('@google-cloud/firestore');

async function updateUserProfile(userId, data) {
  const db = new Firestore();

  // Find existing user by userId
  const userDoc = await db.collection('users').doc(userId).update(data);

  return userDoc;
}

async function getUserProfile(userId) {
  const db = new Firestore();

  // Find existing user by email
  const userData = await db.collection('users').doc(userId).get();

  return userData;
}

module.exports = { updateUserProfile, getUserProfile };
