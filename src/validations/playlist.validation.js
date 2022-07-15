const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createPlaylist = {
  body: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

const getPlaylists = {
  query: Joi.object().keys({
    name: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const deletePlaylist = {
  params: Joi.object().keys({
    playlistId: Joi.string().custom(objectId),
  }),
};

const addSongToPlaylist = {
  params: Joi.object().keys({
    playlistId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    songId: Joi.string().custom(objectId).required(),
  }),
};

const getSongsFromPlaylist = {
  params: Joi.object().keys({
    playlistId: Joi.string().custom(objectId),
  }),
};

const deleteSongFromPlaylist = {
  params: Joi.object().keys({
    playlistId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    songId: Joi.string().custom(objectId).required(),
  }),
};

const addCollaboratorToPlaylist = {
  params: Joi.object().keys({
    playlistId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    collaboratorId: Joi.string().custom(objectId).required(),
  }),
};

const removeCollaboratorFromPlaylist = {
  params: Joi.object().keys({
    playlistId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    collaboratorId: Joi.string().custom(objectId).required(),
  }),
};

const queryPlaylistActivities = {
  params: Joi.object().keys({
    playlistId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    action: Joi.string().valid('add', 'delete'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  createPlaylist,
  getPlaylists,
  deletePlaylist,
  addSongToPlaylist,
  getSongsFromPlaylist,
  deleteSongFromPlaylist,
  addCollaboratorToPlaylist,
  removeCollaboratorFromPlaylist,
  queryPlaylistActivities,
};
