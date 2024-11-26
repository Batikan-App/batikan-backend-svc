const { Firestore } = require('@google-cloud/firestore');

async function userRegisterData(userId, data) {
  const db = new Firestore();

  const register = db.collection('users');

  return register.doc(userId).set(data);
}

async function userCheck(email) {
  const db = new Firestore();

  // Find existing user by email
  const userDoc = await db.collection('users').where('email', '==', email).get();

  return userDoc;
}

async function userSessionData(userId, token) {
  const db = new Firestore();

  // Define session data
  const sessionData = {
    id: token,
    userId: userId,
    created_at: Firestore.Timestamp.now(),
    expires_at: Firestore.Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), // 24 hours
  };

  // Store session data into database
  const sessions = await db.collection('sessions').doc(token).set(sessionData);

  return sessions;
}

async function sessionCheck(token) {
  const db = new Firestore();

  // Fetch session data
  const sessions = await db.collection('sessions').doc(token).get();

  return sessions;

}

async function sessionDelete(token) {
  const db = new Firestore();

  // Delete session data
  const sessions = await db.collection('sessions').doc(token).delete();

  return sessions;
}

module.exports = { userRegisterData, userCheck, userSessionData, sessionCheck, sessionDelete };
