const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { isPlaylistCollaborator } = require('../services/playlist.service');
const { amqpProducerService } = require('../services');

const exportPlaylist = catchAsync(async (req, res) => {
  const { targetEmail } = req.body;
  const { playlistId } = req.params;
  const collaboratorId = req.user._id;

  const validCollaborator = await isPlaylistCollaborator(playlistId, collaboratorId);
  if (!validCollaborator) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to export playlist');
  }

  const message = {
    userId: collaboratorId,
    targetEmail,
  };

  await amqpProducerService.sendMessage('export:playlists', JSON.stringify(message));

  res.send({ message: `Export playlist request is in queue` });
});

module.exports = {
  exportPlaylist,
};
