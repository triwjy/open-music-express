const httpStatus = require('http-status');
const { Song, Album } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a song
 * @param {Object} songBody
 * @returns {Promise<Song>}
 */
const createSong = async (songBody) => {
  const song = new Song(songBody);

  if (song.albumId) {
    const album = await Album.findById(song.albumId);
    if (!album) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Album not found');
    }
    album.songs.push(song);
    await album.save();
  }
  await song.save();
  return song;
};

/**
 * Query for songs
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const querySongs = async (filter, options) => {
  const songs = await Song.paginate(filter, options);
  return songs;
};

/**
 * Get song by id
 * @param {ObjectId} id
 * @returns {Promise<Song>}
 */
const getSongById = async (id) => {
  return Song.findById(id);
};

/**
 * Update song by id
 * @param {ObjectId} songId
 * @param {Object} updateBody
 * @returns {Promise<Song>}
 */
const updateSongById = async (songId, updateBody) => {
  const song = await getSongById(songId);
  if (!song) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Song not found');
  }

  // update case: new album ID is added to song
  if (updateBody.albumId) {
    const album = await Album.findById(updateBody.albumId);
    if (!album) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Album not found');
    }
    album.songs.push(song);
    await album.save();
  }

  Object.assign(song, updateBody);
  await song.save();
  return song;
};

/**
 * Delete song by id
 * @param {ObjectId} songId
 * @returns {Promise<Song>}
 */
const deleteSongById = async (songId) => {
  const song = await getSongById(songId);
  if (!song) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Song not found');
  }
  await Album.updateOne({ _id: song.albumId }, { $pull: { songs: song._id } });

  await song.remove();
  return song;
};

module.exports = {
  createSong,
  querySongs,
  getSongById,
  updateSongById,
  deleteSongById,
};
