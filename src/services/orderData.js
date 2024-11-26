const { Firestore } = require('@google-cloud/firestore');

async function getOrder(userId) {
  const db = new Firestore();

  // Define Main User's Order Document Reference
  const userOrderRef = db.collection('orders').doc(userId);

  // Fetch Main User's Order Document Reference
  const orderDocSnapshot = await userOrderRef.get();

  // Extract User's Order Document Data
  const orderData = orderDocSnapshot.data();

  // List all User's Order Collection
  const orderCollections = await userOrderRef.listCollections();
  const orderItems = [];

  // Iterate Order Collection
  for (const orderCollection of orderCollections) {
    const orderCollectionSnapshot = await orderCollection.get();
    const orderCollectionItems = [];

    // Fetch each document in the sub-collection
    for (const doc of orderCollectionSnapshot.docs) {
      const itemData = doc.data();

      // Prepare an array for sub-subcollection data
      const itemOrderCollection = await doc.ref.listCollections();
      const itemOrderCollectionData = [];

      // Iterate through sub-subcollections (e.g., "Mega Mendung")
      for (const itemOrder of itemOrderCollection) {
        const itemOrderSnapshot = await itemOrder.get();
        const itemOrderSnapshotItems = [];

        // Fetch each document in the sub-subcollection
        itemOrderSnapshot.forEach((itemOrderDoc) => {
          itemOrderSnapshotItems.push({
            id: itemOrderDoc.id, // Sub-subcollection document ID
            ...itemOrderDoc.data(), // Sub-subcollection document fields
          });
        });

        itemOrderCollectionData.push({
          itemName: itemOrder.id, // Sub-subcollection name
          data: itemOrderSnapshotItems, // List of items in this sub-subcollection
        });
      }

      orderCollectionItems.push({
        //id: doc.id, // Subcollection document ID
        ...itemData, // Subcollection document fields
        orderItems: itemOrderCollectionData, // Include sub-subcollection data
      });
    }

    // Add sub-collection name and its items
    orderItems.push({
      orderId: orderCollection.id, // Subcollection name
      data: orderCollectionItems, // List of items in this subcollection
    });
  }

  // Return combined order data, items, and sub-subcollection data
  return {
    id: userId, // Order ID
    ...orderData, // Order metadata
    orderItems, // Subcollection items including sub-subcollections
  };

}

async function addOrder(userId) {
  const db = new Firestore();

  // Fetch document for orders and carts
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
    "status": "In Delivery"
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
