/**
 * Vercel serverless entry (see vercel.json → routes → /index.js).
 * Require express here so @vercel/node bundles the Express runtime correctly.
 * Local dev: npm run dev → nodemon server/index.js
 */
require('express');
module.exports = require('./server/index.js');
