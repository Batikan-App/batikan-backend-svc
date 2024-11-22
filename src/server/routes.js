const { getBatikHandler, getBatikByIdHandler, searchByKeywordHandler, searchByOriginHandler, userRegisterHandler, userLoginHandler, userLogoutHandler, getProfileHandler, editProfileHandler, getCartHandler, addCartHandler, updateCartHandler, deleteCartHandler, getOrderHandler, addOrderHandler, updateOrderHandler, batikPredictHandler } = require('../server/handler');

const routes = [
  {
    path: '/api/batik',
    method: 'GET',
    handler: getBatikHandler
  },

  {
    path: '/api/batik/{batikId}',
    method: 'GET',
    handler: getBatikByIdHandler
  },

  {
    path: '/api/batik/search',
    method: 'GET',
    handler: searchByKeywordHandler
  },

  {
    path: '/api/batik/origin',
    method: 'GET',
    handler: searchByOriginHandler
  },

  {
    path: '/api/auth/register',
    method: 'POST',
    handler: userRegisterHandler,
    options: {
      payload: {
        allow: 'application/json',
        parse: true
      }
    }
  },

  {
    path: '/api/auth/login',
    method: 'POST',
    handler: userLoginHandler,
    options: {
      payload: {
        allow: 'application/json',
        parse: true
      }
    }
  },

  {
    path: '/api/auth/logout',
    method: 'POST',
    handler: userLogoutHandler,
    options: {
      payload: {
        allow: 'application/json',
        parse: true
      }
    }
  },


  {
    path: '/api/user/profile/{email}',
    method: 'GET',
    handler: getProfileHandler,
  },

  {
    path: '/api/user/profile',
    method: 'PUT',
    handler: editProfileHandler,
    options: {
      payload: {
        allow: 'application/json',
        parse: true
      }
    }

  },

  {
    path: '/api/user/cart',
    method: 'GET',
    handler: getCartHandler
  },

  {
    path: '/api/user/cart',
    method: 'POST',
    handler: addCartHandler,
    options: {
      payload: {
        allow: 'application/json',
        parse: true
      }
    }
  },

  {
    path: '/api/user/cart',
    method: 'PATCH',
    handler: updateCartHandler,
    options: {
      payload: {
        allow: 'application/json',
        parse: true
      }
    }

  },

  {
    path: '/api/user/cart',
    method: 'DELETE',
    handler: deleteCartHandler
  },

  {
    path: '/api/user/order',
    method: 'GET',
    handler: getOrderHandler
  },

  {
    path: '/api/user/order',
    method: 'POST',
    handler: addOrderHandler,
    options: {
      payload: {
        allow: 'application/json',
        parse: true
      }
    }
  },

  {
    path: '/api/user/order',
    method: 'PUT',
    handler: updateOrderHandler,
    options: {
      payload: {
        allow: 'application/json',
        parse: true
      }
    }

  },

  {
    path: '/api/batik/scan',
    method: 'POST',
    handler: batikPredictHandler,
    options: {
      payload: {
        maxBytes: 1000000,
        allow: 'multipart/form-data',
        multipart: true
      }
    }
  }

]

module.exports = routes;
