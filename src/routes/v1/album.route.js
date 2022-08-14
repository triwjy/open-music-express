const express = require('express');
// const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const albumValidation = require('../../validations/album.validation');
const albumController = require('../../controllers/album.controller');
const auth = require('../../middlewares/auth');
const { uploadAlbumCoverMw } = require('../../middlewares/multer');

const router = express.Router();

router
  .route('/')
  .post(auth('manageAlbums'), validate(albumValidation.createAlbum), albumController.createAlbum)
  .get(validate(albumValidation.getAlbum), albumController.getAlbums);

router
  .route('/:albumId')
  .get(validate(albumValidation.getAlbum), albumController.getAlbum)
  .patch(auth('manageAlbums'), validate(albumValidation.updateAlbum), albumController.updateAlbum)
  .delete(auth('manageAlbums'), validate(albumValidation.deleteAlbum), albumController.deleteAlbum);

router
  .route('/likes/:albumId')
  .post(auth(), validate(albumValidation.toggleAlbumLikes), albumController.toggleAlbumLikes)
  .get(validate(albumValidation.getAlbumLikes), albumController.getAlbumLikes);

router
  .route('/albumCover/:albumId')
  .post(
    auth('manageAlbums'),
    validate(albumValidation.uploadAlbumCover),
    uploadAlbumCoverMw,
    albumController.uploadAlbumCover
  )
  .get(validate(albumValidation.getAlbumCover), albumController.getAlbumCover);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Albums
 *   description: Album resource
 */

/**
 * @swagger
 * /albums:
 *   post:
 *     summary: Create an album
 *     description: Only signed in user can create album.
 *     tags: [Albums]
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
 *               - year
 *             properties:
 *               name:
 *                 type: string
 *               year:
 *                 type: number
 *             example:
 *               name: Top Songs 2000
 *               year: 2000
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Album'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all albums
 *     description: All users can retrieve all albums.
 *     tags: [Albums]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Album name
 *       - in: query
 *         name: year
 *         schema:
 *           type: number
 *         description: Album release year
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
 *         description: Maximum number of albums
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
 *                     $ref: '#/components/schemas/Album'
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
 */

/**
 * @swagger
 * /albums/{id}:
 *   get:
 *     summary: Get an album
 *     description: Album informations.
 *     tags: [Albums]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Album id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Album'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update an album
 *     description: Logged in users can only update their own album.
 *     tags: [Albums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Album id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               year:
 *                 type: number
 *             example:
 *               name: Pop 2000
 *               year: 2000
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Album'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete an album
 *     description: User can delete their own album.
 *     tags: [Albums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Album id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
