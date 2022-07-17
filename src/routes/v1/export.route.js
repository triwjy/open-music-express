const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const exportValidation = require('../../validations/export.validation');
const exportController = require('../../controllers/export.controller');

const router = express.Router();

router
  .route('/playlists/:playlistId')
  .post(auth(), validate(exportValidation.exportPlaylist), exportController.exportPlaylist);

module.exports = router;
