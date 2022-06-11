const express = require('express');
const validate = require('../../middlewares/validate');
const songValidation = require('../../validations/song.validation');
const songController = require('../../controllers/song.controller');

const router = express.Router();

router
  .route('/')
  .post(validate(songValidation.createSong), songController.createSong)
  .get(validate(songValidation.getSongs), songController.getSongs);

router
  .route('/:songId')
  .get(validate(songValidation.getSong), songController.getSong)
  .patch(validate(songValidation.updateSong), songController.updateSong)
  .delete(validate(songValidation.deleteSong), songController.deleteSong);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Songs
 *   description: Song resource
 */

/**
 * @swagger
 * /songs:
 *   post:
 *     summary: Create a song
 *     description: Only signed in user can create a song.
 *     tags: [Songs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - year
 *               - genre
 *               - performer
 *             properties:
 *               title:
 *                 type: string
 *               year:
 *                 type: number
 *               genre:
 *                 type: string
 *               performer:
 *                  type: string
 *               duration:
 *                  type: number
 *               albumId:
 *                  type: string
 *             example:
 *               title: Life in Technicolor
 *               year: 2008
 *               performer: Coldplay
 *               genre: Indie
 *               duration: 120
 *               albumId: 628f36a883e55f43c2f5dc83
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Song'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all songs
 *     description: All users can retrieve all songs.
 *     tags: [Songs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Song title
 *       - in: query
 *         name: year
 *         schema:
 *           type: number
 *         description: Song release year
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Song genre
 *       - in: query
 *         name: performer
 *         schema:
 *           type: string
 *         description: Song performer
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. year:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of songs
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
 *                     $ref: '#/components/schemas/Song'
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
 * /songs/{id}:
 *   get:
 *     summary: Get a song
 *     description: Song information.
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Song id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Song'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a song
 *     description: Update song resource.
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Song id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               year:
 *                 type: number
 *               genre:
 *                 type: string
 *               performer:
 *                 type: string
 *               duration:
 *                 type: number
 *               albumId:
 *                 type: string
 *             example:
 *               title: fake title
 *               year: 2020
 *               genre: pop
 *               performer: fake artist
 *               duration: 300
 *               albumId: 628f36a883e55f43c2f5dc83
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Song'
 *       "400":
 *         $ref: '#/components/responses/EmptyTitle'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a user
 *     description: Logged in users can delete only themselves. Only admins can delete other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
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
