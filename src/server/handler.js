//const predictClassification = require('../services/inferenceService');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const uuid = require('uuid');
const { userRegisterData, userLoginData, registerCheck, userSessionData, sessionDelete } = require('../services/authUsers');
const { getUserProfile, updateUserProfile } = require('../services/profileUsers');
const { batikData, batikGetIdData, batikCategories, batikFilterCategories, searchByOrigin } = require('../services/batikData');
const { getCart, addCart, checkCart, updateCart, deleteCart } = require('../services/cartData');
const { getOrder, addOrder, updateOrder } = require('../services/orderData');
const scanBatik = require('../services/scanBatik');


async function getBatikHandler(request, h) {

  // Fetch all Batik data
  const allBatik = await batikData();
  const data = allBatik.docs.map((doc) => ({
    id: doc.id,
    data: {
      name: doc.data().name,
      desc: doc.data().desc,
      img: doc.data().img,
      color: doc.data().color,
      price: doc.data().price,
      origin: doc.data().origin,
      category: doc.data().category,
      stock: doc.data().stock,
      sold: doc.data().sold
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
      status: 'fail',
      message: 'Batik not found'
    }).code(404);
  }
}

async function searchByKeywordHandler(request, h) {
  const { q } = request.query; // Get the query parameter 'q'

  if (!q) {
    return h.response({
      status: 'fail',
      message: 'Query parameter "q" is required',
    }).code(400);
  }

  try {
    // Step 1: Fetch all documents from the 'batik' collection
    const querySnapshot = await batikData();

    // Step 2: Filter documents where any field contains the keyword
    const keyword = q.toLowerCase(); // Normalize the keyword for case-insensitive matching

    const filteredData = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() })) // Map to include document ID
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

    // Step 3: Return the filtered data
    if (filteredData.length > 0) {
      return h.response({
        status: 'success',
        data: filteredData,
      }).code(200);
    } else {
      return h.response({
        status: 'fail',
        message: `No documents found with keyword "${q}"`,
      }).code(404);
    }
  } catch (error) {
    console.error(error);
    return h.response({
      status: 'error',
      message: 'An error occurred while processing the request',
    }).code(500);
  }
}


async function searchByOriginHandler(request, h) {
  const { q } = request.query; // Get the query parameter 'q'

  if (!q) {
    return h.response({
      status: 'fail',
      message: 'Query parameter "q" is required',
    }).code(400);
  }

  try {
    const filteredData = await searchByOrigin(q);

    if (filteredData.length > 0) {
      return h.response({
        status: 'success',
        data: filteredData,
      }).code(200);
    } else {
      return h.response({
        status: 'fail',
        message: `No documents found with origin containing "${q}"`,
      }).code(404);
    }
  } catch (error) {
    console.error(error);
    return h.response({
      status: 'error',
      message: 'An error occurred while processing the request',
    }).code(500);
  }
}


async function getBatikCategories(request, h) {
  const { filter } = request.query;

  if (!filter) {
    const batikArrCategories = await batikCategories();
    return h.response({
      status: 'success',
      data: {
        batikArrCategories,
      },
    }).code(200);
  } else {
    const filteredBatik = await batikFilterCategories(filter);
    if (filteredBatik.length > 0) {
      return h.response({
        status: 'success',
        data: {
          filteredBatik
        },
      }).code(200);
    } else {
      return h.response({
        status: 'fail',
        message: 'No batik found with that category'
      }).code(404);
    }

  }

}

async function userRegisterHandler(request, h) {
  const { name, email, phone, password, verify_password } = request.payload;

  const hashPassword = await bcrypt.hash(password, 10);
  const verifyPassword = await bcrypt.compare(verify_password, hashPassword);

  if (!verifyPassword) {
    return h.response({
      status: 'fail',
      message: 'Verify password is wrong!'
    }).code(409);
  }

  const data = {
    "name": name,
    "email": email,
    "phone": phone,
    "password": hashPassword
  }

  // Check existing the user by email
  const existUsers = await registerCheck(email);

  if (existUsers.exists) {
    return h.response({
      status: 'fail',
      message: 'Users is already existed!'
    }).code(409);
  }

  await userRegisterData(email, data);

  return h.response({
    status: 'success',
    message: 'User registered successfully'
  }).code(200);
}


async function userLoginHandler(request, h) {
  const { email, password } = request.payload;

  // Find the user by email
  const userDoc = await userLoginData(email, password);

  if (!userDoc.exists) {
    return h.response({
      status: 'fail',
      message: 'User not found'
    }).code(404);
  }

  const user = userDoc.data();

  // Compare the hashed password
  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    // Generate session token
    const sessionToken = uuid.v4();

    // Save session in Firestore
    await userSessionData(user.email, sessionToken);

    // Successful login, implement authentication token generation or session management
    return h.response({
      status: 'success',
      message: 'Login successful',
      token: sessionToken,
    }).code(200);
  } else {
    return h.response({
      status: 'fail',
      message: 'Invalid password'
    }).code(401);
  }
}

async function userLogoutHandler(request, h) {
  const sessionToken = request.headers['authorization'];

  if (!sessionToken) {
    return h.response({ error: 'No session token provided' }).code(400);
  }

  // Delete session from Firestore
  await sessionDelete(sessionToken);

  return h.response({ message: 'Logged out successfully' });

}

async function getProfileHandler(request, h) {

  const { email } = request.params;

  const userDoc = await getUserProfile(email);

  const data = {
    "name": userDoc.data().name,
    "email": userDoc.data().email,
    "phone": userDoc.data().phone
  }

  if (!userDoc.exists) {
    return h.response({
      status: 'fail',
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

  const userDoc = await getUserProfile(email);

  if (!userDoc.exists) {
    return h.response({
      status: 'fail',
      message: 'User not found',
    }).code(404);
  }

  if (password) {
    const hashPassword = await bcrypt.hash(password, 10);
    const verifyPassword = await bcrypt.compare(verify_password, hashPassword);

    if (!verifyPassword) {
      return h.response({
        status: 'fail',
        message: 'Verify password is wrong!',
      }).code(409);
    }

    // Update with hashed password
    await updateUserProfile(email, {
      name,
      email,
      phone,
      password: hashPassword,
    });
  } else {
    // Update without password
    await updateUserProfile(email, {
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
  const { userId, itemId, quantity } = request.payload;

  try {

    const cartDoc = await addCart(userId, itemId, quantity);

    return h.response({
      status: 'success',
      message: 'Item added to cart successfully',
      cartId: cartDoc.id
    }).code(200);
  } catch (error) {
    return h.response({
      status: 'fail',
      message: 'Failed to add item to cart',
    }).code(500);
  }
};


async function getCartHandler(request, h) {
  const { userId } = request.query;

  const dataCart = await getCart(userId);

  return h.response({
    status: 'success',
    data: dataCart
  }).code(200);
}

async function updateCartHandler(request, h) {
  const { userId, batikId, batikSubId, quantity } = request.payload;

  try {
    await updateCart(userId, batikId, batikSubId, quantity);

    return h.response({
      status: 'success',
      message: 'Item updated to cart successfully',
    }).code(200);
  } catch (error) {
    return h.response({
      status: 'fail',
      message: 'Failed to update item quantity',
    }).code(500);
  }
}

async function deleteCartHandler(request, h) {
  const { userId } = request.payload;

  try {

    await deleteCart(userId);

    return h.response({
      status: 'success',
      message: 'Cart successfully deleted'
    }).code(200);
  } catch (error) {
    return h.response({
      status: 'fail',
      message: 'Failed to delete cart',
    }).code(500);
  }
};

async function getOrderHandler(request, h) {

  const { userId } = request.query;

  const data = await getOrder(userId);

  return h.response({
    status: 'success',
    data: data,
  }).code(200);

}

async function addOrderHandler(request, h) {
  const { userId } = request.payload;

  await addOrder(userId);

  return h.response({
    status: 'success',
    message: 'Order added successfully',
  }).code(200);
}

async function updateOrderHandler(request, h) {
  const { userId, orderId, status } = request.payload;

  const result = await updateOrder(userId, orderId, status);

  return h.response({
    status: 'success',
    message: 'Order updated successfully',
  }).code(200);
}

async function batikPredictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;

  const { label, confidence } = await scanBatik(model, image);

  /*
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const data = {
    "id": id,
    "result": label,
    "suggestion": suggestion,
    "createdAt": createdAt
  }

  await storeData(id, data); 
  */
  const response = h.response({
    status: 'success',
    message: 'Model is predicted successfully',
    data: {
      label,
      confidence
    }
  })

  response.code(201);
  return response;
}

async function batikScanHandler(request, h) {
  return;
}

module.exports = { getBatikHandler, getBatikByIdHandler, getBatikCategories, searchByKeywordHandler, searchByOriginHandler, userRegisterHandler, userLoginHandler, userLogoutHandler, getProfileHandler, editProfileHandler, addCartHandler, getCartHandler, updateCartHandler, deleteCartHandler, getOrderHandler, addOrderHandler, updateOrderHandler, batikPredictHandler, batikScanHandler };
