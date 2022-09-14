const httpStatus = require('http-status');
const { Album, Song } = require('../models');
const ApiError = require('../utils/ApiError');
const { checkUserExistence } = require('./user.service');

/**
 * Create an album
 * @param {Object} albumBody
 * @returns {Promise<Album>}
 */
const createAlbum = async (albumBody) => {
  return Album.create(albumBody);
};

/**
 * Get album if exist, throw error if not exist
 * @param {ObjectId} albumId
 * @returns {Promise<Album>}
 */
const checkAlbumExistence = async (albumId) => {
  const album = await Album.findById(albumId);
  if (!album) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Album not found');
  }
  return album;
};

/**
 * Query for albums
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryAlbums = async (filter, options) => {
  const albums = await Album.paginate(filter, options);
  return albums;
};

/**
 * Get album by id
 * @param {ObjectId} albumId
 * @returns {Promise<Album>}
 */
const getAlbumById = async (albumId) => {
  return Album.findById(albumId).populate('songs');
};

/**
 * Update album by id
 * @param {ObjectId} albumId
 * @param {Object} updateBody
 * @returns {Promise<Album>}
 */
const updateAlbumById = async (albumId, updateBody) => {
  const album = await checkAlbumExistence(albumId);

  Object.assign(album, updateBody);
  await album.save();
  return album;
};

/**
 * Delete album by id
 * @param {ObjectId} albumId
 * @returns {Promise<Album>}
 */
const deleteAlbumById = async (albumId) => {
  const album = await checkAlbumExistence(albumId);

  // delete albumId field from associated song
  await Song.updateMany({ albumId }, { albumId: null });

  await album.remove();
  return album;
};

/**
 * Upload album cover image to an album
 * @param {ObjectId} albumId
 * @param {string} fileUrl
 * @returns {Promise<Album>}
 */
const uploadAlbumCover = async (albumId, fileUrl) => {
  const album = await checkAlbumExistence(albumId);

  album.coverUrl = fileUrl;
  await album.save();
  return album;
};

const getAlbumCover = async (albumId) => {
  const album = await checkAlbumExistence(albumId);

  const result = {
    id: album._id,
    name: album.name,
    fileUrl: album.coverUrl || 'not uploaded',
  };
  return result;
};

/**
 * Like or unlike an album
 * @param {ObjectId} albumId
 * @param {ObjectId} userId
 * @returns {Promise<string>}
 */
const toggleAlbumLikes = async (albumId, userId) => {
  const album = await checkAlbumExistence(albumId);
  const user = await checkUserExistence(userId);
  let message;
  if (user.hasLikedAlbums(albumId)) {
    await album.reduceLikes();
    message = 'Removed from favorite albums';
  } else {
    await album.addLikes();
    message = 'Added to favorite albums';
  }
  await user.toggleLikes(albumId);
  return message;
};

const getAlbumLikes = async (albumId) => {
  const album = await checkAlbumExistence(albumId);
  return album.totalLikes;
};

module.exports = {
  createAlbum,
  queryAlbums,
  getAlbumById,
  updateAlbumById,
  deleteAlbumById,
  uploadAlbumCover,
  getAlbumCover,
  toggleAlbumLikes,
  getAlbumLikes,
};
