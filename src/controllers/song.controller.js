const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { songService } = require('../services');

const createSong = catchAsync(async (req, res) => {
  const song = await songService.createSong(req.body);
  res.status(httpStatus.CREATED).send(song);
});

const getSongs = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['title', 'year', 'genre', 'performer']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await songService.querySongs(filter, options);
  res.send(result);
});

const getSong = catchAsync(async (req, res) => {
  const song = await songService.getSongById(req.params.songId);
  if (!song) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Song not found');
  }
  res.send(song);
});

const updateSong = catchAsync(async (req, res) => {
  const song = await songService.updateSongById(req.params.songId, req.body);
  res.send(song);
});

const deleteSong = catchAsync(async (req, res) => {
  await songService.deleteSongById(req.params.songId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSong,
  getSongs,
  getSong,
  updateSong,
  deleteSong,
};
