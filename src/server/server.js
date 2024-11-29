require('dotenv').config();

const Hapi = require('@hapi/hapi');
const routes = require('../server/routes');
const { sessionCheck, sessionDelete } = require('../services/authUsers');
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/InputError');

(async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  const model = await loadModel();
  server.app.model = model;

  server.route(routes);

  server.ext('onPreResponse', function (request, h) {

    const response = request.response;

    if (response instanceof InputError) {
      const newResponse = h.response({
        status: 'failed',
        message: response.message
      })
      newResponse.code(response.statusCode)
      return newResponse;
    }

    if (response.isBoom) {
      const newResponse = h.response({
        status: 'failed',
        message: 'Invalid request data'
      })
      newResponse.code(response.output.statusCode)
      return newResponse;
    }

    return h.continue;
  });

  server.ext('onPreHandler', async function (request, h) {
    const sessionToken = request.headers['authorization'];
    const { path } = request;

    // Bypass session validation for specific routes
    const publicRoutes = ['/api/auth/login', '/api/auth/register'];
    if (publicRoutes.includes(path)) {
      return h.continue; // Skip middleware for these routes
    }

    if (!sessionToken) {
      return h.response({
        status: 'failed',
        message: 'Unauthorized' 
      }).code(401).takeover();
    }

    // Check session in Firestore
    const sessionDoc = await sessionCheck(sessionToken);
    if (!sessionDoc.exists) {
      return h.response({
        status: 'failed',
        message: 'Invalid session'
      }).code(401).takeover();
    }

    const session = sessionDoc.data();

    // Optionally check expiration
    if (session.expires_at.toDate() < new Date()) {
      await sessionDelete(sessionToken); // Clean up expired session
      return h.response({
        status: 'failed',
        message: 'Session expired'
      }).code(401).takeover();
    }

    // Attach user info to request
    request.user = session.email;

    return h.continue;
  });

  await server.start();
  console.log(`Server start at: ${server.info.uri}`);
})();
