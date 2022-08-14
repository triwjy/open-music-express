const Joi = require('joi');
const { objectId } = require('./custom.validation');

const exportPlaylist = {
  params: Joi.object().keys({
    playlistId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  exportPlaylist,
};
