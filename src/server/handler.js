const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const uuid = require('uuid');
const { userRegisterData, userCheck, sessionCheck, userSessionData, sessionDelete } = require('../services/authUsers');
const { updateUserProfile, getUserProfile } = require('../services/profileUsers');
const { batikData, batikGetIdData, searchByOrigin } = require('../services/batikData');
const { getCart, addCart, updateCart, deleteCart } = require('../services/cartData');
const { getOrder, addOrder, updateOrder } = require('../services/orderData');
const scanBatik = require('../services/scanBatik');


async function getBatikHandler(request, h) {

  // Fetch all Batik items
  const batikItem = await batikData();

  // Fetch all data of Batik items
  const data = batikItem.docs.map((doc) => ({
    id: doc.id,
    data: {
      ...doc.data()
    },
  }));

  return h.response({
    status: 'success',
    data
  }).code(200);
}

async function getBatikByIdHandler(request, h) {
  const { batikId } = request.params;

  // Fetch specific Batik data by ID
  const batikDoc = await batikGetIdData(batikId);

  if (batikDoc.exists) {
    const batik = batikDoc.data();
    return h.response({
      status: 'success',
      data: {
        batik
      },
    }).code(200);
  } else {
    return h.response({
      status: 'failed',
      message: 'Batik not found'
    }).code(404);
  }
}

async function searchByKeywordHandler(request, h) {
  const { q } = request.query;

  // Check query parameter
  if (!q) {
    return h.response({
      status: 'failed',
      message: 'Query parameter is required',
    }).code(400);
  }

  try {
    // Fetch all Batik items
    const batikItem = await batikData();

    // Normalize the keyword for case-insensitive matching
    const keyword = q.toLowerCase();

    // Filter Batik items where any field contains the keyword
    const filteredData = batikItem.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(doc => {
        // Check all fields of the document
        return Object.values(doc).some(value => {
          if (typeof value === 'string') {
            // Check if the string field contains the keyword
            return value.toLowerCase().includes(keyword);
          } else if (Array.isArray(value)) {
            // Check if any array element contains the keyword
            return value.some(item =>
              typeof item === 'string' && item.toLowerCase().includes(keyword)
            );
          }
          // Skip non-string fields
          return false;
        });
      });

    // Return the filtered data
    if (filteredData.length > 0) {
      return h.response({
        status: 'success',
        data: filteredData,
      }).code(200);
    } else {
      return h.response({
        status: 'failed',
        message: `No documents found with keyword "${q}"`,
      }).code(404);
    }
  } catch (error) {
    return h.response({
      status: 'error',
      message: 'An error occurred while processing the request',
    }).code(500);
  }
}

async function searchByOriginHandler(request, h) {
  const { q } = request.query;

  // Check query parameter
  if (!q) {
    return h.response({
      status: 'failed',
      message: 'Query parameter is required',
    }).code(400);
  }

  try {

    // Search data by it's origin
    const filteredData = await searchByOrigin(q);

    if (filteredData.length > 0) {
      return h.response({
        status: 'success',
        data: filteredData,
      }).code(200);
    } else {
      return h.response({
        status: 'failed',
        message: `No documents found with origin containing "${q}"`,
      }).code(404);
    }
  } catch (error) {
    return h.response({
      status: 'error',
      message: 'An error occurred while processing the request',
    }).code(500);
  }
}

async function userRegisterHandler(request, h) {
  const { name, email, phone, password, verify_password } = request.payload;

  // Generate userId data
  const userId = crypto.randomBytes(16).toString('hex');

  // Hashing the password and verify it
  const hashPassword = await bcrypt.hash(password, 10);
  const verifyPassword = await bcrypt.compare(verify_password, hashPassword);

  if (!verifyPassword) {
    return h.response({
      status: 'failed',
      message: 'Verify password is wrong!'
    }).code(409);
  }

  const data = {
    "id": userId,
    "name": name,
    "email": email,
    "phone": phone,
    "password": hashPassword
  }

  // Check existing the user by email
  const existUsers = await userCheck(email);

  if (!existUsers.empty) {
    return h.response({
      status: 'failed',
      message: 'Users email is already existed!'
    }).code(409);
  }

  // Registering user data to the databases
  await userRegisterData(userId, data);

  return h.response({
    status: 'success',
    message: 'User registered successfully'
  }).code(200);
}


async function userLoginHandler(request, h) {
  const { email, password } = request.payload;

  // Find the user by email
  const existUsers = await userCheck(email);
  const userDoc = existUsers.docs[0];

  if (existUsers.empty) {
    return h.response({
      status: 'failed',
      message: 'Invalid credentials'
    }).code(401);
  }

  // Fetch user data
  const userData = userDoc.data();

  // Compare the hashed password
  const isMatch = await bcrypt.compare(password, userData.password);

  if (isMatch) {
    // Generate session token
    const sessionToken = uuid.v4();

    // Save session in Firestore
    await userSessionData(userData.id, sessionToken);

    // Successful login, implement authentication token generation or session management
    return h.response({
      status: 'success',
      message: 'Login successful',
      token: sessionToken,
    }).code(200);
  } else {
    return h.response({
      status: 'failed',
      message: 'Invalid credentials',
    }).code(401);
  }
}

async function userLogoutHandler(request, h) {
  const sessionToken = request.headers['authorization'];

  // Delete session from Firestore
  await sessionDelete(sessionToken);

  return h.response({
    status: 'success',
    message: 'Logged out successfully',
  }).code(200);

}

async function getProfileHandler(request, h) {

  // Get session token id
  const sessionId = request.headers['authorization'];

  // Fetch userId from session
  const sessionDoc = await sessionCheck(sessionId);
  const userId = sessionDoc.data().userId;

  // Fetch user profile data
  const userDoc = await getUserProfile(userId);

  // Prepare data profile
  const data = {
    "name": userDoc.data().name,
    "email": userDoc.data().email,
    "phone": userDoc.data().phone
  }

  if (!userDoc.exists) {
    return h.response({
      status: 'failed',
      message: 'User not found'
    }).code(404);
  }

  return h.response({
    status: 'success',
    data: data
  }).code(200);
}

async function editProfileHandler(request, h) {
  const { name, phone, email, password, verify_password } = request.payload;

  // Get session token id
  const sessionId = request.headers['authorization'];

  // Fetch userId from session
  const sessionDoc = await sessionCheck(sessionId);
  const userId = sessionDoc.data().userId;

  // Fetch user profile data
  const userDoc = await getUserProfile(userId);


  // Validate user data is existed
  if (!userDoc.exists) {
    return h.response({
      status: 'failed',
      message: 'User not found',
    }).code(404);
  }

  // Check update password
  if (password) {
    const hashPassword = await bcrypt.hash(password, 10);
    const verifyPassword = await bcrypt.compare(verify_password, hashPassword);

    if (!verifyPassword) {
      return h.response({
        status: 'failed',
        message: 'Verify password is wrong!',
      }).code(409);
    }

    // Update with hashed password
    await updateUserProfile(userId, {
      name,
      email,
      phone,
      password: hashPassword,
    });
  } else {
    // Update without password
    await updateUserProfile(userId, {
      name,
      email,
      phone,
    });
  }

  return h.response({
    status: 'success',
    message: 'Profile updated successfully'
  }).code(200);
}

async function addCartHandler(request, h) {
  const { itemId, quantity } = request.payload;

  // Get session token id
  const sessionId = request.headers['authorization'];

  // Fetch userId from session
  const sessionDoc = await sessionCheck(sessionId);
  const userId = sessionDoc.data().userId;

  try {

    // Store data into cart
    const cartDoc = await addCart(userId, itemId, quantity);

    return h.response({
      status: 'success',
      message: 'Item added to cart successfully',
      cartId: cartDoc.id
    }).code(200);
  } catch (error) {
    return h.response({
      status: 'failed',
      message: 'Failed to add item to cart',
    }).code(500);
  }
};


async function getCartHandler(request, h) {

  // Get session token id
  const sessionId = request.headers['authorization'];

  // Fetch userId from session
  const sessionDoc = await sessionCheck(sessionId);
  const userId = sessionDoc.data().userId;

  const dataCart = await getCart(userId);

  return h.response({
    status: 'success',
    data: dataCart
  }).code(200);
}

async function updateCartHandler(request, h) {
  const { itemId, quantity } = request.payload;

  // Get session token id
  const sessionId = request.headers['authorization'];

  // Fetch userId from session
  const sessionDoc = await sessionCheck(sessionId);
  const userId = sessionDoc.data().userId;

  try {

    // Update cart batik item quantity
    await updateCart(userId, itemId, quantity);

    return h.response({
      status: 'success',
      message: 'Item updated to cart successfully',
    }).code(200);
  } catch (error) {
    return h.response({
      status: 'failed',
      message: 'Failed to update item quantity',
    }).code(500);
  }
}

async function deleteCartHandler(request, h) {
  // Get session token id
  const sessionId = request.headers['authorization'];

  // Fetch userId from session
  const sessionDoc = await sessionCheck(sessionId);
  const userId = sessionDoc.data().userId;

  try {

    // Delete user's cart
    await deleteCart(userId);

    return h.response({
      status: 'success',
      message: 'Cart successfully deleted'
    }).code(200);
  } catch (error) {
    return h.response({
      status: 'failed',
      message: 'Failed to delete cart',
    }).code(500);
  }
};

async function getOrderHandler(request, h) {

  // Get session token id
  const sessionId = request.headers['authorization'];

  // Fetch userId from session
  const sessionDoc = await sessionCheck(sessionId);
  const userId = sessionDoc.data().userId;

  // Fetch all user's order data
  const data = await getOrder(userId);

  return h.response({
    status: 'success',
    data: data,
  }).code(200);

}

async function addOrderHandler(request, h) {

  const { name, phone, address } = request.payload;

  // Get session token id
  const sessionId = request.headers['authorization'];

  // Fetch userId from session
  const sessionDoc = await sessionCheck(sessionId);
  const userId = sessionDoc.data().userId;

  try {
    // Add Order Users
    const data = await addOrder(userId, name, phone, address);

    // Delete cart that has been added to order
    await deleteCart(userId);

    return h.response({
      status: 'success',
      message: 'Order added successfully',
      data
    }).code(200);
  } catch (error) {
    return h.response({
      status: 'failed',
      message: error.message
    }).code(500);
  }
}

async function updateOrderHandler(request, h) {
  const { orderId, status } = request.payload;

  // Get session token id
  const sessionId = request.headers['authorization'];

  // Fetch userId from session
  const sessionDoc = await sessionCheck(sessionId);
  const userId = sessionDoc.data().userId;

  try {
    // Update status delivery
    await updateOrder(userId, orderId, status);

    return h.response({
      status: 'success',
      message: 'Order updated successfully',
    }).code(200);
  } catch (error) {
    return h.response({
      status: 'failed',
      message: error.message
    }).code(500);
  }
}

async function batikPredictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;

  const { batikId, confidence } = await scanBatik(model, image);
  const batikData = await batikGetIdData(batikId);

  const response = h.response({
    status: 'success',
    message: 'Model is predicted successfully',
    data: {
      batikId,
      confidence,
      data: batikData.data()
    }
  })

  response.code(201);
  return response;
}


module.exports = { getBatikHandler, getBatikByIdHandler, searchByKeywordHandler, searchByOriginHandler, userRegisterHandler, userLoginHandler, userLogoutHandler, getProfileHandler, editProfileHandler, addCartHandler, getCartHandler, updateCartHandler, deleteCartHandler, getOrderHandler, addOrderHandler, updateOrderHandler, batikPredictHandler };
