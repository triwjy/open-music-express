const Joi = require('joi');

const exportPlaylist = {
  body: Joi.object().keys({
    targetEmail: Joi.string().required().email(),
  }),
};

module.exports = {
  exportPlaylist,
};
