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

/**
 * @swagger
 * tags:
 *   name: Exports
 *   description: Export resource path
 */

/**
 * @swagger
 * /exports/playlists/{id}:
 *   post:
 *     summary: Export collaborator/owner's playlist to email.
 *     description: Only playlist collaborator/owner the playlist. This service is depends on open-music-express-consumer service.
 *     tags: [Exports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ExportIdParam'
 *     responses:
 *       "200":
 *         description: Playlist exported
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Export'
 *             examples:
 *               success:
 *                 $ref: '#/components/examples/PlaylistExported'
 *       "400":
 *         $ref: '#/components/responses/InvalidRequestId'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
