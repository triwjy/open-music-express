const { createClient } = require('redis');
const config = require('../../config/config');
const logger = require('../../config/logger');

const redisClient = createClient({ url: config.redis.url });

redisClient.on('connect', () => {
  logger.info('Connected to redis server!');
});

redisClient.on('error', (err) => {
  logger.error('Redis client error', err);
});

redisClient.on('end', () => {
  logger.info('Redis client disconnected from redis server');
});

redisClient.on('SIGINt', () => {
  redisClient.quit();
});

module.exports = redisClient;
