const { Firestore } = require('@google-cloud/firestore');

async function getCart(userId) {
  const db = new Firestore();

  // Fetch user's cart
  const userCartRef = db.collection('carts').doc(userId);
  const userCartDoc = await userCartRef.get();

  // Check if user's cart exists
  if (!userCartDoc.exists) {
    return {
      cartItems: [],
      totalPrice: 0,
    };
  }

  // Define totalPrice of user's cart
  const totalPrice = userCartDoc.data().totalPrice || 0;

  // List all cart item
  const listCartItem = await userCartRef.listCollections();
  const cartItems = [];

  // Iterate through each cart items and fetch the data
  for (const item of listCartItem) {
    const itemsSnapshot = await item.get();

    itemsSnapshot.forEach((doc) => {
      const itemData = doc.data();
      cartItems.push({
        ...itemData,
        itemSubId: doc.id,
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

  // Fetch data batik and define cart for user
  const cartItems = db.collection('carts').doc(userId);
  const batikItem = await db.collection('batik').doc(itemId).get();

  const itemName = batikItem.data().name;
  const price = batikItem.data().price;
  const itemImage = batikItem.data().img;

  // Preparing data for cart information
  const cartData = {
    itemId,
    itemName,
    itemImage,
    quantity,
    price,
  };

  // Store cart information into database
  await cartItems.collection(itemName).add(cartData);

  // Define base totalPrice data and list all cart item
  let totalPrice = 0;
  const listCartItem = await cartItems.listCollections();

  // Update totalPrice cart item
  for (const item of listCartItem) {
    const itemsSnapshot = await item.get();
    itemsSnapshot.forEach(doc => {
      totalPrice += doc.data().price * doc.data().quantity;
    });
  }

  // Define data totalPrice and created date of cart
  const cart = {
    totalPrice,
    createdAt: Firestore.FieldValue.serverTimestamp(),
  };

  // Store data totalPrice and created date into cart
  const cartDoc = await cartItems.set(
    cart,
    { merge: true } // Ensure no data is overwritten
  );

  return cartDoc;
}

async function updateCart(userId, itemName, itemSubId, quantity) {
  const db = new Firestore();

  // Fetch user's cart
  const userCartRef = db.collection('carts').doc(userId);

  // Fetch user's cart batik item
  const batikItem = userCartRef.collection(itemName);
  const batikItemRef = batikItem.doc(itemSubId);

  // Fetch the batik item and check if it's already exists
  const batikItemSnapshot = await batikItemRef.get();
  if (!batikItemSnapshot.exists) {
    throw new Error('Batik item not found');
  }

  // Handle deletion of item if quantity is 0 (zero)
  if (quantity === 0) {

    // Delete cart batik item that has zero quantity
    await batikItemRef.delete();

  } else {
    // Update only the quantity if it's not 0 (zero)
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

    // Update the user's cart total price data with the new total price
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

  // Fetch user's cart
  const userCartRef = db.collection('carts').doc(userId);

  // List all user's cart item
  const subCollections = await userCartRef.listCollections();

  if (subCollections.length > 0) {
    for (const subCollection of subCollections) {
      await deleteCollection(db, subCollection);
    }
  }

  // Delete the user's cart
  return await userCartRef.delete();

}

// Utility function to delete a collection
async function deleteCollection(db, collectionRef, batchSize = 10) {
  const query = collectionRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    const deleteBatch = async () => {
      const snapshot = await query.get();

      if (snapshot.empty) {
        resolve();
        return;
      }

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      // Continue deleting the next batch
      process.nextTick(deleteBatch);
    };

    deleteBatch().catch(reject);
  });
}

module.exports = { getCart, addCart, updateCart, deleteCart };
