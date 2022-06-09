const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createAlbum = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    year: Joi.number().required(),
  }),
};

const getAlbums = {
  query: Joi.object().keys({
    name: Joi.string(),
    year: Joi.number(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getAlbum = {
  params: Joi.object().keys({
    albumId: Joi.string().custom(objectId),
  }),
};

const updateAlbum = {
  params: Joi.object().keys({
    albumId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      year: Joi.number(),
    })
    .min(1),
};

const deleteAlbum = {
  params: Joi.object().keys({
    albumId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createAlbum,
  getAlbums,
  getAlbum,
  updateAlbum,
  deleteAlbum,
};
