const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createAlbum = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    year: Joi.number().required(),
    songs: Joi.array().items(Joi.string().custom(objectId)),
    coverUrl: Joi.string(),
    totalLikes: Joi.number(),
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
      songs: Joi.array().items(Joi.string().custom(objectId)),
      totalLikes: Joi.number(),
      coverUrl: Joi.string(),
    })
    .min(1),
};

const deleteAlbum = {
  params: Joi.object().keys({
    albumId: Joi.string().custom(objectId),
  }),
};

const uploadAlbumCover = {
  params: Joi.object().keys({
    albumId: Joi.string().custom(objectId),
  }),
};

const getAlbumCover = {
  params: Joi.object().keys({
    albumId: Joi.string().custom(objectId),
  }),
};

const toggleAlbumLikes = {
  params: Joi.object().keys({
    albumId: Joi.string().custom(objectId),
  }),
};

const getAlbumLikes = {
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
  uploadAlbumCover,
  getAlbumCover,
  toggleAlbumLikes,
  getAlbumLikes,
};
