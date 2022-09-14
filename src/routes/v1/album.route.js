const express = require('express');
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
  );

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
 *     description: Only admin can create album.
 *     tags: [Albums]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/requestBodies/Album'
 *     responses:
 *       "201":
 *         description: Album successfully created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Album'
 *       "400":
 *         $ref: '#/components/responses/InvalidRequest'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   get:
 *     summary: Get all albums
 *     description: Get all albums, and filter/sort them using query
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
 *     summary: Get a single album
 *     description: Album informations.
 *     tags: [Albums]
 *     parameters:
 *       - $ref: '#/components/parameters/AlbumIdParam'
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/responses/AlbumDetail'
 *       "400":
 *         $ref: '#/components/responses/InvalidRequest'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update an album
 *     description: Only admin can edit an album.
 *     tags: [Albums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AlbumIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/requestBodies/AlbumPatch'
 *     responses:
 *       "200":
 *         description: Patch successful
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Album'
 *       "400":
 *         $ref: '#/components/responses/InvalidRequest'
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
 *       - $ref: '#/components/parameters/AlbumIdParam'
 *     responses:
 *       "204":
 *         description: Album deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                example:
 *                  message: delete successful
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /albums/likes/{id}:
 *   post:
 *     summary: Toggle between like/unlike an album
 *     description: Logged in user can toggle between like or unlike an album
 *     tags: [Albums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AlbumIdParam'
 *     requestBody:
 *       content:
 *         application/json: {}
 *     responses:
 *       "200":
 *         description: Successfully toggle like/unlike
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *             examples:
 *               like:
 *                 summary: Like album
 *                 value:
 *                   message: Added to favorite albums
 *               unlike:
 *                 summary: Unlike album
 *                 value:
 *                   message: Removed from favorite albums
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *   get:
 *     summary: Number of likes of an album
 *     description: All users can get the number of likes of an album
 *     tags: [Albums]
 *     parameters:
 *       - $ref: '#/components/parameters/AlbumIdParam'
 *     requestBody:
 *       content:
 *         application/json: {}
 *     responses:
 *       "200":
 *         description: Get total album likes
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  totalLikes:
 *                    type: number
 *                example:
 *                  totalLikes: 10
 */

/**
 * @swagger
 * /albums/albumCover/{id}:
 *   post:
 *     summary: Upload album cover
 *     description: Only admin can upload album cover
 *     tags: [Albums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AlbumIdParam'
 *     requestBody:
 *       content:
 *         'image/bmp':
 *           schema:
 *             $ref: '#/components/schemas/OctetStream'
 *         'image/gif':
 *           schema:
 *             $ref: '#/components/schemas/OctetStream'
 *         'image/jpeg':
 *           schema:
 *             $ref: '#/components/schemas/OctetStream'
 *         'image/jpg':
 *           schema:
 *             $ref: '#/components/schemas/OctetStream'
 *         'image/png':
 *           schema:
 *             $ref: '#/components/schemas/OctetStream'
 *         'image/webp':
 *           schema:
 *             $ref: '#/components/schemas/OctetStream'
 *     responses:
 *       "200":
 *         description: Album cover successfully uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fileUrl:
 *                   description: url of the uploaded cover
 *                   type: string
 *               example:
 *                 fileUrl: "http://localhost:5000/albumCover/albumCover-1663137410859-458706617.jpeg"
 *       "400":
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 400
 *               message: "Invalid file type"
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 */
