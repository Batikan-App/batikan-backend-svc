const { Firestore } = require('@google-cloud/firestore');

async function getOrder(userId) {
  const db = new Firestore();

  const userOrderRef = db.collection('orders').doc(userId);

  // List all sub-collections (e.g., Kawung, Mega Mendung)
  const subCollections = await userOrderRef.listCollections();
  const orderItems = [];

  // Iterate through each sub-collection and fetch items
  for (const subCollection of subCollections) {
    const itemsSnapshot = await subCollection.get();

    itemsSnapshot.forEach((doc) => {
      const itemData = doc.data();
      orderItems.push({
        id: doc.id,
        cartId: subCollection.id,
        ...itemData,
      });
    });
  }

  return {
    orderItems,
  };

}

async function addOrder(userId) {
  const db = new Firestore();

  const orderCollection = db.collection('orders').doc(userId);
  const cartCollection = db.collection('carts').doc(userId);

  // Retrieve the cart item and its sub-collection
  const cartItem = await cartCollection.get();
  if (!cartItem.exists) {
    throw new Error('Cart does not exist.');
  }

  // Get data like createdDate and totalPrice
  const cartData = {
    ...cartItem.data(),
    "status": "Pengiriman"
  };

  

  // Retrieve all sub-collections under the cart item
  const subCollections = await cartCollection.listCollections();
  const cartSubCollectionData = {};
  for (const subCollection of subCollections) {
    const subCollectionDocs = await subCollection.get();
    cartSubCollectionData[subCollection.id] = subCollectionDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  // Create a random ID for the new collection under 'orders'
  const randomId = db.collection('_').doc().id; // Generate a random unique ID

  // Save the cart document and its sub-collection into the 'orders' structure
  const ordersSubCollectionRef = orderCollection.collection(randomId);

  // Save the cart document
  await ordersSubCollectionRef.doc(cartItem.id).set(cartData);

  // Save the sub-collection data under the cart document
  for (const [subCollectionId, subCollectionDocs] of Object.entries(cartSubCollectionData)) {
    const targetSubCollectionRef = ordersSubCollectionRef
      .doc(cartItem.id)
      .collection(subCollectionId);
    for (const doc of subCollectionDocs) {
      await targetSubCollectionRef.doc(doc.id).set(doc);
    }
  }
}

async function updateOrder(userId, orderId, status) {
  const db = new Firestore();

  // Reference to the user's cart collection
  const userOrderRef = db.collection('orders').doc(userId);

  // Reference to the specific batik item
  const orderItemRef = userOrderRef.collection(orderId).doc(userId);

  // Update the parent document with the new total price
  return await orderItemRef.set(
    {
      status: status,
    },
    { merge: true } // Ensure no data is overwritten
  );

}


module.exports = { getOrder, addOrder, updateOrder };
