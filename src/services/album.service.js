const httpStatus = require('http-status');
const { Album } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create an album
 * @param {Object} albumBody
 * @returns {Promise<Album>}
 */
const createAlbum = async (albumBody) => {
  return Album.create(albumBody);
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
 * @param {AlbumId} id
 * @returns {Promise<Album>}
 */
const getAlbumById = async (id) => {
  return Album.findById(id);
};

/**
 * Get album by year
 * @param {string} year
 * @returns {Promise<Album>}
 */
const getAlbumByYear = async (year) => {
  return Album.findAll({ year });
};

/**
 * Update album by id
 * @param {ObjectId} albumId
 * @param {Object} updateBody
 * @returns {Promise<Album>}
 */
const updateAlbumById = async (albumId, updateBody) => {
  const album = await getAlbumById(albumId);
  if (!album) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Album not found');
  }
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
  const album = await getAlbumById(albumId);
  if (!album) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Album not found');
  }
  await album.remove();
  return album;
};

module.exports = {
  createAlbum,
  queryAlbums,
  getAlbumById,
  getAlbumByYear,
  updateAlbumById,
  deleteAlbumById,
};
