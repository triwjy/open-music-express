const httpStatus = require('http-status');
const { songService } = require('.');
const { Playlist, User, PlaylistActivity } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a playlist
 * @param {String} name
 * @param {ObjectId} ownerId
 * @returns {Promise<Playlist>}
 */
const createPlaylist = async (body, owner) => {
  const playlist = new Playlist({
    name: body.name,
    owner,
    collaborators: [owner],
  });
  await playlist.save();
  return playlist;
};

/**
 * Query for playlists by collaboratorId
 * @param {ObjectId} collaboratorId
 * @returns {Promise<QueryResult>}
 */
const queryPlaylists = async (collaboratorId, filter, options) => {
  const playlists = await Playlist.paginate({ collaborators: collaboratorId, ...filter }, options);
  return playlists;
};

/**
 * Get an authorized playlist of a collaborator
 * @param {ObjectId} playlistId
 * @param {ObjectId} collaboratorId
 * @returns {Promise<Playlist>}
 */
const getAuthorizedPlaylistById = async (playlistId, collaboratorId) => {
  return Playlist.findOne({ _id: playlistId, collaborators: collaboratorId });
};

/**
 * Get an owned playlist of a playlist owner
 * @param {ObjectId} playlistId
 * @param {ObjectId} ownerId
 * @returns {Promise<Playlist>}
 */
const getOwnedPlaylistById = async (playlistId, ownerId) => {
  return Playlist.findOne({ _id: playlistId, owner: ownerId });
};

/**
 * Delete playlist by id
 * @param {ObjectId} playlistId
 * @param {ObjectId} ownerId
 * @returns {Promise<Playlist>}
 */
const deletePlaylist = async (playlistId, ownerId) => {
  const playlist = await getOwnedPlaylistById(playlistId, ownerId);
  if (!playlist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Playlist not found');
  }
  await playlist.remove();
  return playlist;
};

/**
 * Add song to playlist
 * @param {ObjectId} playlistId
 * @param {ObjectId} songId
 * @param {ObjectId} collaboratorId
 * @returns {Promise<Playlist>}
 */
const addSongToPlaylist = async (playlistId, songId, collaboratorId) => {
  const playlist = await getAuthorizedPlaylistById(playlistId, collaboratorId);
  if (!playlist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Playlist not found');
  }

  const song = await songService.getSongById(songId);
  if (!song) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Song not found');
  }

  const activity = new PlaylistActivity({
    playlist,
    collaborator: collaboratorId,
    song: songId,
    action: 'add',
  });
  await activity.save();

  playlist.songs.push(song);
  playlist.activities.push(activity);
  await playlist.save();
  return playlist;
};

/**
 * Get songs from playlist
 * @param {ObjectId} playlistId
 * @param {ObjectId} collaboratorId
 * @returns {Promise<Playlist>}
 */
const getSongsFromPlaylist = async (playlistId, collaboratorId) => {
  const playlist = await getAuthorizedPlaylistById(playlistId, collaboratorId);
  if (!playlist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Playlist not found');
  }
  return playlist;
};

/**
 * Delete a song from playlist
 * @param {ObjectId} playlistId
 * @param {ObjectId} songId
 * @param {ObjectId} collaboratorId
 * @returns {Promise<Playlist>}
 */
const deleteSongFromPlaylist = async (playlistId, songId, collaboratorId) => {
  const playlist = await getAuthorizedPlaylistById(playlistId, collaboratorId);
  if (!playlist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Playlist not found');
  }

  const songInPlaylist = playlist.songs.includes(songId);
  if (!songInPlaylist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Song not found');
  }

  playlist.songs.pull(songId);

  const activity = new PlaylistActivity({
    playlist,
    collaborator: collaboratorId,
    song: songId,
    action: 'delete',
  });
  await activity.save();

  playlist.activities.push(activity);

  await playlist.save();
  return playlist;
};

/**
 * Add a collaborator to a playlist
 * @param {ObjectId} playlistId
 * @param {ObjectId} collaboratorId
 * @returns {Promise<Playlist>}
 */
const addCollaboratorToPlaylist = async (playlistId, collaboratorId) => {
  const playlist = await Playlist.findById(playlistId);

  const collaborator = await User.findById(collaboratorId);
  if (!collaborator) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Collaborator not found');
  }

  playlist.collaborators.push(collaborator);
  await playlist.save();
  return playlist;
};

/**
 * Remove a collaborator from a playlist
 * @param {ObjectId} playlistId
 * @param {ObjectId} collaboratorId
 * @returns {Promise<Playlist>}
 */
const removeCollaboratorFromPlaylist = async (playlistId, collaboratorId) => {
  const playlist = await Playlist.findById(playlistId);

  playlist.collaborators.pull(collaboratorId);
  await playlist.save();
  return playlist;
};

/**
 * Verify the owner (creator) of the playlist
 * @param {ObjectId} playlistId
 * @param {ObjectId} ownerId
 * @returns {Promise<Boolean>}
 */
const isPlaylistOwner = async (playlistId, ownerId) => {
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Playlist not found');
  }
  if (playlist.owner.toString() === ownerId.toString()) {
    return true;
  }
  return false;
};

/**
 * Verify the collaborator of the playlist
 * @param {ObjectId} playlistId
 * @param {ObjectId} collaboratorId
 * @returns {Promise<Boolean>}
 */
const isPlaylistCollaborator = async (playlistId, collaboratorId) => {
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Playlist not found');
  }
  if (playlist.collaborators.includes(collaboratorId)) {
    return true;
  }
  return false;
};

/**
 * Query for activities of the playlist
 * @param {ObjectId} playlistId
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryPlaylistActivities = async (playlistId, filter, options) => {
  const activities = await PlaylistActivity.paginate(filter, options);
  // const activities = await PlaylistActivity.find({ playlist: playlistId }).populate('song');
  return activities;
};

module.exports = {
  createPlaylist,
  queryPlaylists,
  deletePlaylist,
  addSongToPlaylist,
  getSongsFromPlaylist,
  deleteSongFromPlaylist,
  addCollaboratorToPlaylist,
  removeCollaboratorFromPlaylist,
  isPlaylistOwner,
  isPlaylistCollaborator,
  queryPlaylistActivities,
};
