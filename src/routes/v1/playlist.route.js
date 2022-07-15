const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const playlistValidation = require('../../validations/playlist.validation');
const playlistController = require('../../controllers/playlist.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(playlistValidation.createPlaylist), playlistController.createPlaylist)
  .get(auth(), validate(playlistValidation.getPlaylists), playlistController.getPlaylist);

router.route('/:playlistId').delete(auth(), playlistController.deletePlaylist);

router
  .route('/:playlistId/songs')
  .post(auth(), validate(playlistValidation.addSongToPlaylist), playlistController.addSongToPlaylist)
  .get(auth(), validate(playlistValidation.getSongsFromPlaylist), playlistController.getSongsFromPlaylist)
  .delete(auth(), validate(playlistValidation.deleteSongFromPlaylist), playlistController.deleteSongFromPlaylist);

router
  .route('/:playlistId/collaborations')
  .post(auth(), validate(playlistValidation.addCollaboratorToPlaylist), playlistController.addCollaboratorToPlaylist)
  .delete(
    auth(),
    validate(playlistValidation.removeCollaboratorFromPlaylist),
    playlistController.removeCollaboratorFromPlaylist
  );

router
  .route('/:playlistId/activities')
  .get(auth(), validate(playlistValidation.queryPlaylistActivities), playlistController.getPlaylistActivities);

module.exports = router;
