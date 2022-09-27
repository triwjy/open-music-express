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

router.route('/:playlistId').delete(auth(), validate(playlistValidation.deletePlaylist), playlistController.deletePlaylist);

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

/**
 * @swagger
 * tags:
 *   name: Playlists
 *   description: Playlist resource
 */

/**
 * @swagger
 * /playlists:
 *   post:
 *     summary: Create a playlist
 *     description: Only logged in user can create playlist. User who created the playlist is the 'owner' of the playlist
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *             example:
 *               name: Playlist 1
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Playlist'
 *             examples:
 *               success:
 *                 $ref: '#/components/examples/NewPlaylist'
 *       "400":
 *         $ref: '#/components/responses/InvalidRequestEmptyName'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *
 *   get:
 *     summary: Get all playlists of logged in user
 *     description: Get all playlists owned/accessible by owner/collaborator.
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Playlist name
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of playlists returned
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Playlist'
 *                   example:
 *                     - $ref: '#/components/examples/PopulatedPlaylist'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /playlists/{id}:
 *   delete:
 *     summary: Delete a playlist
 *     description: Only playlist owner can delete a playlist (Collaborators are not authorized to do so).
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PlaylistIdParam'
 *     responses:
 *       "204":
 *         description: Playlist was deleted successfully
 *       "400":
 *         $ref: '#/components/responses/InvalidRequestId'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /playlists/{id}/songs:
 *   post:
 *     summary: Add song to playlist
 *     description: Only playlist owner and collaborator can add songs to playlist.
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PlaylistIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/requestBodies/SongId'
 *     responses:
 *       "200":
 *         description: Song added to playlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Playlist'
 *             examples:
 *               success:
 *                 $ref: '#/components/examples/PopulatedPlaylist2'
 *       "400":
 *         $ref: '#/components/responses/InvalidRequestEmptyName'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   get:
 *     summary: Get songs from a playlist
 *     description: Only owner and collaborators can get songs of a playlist.
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PlaylistIdParam'
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 songs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Song'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete song from playlist
 *     description: Only playlist owner and collaborators can delete song from playlist.
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PlaylistIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/requestBodies/SongId'
 *     responses:
 *       "200":
 *         description: Song successfully deleted from playlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Playlist'
 *             examples:
 *               success:
 *                 $ref: '#/components/examples/PopulatedPlaylistDeleteSong'
 *       "400":
 *         $ref: '#/components/responses/InvalidRequestId'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /playlists/{id}/collaborations:
 *   post:
 *     summary: Add collaborator to playlist
 *     description: Only playlist owner can add collaborators to playlist.
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PlaylistIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/requestBodies/CollaboratorId'
 *     responses:
 *       "200":
 *         description: Collaborator added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Playlist'
 *             examples:
 *               success:
 *                 $ref: '#/components/examples/PopulatedPlaylistAddCollaborator'
 *       "400":
 *         $ref: '#/components/responses/InvalidRequestId'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   delete:
 *     summary: Remove collaborator from playlist
 *     description: Only playlist owner can remove collaborators from playlist.
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PlaylistIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/requestBodies/CollaboratorId'
 *     responses:
 *       "200":
 *         description: Successfully remove collaborator
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Playlist'
 *             examples:
 *               success:
 *                 $ref: '#/components/examples/PopulatedPlaylist2'
 *       "400":
 *         $ref: '#/components/responses/InvalidRequestId'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /playlists/{id}/activities:
 *   get:
 *     summary: Get activities log on a playlist
 *     description: Only playlist owner (creator) can view other collaborators' activities on a playlist.
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PlaylistIdParam'
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: ['add', 'delete']
 *         default: 'add'
 *         description: Action type on playlist
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of activities to be returned
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PlaylistActivity'
 *                   example:
 *                     - $ref: '#/components/examples/PlaylistActivity1'
 *                     - $ref: '#/components/examples/PlaylistActivity2'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
