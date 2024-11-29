const { Firestore } = require('@google-cloud/firestore');

async function getOrder(userId) {
  const db = new Firestore();

  // Fetch every orders related to the users
  const userOrders = await db.collection('orders').where('userId', '==', userId).get();

  // Empty order for users
  if (userOrders.empty) {
    return { userId, orders: [] };
  }

  // Array for collecting all orders users
  const orders = [];

  // Process extract every user's order data
  for (const userOrder of userOrders.docs) {

    // Get data field of user order document
    const orderData = userOrder.data();

    // Listing every items inside user's order
    const orderItems = await userOrder.ref.collection('items').get();

    const items = [];

    for (const orderItem of orderItems.docs) {
      items.push({
        ...orderItem.data()
      });
    }

    // Save order's items, order's document data field, and it's orderId into orders
    orders.push({
      orderId: userOrder.id,
      ...orderData,
      items,
    });
  }

  return {
    userId,
    orders,
  };

}

async function addOrder(cartId, name, phone, address) {
  const db = new Firestore();

  // Fetch user carts
  const userCart = await db.collection('carts').doc(cartId).get();

  const totalPrice = userCart.data().totalPrice;

  // Define data field for orders document
  const orderData = {
    userId: cartId,
    totalPayment: totalPrice,
    status: "In Delivery",
    name,
    address,
    phone
  }

  // Create Cart Collection for moving it into Order
  const cartItemData = {};
  const cartItems = db.collection('carts').doc(cartId).collection('items');

  await cartItems.get().then(data => {
    data.forEach(doc => {
      cartItemData[doc.id] = doc.data();
    });
  });

  // Generate a random unique ID for order id
  const orderId = db.collection('_').doc().id;
  const userOrder = db.collection('orders').doc(orderId);

  // Save every carts item into user order's items
  for (const [cartId, cartItem] of Object.entries(cartItemData)) {
    const orderItems = userOrder.collection('items').doc(cartId);

    // Update stock and sales for each Batik item
    const batikItem = db.collection('batik').doc(cartId);
    const batikItemSnapshot = await batikItem.get();

    const batikItemData = batikItemSnapshot.data();
    const newStock = batikItemData.stock - cartItem.quantity;

    // Check insufficient stock
    if (newStock < 0) {
      throw new Error(`Insufficient stock for item ${batikItemData.name}.`);
    }

    // Store cart item into order
    await orderItems.set(cartItem);

    const newSales = (batikItemData.sold || 0) + cartItem.quantity;

    // Update stock and sales in batch
    await batikItem.update({
      stock: newStock,
      sold: newSales,
    });
  }

  // Save Order Data into Order Document
  await userOrder.set(
    {
      ...orderData,
      createdAt: Firestore.FieldValue.serverTimestamp(),
      updatedAt: Firestore.FieldValue.serverTimestamp()
    },
    { merge: true } // Ensure no data is overwritten
  );

  return {
    "orderId": orderId,
    "totalPayment": totalPrice
  };

}

async function updateOrder(userId, orderId, status) {
  const db = new Firestore();

  // Reference to the user's cart collection
  const userOrder = db.collection('orders').doc(orderId);
  const userOrderCheck = await userOrder.get();

  // Check Order is for authorized user only
  if (userOrderCheck.data().userId != userId){
    throw new Error('Order ID is not authorized!');
  }

  // Update the parent document with the new total price
  return await userOrder.set(
    {
      status: status,
      updatedAt: Firestore.FieldValue.serverTimestamp()
    },
    { merge: true } // Ensure no data is overwritten
  );

}


module.exports = { getOrder, addOrder, updateOrder };
