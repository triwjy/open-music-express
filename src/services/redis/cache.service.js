const redisClient = require('./redis.init');

async function set(key, value, expirationInSecond = 1800) {
  await redisClient.set(key, value, { EX: expirationInSecond });
}

async function get(key) {
  const result = await redisClient.get(key);
  return result;
}

async function del(key) {
  await redisClient.del(key);
}

module.exports = { set, get, del };
