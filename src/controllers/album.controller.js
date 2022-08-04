const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { albumService } = require('../services');

const createAlbum = catchAsync(async (req, res) => {
  const album = await albumService.createAlbum(req.body);
  res.status(httpStatus.CREATED).send(album);
});

const getAlbums = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'year']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await albumService.queryAlbums(filter, options);
  res.send(result);
});

const getAlbum = catchAsync(async (req, res) => {
  const album = await albumService.getAlbumById(req.params.albumId);
  if (!album) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Album not found');
  }
  res.send(album);
});

const updateAlbum = catchAsync(async (req, res) => {
  const album = await albumService.updateAlbumById(req.params.albumId, req.body);
  res.send(album);
});

const deleteAlbum = catchAsync(async (req, res) => {
  await albumService.deleteAlbumById(req.params.albumId);
  res.status(httpStatus.NO_CONTENT).send();
});

const uploadAlbumCover = catchAsync(async (req, res) => {
  const { albumId } = req.params;
  let fileUrl;

  if (req.file === undefined) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No file selected');
  } else {
    fileUrl = `${process.env.BASE_URL}/albumCover/${req.file.filename}`;
    await albumService.uploadAlbumCover(albumId, fileUrl);
  }
  res.status(httpStatus.CREATED).send({ fileUrl });
});

const getAlbumCover = catchAsync(async (req, res) => {
  const { albumId } = req.params;
  const result = await albumService.getAlbumCover(albumId);

  res.status(httpStatus.OK).send({ result });
});

const toggleAlbumLikes = catchAsync(async (req, res) => {
  const { albumId } = req.params;
  const userId = req.user._id;
  const message = await albumService.toggleAlbumLikes(albumId, userId);
  res.status(httpStatus.CREATED).send({ message });
});

const getAlbumLikes = catchAsync(async (req, res) => {
  const totalLikes = await albumService.getAlbumLikes();
  res.send({ totalLikes });
});

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
