const amqp = require('amqplib');
const config = require('../../config/config');

const amqpProducerService = {
  sendMessage: async (queue, message) => {
    const connection = await amqp.connect(config.rabbitmq.url);
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, {
      durable: true,
    });

    channel.sendToQueue(queue, Buffer.from(message));

    setTimeout(() => {
      connection.close();
    }, 1000);
  },
};

module.exports = amqpProducerService;
