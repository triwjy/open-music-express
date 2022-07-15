const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { playlistService } = require('../services');
const { isPlaylistOwner } = require('../services/playlist.service');

// add a playlist of a user
const createPlaylist = catchAsync(async (req, res) => {
  const ownerId = req.user._id;
  const result = await playlistService.createPlaylist(req.body, ownerId);
  res.status(httpStatus.CREATED).send(result);
});

// show all playlist owned by a user / collaborator
const getPlaylist = catchAsync(async (req, res) => {
  const ownerId = req.user._id;
  const filter = pick(req.query, ['name']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await playlistService.queryPlaylists(ownerId, filter, options);
  res.send(result);
});

// delete a playlist owned by a user
const deletePlaylist = catchAsync(async (req, res) => {
  const { playlistId } = req.params;
  const ownerId = req.user._id;
  const result = await playlistService.deletePlaylist(playlistId, ownerId);
  res.status(httpStatus.NO_CONTENT).send(result);
});

// add a song into a playlist
const addSongToPlaylist = catchAsync(async (req, res) => {
  const { playlistId } = req.params;
  const { songId } = req.body;
  const collaboratorId = req.user._id;
  const result = await playlistService.addSongToPlaylist(playlistId, songId, collaboratorId);
  res.status(httpStatus.CREATED).send(result);
});

// get songs of authorized playlist
const getSongsFromPlaylist = catchAsync(async (req, res) => {
  const { playlistId } = req.params;
  const collaboratorId = req.user._id;
  const result = await playlistService.getSongsFromPlaylist(playlistId, collaboratorId);
  res.send(result);
});

// delete a song from authorized playlist
const deleteSongFromPlaylist = catchAsync(async (req, res) => {
  const { playlistId } = req.params;
  const { songId } = req.body;
  const collaboratorId = req.user._id;
  const result = await playlistService.deleteSongFromPlaylist(playlistId, songId, collaboratorId);
  res.send(result);
});

// playlist owner add collaborator to a playlist
const addCollaboratorToPlaylist = catchAsync(async (req, res) => {
  const { playlistId } = req.params;
  const { collaboratorId } = req.body;
  const ownerId = req.user._id;
  const validOwner = await isPlaylistOwner(playlistId, ownerId);
  if (!validOwner) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to add collaborator from this playlist');
  }
  const result = await playlistService.addCollaboratorToPlaylist(playlistId, collaboratorId);
  res.status(httpStatus.CREATED).send(result);
});

// playlist owner remove collaborator from a playlist
const removeCollaboratorFromPlaylist = catchAsync(async (req, res) => {
  const { playlistId } = req.params;
  const { collaboratorId } = req.body;
  const ownerId = req.user._id;
  const validOwner = await isPlaylistOwner(playlistId, ownerId);
  if (!validOwner) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to remove collaborator from this playlist');
  }
  const result = await playlistService.removeCollaboratorFromPlaylist(playlistId, collaboratorId);
  res.send(result);
});

const getPlaylistActivities = catchAsync(async (req, res) => {
  const { playlistId } = req.params;
  const filter = pick(req.query, ['action']);
  const options = pick(req.query, ['limit', 'page']);
  const ownerId = req.user._id;
  const validOwner = await isPlaylistOwner(playlistId, ownerId);
  if (!validOwner) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to view playlist activity');
  }
  const result = await playlistService.queryPlaylistActivities(playlistId, filter, options);
  res.send(result);
});

module.exports = {
  createPlaylist,
  getPlaylist,
  deletePlaylist,
  addSongToPlaylist,
  getSongsFromPlaylist,
  deleteSongFromPlaylist,
  addCollaboratorToPlaylist,
  removeCollaboratorFromPlaylist,
  getPlaylistActivities,
};
