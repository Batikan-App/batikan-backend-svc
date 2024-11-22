const { Firestore } = require('@google-cloud/firestore');

async function userRegisterData(email, data) {
  const db = new Firestore();

  const register = db.collection('credential');

  return register.doc(email).set(data);
}

async function registerCheck(email) {
  const db = new Firestore();

  // Find existing user by email
  const userDoc = await db.collection('credential').doc(email).get();

  return userDoc;
}

async function userLoginData(email, password) {
  const db = new Firestore();

  // Find the user by email
  const userDoc = await db.collection('credential').doc(email).get();

  return userDoc;
}

async function userSessionData(user, token) {
  const db = new Firestore();

  const sessionData = {
    email: user,
    created_at: Firestore.Timestamp.now(),
    expires_at: Firestore.Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), // 24 hours
  };

  const session = await db.collection('session').doc(token).set(sessionData);

  return session;
}

async function sessionCheck(token) {
  const db = new Firestore();

  const session = await db.collection('session').doc(token).get();

  return session;

}

async function sessionDelete(token) {
  const db = new Firestore();

  const session = await db.collection('session').doc(token).delete();

  return session;
}

module.exports = { userRegisterData, userLoginData, registerCheck, userSessionData, sessionCheck, sessionDelete };
