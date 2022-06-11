const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createSong = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    year: Joi.number().required(),
    genre: Joi.string().required(),
    performer: Joi.string().required(),
    duration: Joi.number(),
    albumId: Joi.string(),
  }),
};

const getSongs = {
  query: Joi.object().keys({
    title: Joi.string(),
    year: Joi.number().integer(),
    genre: Joi.string(),
    performer: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getSong = {
  params: Joi.object().keys({
    songId: Joi.string().custom(objectId),
  }),
};

const updateSong = {
  params: Joi.object().keys({
    songId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    title: Joi.string(),
    year: Joi.number(),
    genre: Joi.string(),
    performer: Joi.string(),
    duration: Joi.number(),
    albumId: Joi.string(),
  }),
};

const deleteSong = {
  params: Joi.object().keys({
    songId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createSong,
  getSongs,
  getSong,
  updateSong,
  deleteSong,
};
