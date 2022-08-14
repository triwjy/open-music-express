const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { insertPlaylists, playlistOne } = require('../fixtures/playlist.fixture');
const { userOneAccessToken, userTwoAccessToken } = require('../fixtures/token.fixture');
const { insertUsers, userOne } = require('../fixtures/user.fixture');
const setupTestDB = require('../utils/setupTestDB');

setupTestDB();

describe('Export playlist route', () => {
  describe('POST /v1/exports/playlists/:playlistId', () => {
    beforeEach(async () => {
      await insertPlaylists([playlistOne]);
      await insertUsers([userOne]);
    });
    test('should be able to export playlist', async () => {
      await request(app)
        .post(`/v1/exports/playlists/${playlistOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(200);
    });

    test('should return 401 if invalid user token is sent', async () => {
      await request(app)
        .post(`/v1/exports/playlists/${playlistOne._id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(401);
    });

    test('should return 404 if user trying to export non-exist playlist', async () => {
      await request(app)
        .post(`/v1/exports/playlists/${mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(404);
    });
  });
});
