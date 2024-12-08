const { Firestore } = require('@google-cloud/firestore');

async function getCart(userId) {
  const db = new Firestore();

  // Fetch user's cart
  const userCart = db.collection('carts').doc(userId);
  const userCartDoc = await userCart.get();

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
  const cartItems = await userCart.collection('items').get();
  const cartItem = [];

  // Iterate through each cart items and fetch the data
  cartItems.forEach((doc) => {
    const item = doc.data();
    cartItem.push({
      ...item
    });
  });


  return {
    id: userId,
    cartItem,
    totalPrice,
  };

}


async function addCart(userId, itemId, quantity) {
  const db = new Firestore();

  // Fetch data batik and define cart for user
  const userCart = db.collection('carts').doc(userId);
  const batikItem = await db.collection('batik').doc(itemId).get();

  // Define base totalPrice data and list all cart item
  let totalPrice = 0;

  const cartItemsDoc = await userCart.collection('items').doc(itemId).get();

  // Update quantity if adding items is already exists
  if (cartItemsDoc.exists) {
    const oldQuantity = cartItemsDoc.data().quantity;
    const newQuantity = quantity + oldQuantity;

    await userCart.collection('items').doc(itemId).update({ quantity: newQuantity });

  } else {

    const itemName = batikItem.data().name;
    const price = batikItem.data().price;
    const itemImage = batikItem.data().img;

    // Preparing data for cart information
    const cartData = {
      id: itemId,
      name: itemName,
      img: itemImage,
      quantity,
      price,
    };

    // Store cart information into database
    await userCart.collection('items').doc(itemId).set(cartData);

  }

  // Update totalPrice cart item
  const cartItems = await userCart.collection('items').get();
  cartItems.forEach(doc => {
    const item = doc.data();
    totalPrice += item.price * item.quantity;
  });

  // Define data totalPrice and created date of cart
  const cart = {
    totalPrice,
    createdAt: Firestore.FieldValue.serverTimestamp(),
  };

  // Store data totalPrice and created date into cart
  await userCart.set(
    cart,
    { merge: true } // Ensure no data is overwritten
  );

  return userCart;
}

async function updateCart(userId, itemId, quantity) {
  const db = new Firestore();

  // Fetch user's cart
  const userCart = db.collection('carts').doc(userId);

  // Fetch user's cart batik item
  const cartItemsDoc = userCart.collection('items').doc(itemId);

  // Handle deletion of item if quantity is 0 (zero)
  if (quantity === 0) {

    // Delete cart batik item that has zero quantity
    await cartItemsDoc.delete();

  } else {
    // Update only the quantity if it's not 0 (zero)
    await cartItemsDoc.update({ quantity });
  }

  // Recalculate totalPrice
  let totalPrice = 0;

  // Update totalPrice cart item
  const cartItems = await userCart.collection('items').get();
  cartItems.forEach(doc => {
    const item = doc.data();
    totalPrice += item.price * item.quantity;
  });


  // Update the user's cart total price data with the new total price
  return await userCart.set(
    {
      totalPrice,
      createdAt: Firestore.FieldValue.serverTimestamp(),
    },
    { merge: true } // Ensure no data is overwritten
  );

}

async function deleteCart(userId) {
  const db = new Firestore();

  // Fetch user's cart
  const userCart = db.collection('carts').doc(userId);

  // List all user's cart item
  const cartItems = await userCart.collection('items').get();

  // Delete each document in the 'items' sub-collection
  const cartItem = cartItems.docs.map((doc) => doc.ref.delete());
  await Promise.all(cartItem); // Wait for all deletions to complete

  // Delete the user's cart
  return await userCart.delete();

}

module.exports = { getCart, addCart, updateCart, deleteCart };
