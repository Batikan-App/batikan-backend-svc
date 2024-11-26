const { Firestore } = require('@google-cloud/firestore');

async function getOrder(userId) {
  const db = new Firestore();

  // Fetch user's orders
  const userOrderRef = db.collection('orders').doc(userId);
  const orderDocSnapshot = await userOrderRef.get();

  // Get user's orders data
  const orderData = orderDocSnapshot.data();

  // List all user's order item collection
  const orderCollections = await userOrderRef.listCollections();
  const orderItems = [];

  // Iterate user's item order
  for (const orderCollection of orderCollections) {
    const orderCollectionSnapshot = await orderCollection.get();
    const orderCollectionItems = [];

    // Fetch each data inside user's item order
    for (const doc of orderCollectionSnapshot.docs) {
      const itemData = doc.data();

      // Prepare an array for batik item data inside order collection
      const itemOrderCollection = await doc.ref.listCollections();
      const itemOrderCollectionData = [];

      // Iterate through every batik item data
      for (const itemOrder of itemOrderCollection) {
        const itemOrderSnapshot = await itemOrder.get();
        const itemOrderSnapshotItems = [];

        // Fetch each order item data
        itemOrderSnapshot.forEach((itemOrderDoc) => {
          itemOrderSnapshotItems.push({
            ...itemOrderDoc.data(),
          });
        });

        // Fetch each order batik item data
        itemOrderCollectionData.push({
          itemName: itemOrder.id, // Sub-subcollection name
          data: itemOrderSnapshotItems, // List of items in this sub-subcollection
        });
      }

      // Add all order data into collecting array data
      orderCollectionItems.push({
        ...itemData,
        orderItems: itemOrderCollectionData,
      });
    }

    // Add all data that has been fetch
    orderItems.push({
      orderId: orderCollection.id,
      data: orderCollectionItems,
    });
  }

  // Return all data for displaying only
  return {
    userId: userId, // User ID
    orders: orderItems, // Order items
  };

}

async function addOrder(userId, name, phone, address) {
  const db = new Firestore();

  // Fetch document data for orders and carts
  const orderCollection = db.collection('orders').doc(userId);
  const cartCollection = db.collection('carts').doc(userId);

  // Retrieve the cart item and its sub-collection
  const cartItem = await cartCollection.get();
  if (!cartItem.exists) {
    throw new Error('Cart does not exist.');
  }

  // Get cart data like totalPrice and createdDate
  const cartData = {
    ...cartItem.data(),
    "status": "In Delivery",
    "name": name,
    "phone": phone,
    "address": address
  };

  // Retrieve all data inside cart item
  const subCollections = await cartCollection.listCollections();
  const cartSubCollectionData = {};
  for (const subCollection of subCollections) {
    const subCollectionDocs = await subCollection.get();
    cartSubCollectionData[subCollection.id] = subCollectionDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  // Generate a random unique ID for order id
  const orderId = db.collection('_').doc().id;

  // Define orders sub-collection
  const ordersSubCollectionRef = orderCollection.collection(orderId);

  // Save the cart document
  await ordersSubCollectionRef.doc(cartItem.id).set(cartData);

  // Save the sub-collection data under the cart document
  for (const [subCollectionId, subCollectionDocs] of Object.entries(cartSubCollectionData)) {
    const targetSubCollectionRef = ordersSubCollectionRef
      .doc(cartItem.id)
      .collection(subCollectionId);
    for (const doc of subCollectionDocs) {
      await targetSubCollectionRef.doc(doc.id).set(doc);

      // Update stock and sales for each Batik item
      const batikItemRef = db.collection('batik').doc(doc.itemId);
      const batikItemSnapshot = await batikItemRef.get();

      const batikItemData = batikItemSnapshot.data();
      const newStock = batikItemData.stock - doc.quantity;

      if (newStock < 0) {
        throw new Error(`Insufficient stock for item ID ${doc.itemId}.`);
      }

      const newSales = (batikItemData.sold || 0) + doc.quantity;

      // Update stock and sales in batch
      await batikItemRef.update({
        stock: newStock,
        sold: newSales,
      });

    }
  }
  

  return {
    "orderId": orderId,
    "totalPayment": cartItem.data().totalPrice
  };
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
