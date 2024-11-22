const { Firestore } = require('@google-cloud/firestore');

async function getCart(userId) {
  const db = new Firestore();

  const userCartRef = db.collection('carts').doc(userId);

  // Fetch the parent document for totalPrice
  const userCartDoc = await userCartRef.get();

  // Check if parent document is exists
  if (!userCartDoc.exists) {
    return {
      cartItems: [],
      totalPrice: 0,
    };
  }

  const totalPrice = userCartDoc.data().totalPrice || 0;

  // List all sub-collections carts
  const subCollections = await userCartRef.listCollections();
  const cartItems = [];

  // Iterate through each sub-collection and fetch items
  for (const subCollection of subCollections) {
    const itemsSnapshot = await subCollection.get();

    itemsSnapshot.forEach((doc) => {
      const itemData = doc.data();
      cartItems.push({
        id: doc.id,
        ...itemData,
      });
    });
  }

  return {
    cartItems,
    totalPrice,
  };

}


async function addCart(userId, itemId, quantity) {
  const db = new Firestore();

  const cartCollection = db.collection('carts').doc(userId);

  const batikItem = await db.collection('batik').doc(itemId).get();
  const name = batikItem.data().name;
  const price = batikItem.data().price;

  // Preparing data for Cart Item
  const item = {
    userId,
    itemId,
    quantity,
    price,
  };

  await cartCollection.collection(name).add(item);

  let totalPrice = 0;
  const listCartCollection = await cartCollection.listCollections();

  for (const subCollection of listCartCollection) {
    const querySnapshot = await subCollection.get();
    querySnapshot.forEach(doc => {
      totalPrice += doc.data().price * doc.data().quantity;
    });
  }

  const cart = {
    totalPrice,
    createdAt: Firestore.FieldValue.serverTimestamp(),
  };

  const cartDoc = await cartCollection.set(
    cart,
    { merge: true } // Ensure no data is overwritten
  );

  return cartDoc;
}

async function updateCart(userId, batikId, batikSubId, quantity) {
  const db = new Firestore();

  // Reference to the user's cart collection
  const userCartRef = db.collection('carts').doc(userId);

  // Reference to the specific batik item
  const batikItemRef = userCartRef.collection(batikId).doc(batikSubId);

  // Fetch the batik item and check if it's already exists
  const batikItemSnapshot = await batikItemRef.get();
  if (!batikItemSnapshot.exists) {
    throw new Error('Batik item not found');
  }

  // Handle deletion of item if quantity is 0
  if (quantity === 0) {
    await batikItemRef.delete();

    // Check if the collection is empty after deletion
    const remainingItemsSnapshot = await userCartRef.collection(batikId).get();
    if (remainingItemsSnapshot.empty) {
      // If the collection is empty, delete the entire sub-collection
      await deleteCollection(db, userCartRef.collection(batikId), 10);
    }
  } else {
    // Update only the quantity if it's not zero
    await batikItemRef.update({ quantity });
  }

  // Recalculate totalPrice
  let totalPrice = 0;
  const subCollections = await userCartRef.listCollections();

  if (subCollections.length > 0) {
    for (const subCollection of subCollections) {
      const itemsSnapshot = await subCollection.get();
      itemsSnapshot.forEach((doc) => {
        const data = doc.data();
        totalPrice += data.price * data.quantity; // Multiply price by quantity
      });
    }

    // Update the parent document with the new total price
    return await userCartRef.set(
      {
        totalPrice,
        createdAt: Firestore.FieldValue.serverTimestamp(),
      },
      { merge: true } // Ensure no data is overwritten
    );
  }

}

async function deleteCart(userId) {
  const db = new Firestore();

  // Reference to the user's cart collection
  const userCartRef = db.collection('carts').doc(userId);

  // Delete the item document
  return await userCartRef.delete();

}



module.exports = { getCart, addCart, updateCart, deleteCart };
