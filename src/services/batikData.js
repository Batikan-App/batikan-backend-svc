const { Firestore } = require('@google-cloud/firestore');
 
async function batikData() {
  const db = new Firestore();
 
  // Fetch all batik item
  const batikCollection = db.collection('batik');
  const batikItem = await batikCollection.get();

  return batikItem;

}

async function batikGetIdData(batikId) {
  const db = new Firestore();
 
  // Fetch batik item data
  const batikDoc = db.collection('batik').doc(batikId);
  const batikData = await batikDoc.get();

  return batikData;

}

async function searchByOrigin(origin) {
  const db = new Firestore();

  // Fetch all batik item
  const batikCollection = await db.collection('batik').get();

  // Filter batik item by origin data
  const filteredData = batikCollection.docs
      .map(doc => ({ id: doc.id, ...doc.data() })) // Map to include document ID
      .filter(doc => doc.origin.toLowerCase().includes(origin.toLowerCase())); // Case-insensitive match

  return filteredData
}

module.exports = { batikData, batikGetIdData, searchByOrigin };
