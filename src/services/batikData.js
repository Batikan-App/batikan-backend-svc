const { Firestore } = require('@google-cloud/firestore');
 
async function batikData() {
  const db = new Firestore();
 
  const batikCollection = db.collection('batik');
  const allData = await batikCollection.get();
  return allData;

}

async function batikGetIdData(batikId) {
  const db = new Firestore();
 
  const batikDocument = db.doc(`batik/${batikId}`);
  const specificData = await batikDocument.get();
  return specificData;

}

async function searchByOrigin(origin) {
  // Fetch all documents from the 'batik' collection
  const db = new Firestore();
  const batikCollection = await db.collection('batik').get();

  // Filter documents where 'origin' matches the input substring
  const filteredData = batikCollection.docs
      .map(doc => ({ id: doc.id, ...doc.data() })) // Map to include document ID
      .filter(doc => doc.origin.toLowerCase().includes(origin.toLowerCase())); // Case-insensitive match

  return filteredData
}

async function batikCategories() {
  const categorySet = new Set();
  const db = new Firestore();

  const batikCollection = await db.collection('batik').get();

  batikCollection.forEach(doc => {
    const category = doc.data().category;
    categorySet.add(category);
  });

  const categories = Array.from(categorySet);
  return categories;
}

async function batikFilterCategories(category) {
  const db = new Firestore();

  const query = db.collection('batik').where('category', '==', category);
  const querySnapshot = await query.get();

  const filteredBatik = querySnapshot.docs.map(doc => doc.data()); // Efficiently map data

  return filteredBatik;
}

module.exports = { batikData, batikGetIdData, batikCategories, batikFilterCategories, searchByOrigin };
