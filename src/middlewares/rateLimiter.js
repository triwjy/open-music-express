const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many request from this IP',
  skipSuccessfulRequests: true,
  handler: (req, res, next, options) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    throw new ApiError(options.statusCode, `${options.message}: ${ip}`);
  },
});

module.exports = {
  authLimiter,
};
