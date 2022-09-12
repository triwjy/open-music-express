const faker = require('faker');
const httpStatus = require('http-status');
const request = require('supertest');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { insertUsers, userOne, userTwo } = require('../fixtures/user.fixture');
const { userOneAccessToken, userTwoAccessToken } = require('../fixtures/token.fixture');
const { Playlist, PlaylistActivity } = require('../../src/models');
const { insertPlaylists, playlistOne, playlistTwo, playlistFour, playlistThree } = require('../fixtures/playlist.fixture');
const { insertSongs, songOne, songTwo, songThree } = require('../fixtures/song.fixture');

setupTestDB();

describe('Playlist routes', () => {
  describe('POST /v1/playlists/', () => {
    let newPlaylistBody;

    beforeEach(async () => {
      await insertUsers([userOne]);
      newPlaylistBody = {
        name: faker.name.findName(),
      };
    });

    test('should return 201 and successfully create new playlist if data is ok', async () => {
      const res = await request(app)
        .post('/v1/playlists')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newPlaylistBody)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        name: newPlaylistBody.name,
        owner: {
          id: expect.anything(),
          email: userOne.email,
          name: userOne.name,
          likedAlbums: [],
          role: userOne.role,
          isEmailVerified: userOne.isEmailVerified,
        },
        collaborators: [expect.anything()],
        songs: [],
        activities: [],
      });

      const dbPlaylist = await Playlist.findById(res.body.id);
      // console.log(dbPlaylist);
      expect(dbPlaylist).toBeDefined();
      expect(dbPlaylist.name).toEqual(newPlaylistBody.name);
      expect(dbPlaylist.owner._id).toEqual(userOne._id);
      expect(dbPlaylist.collaborators[0]._id).toEqual(userOne._id);
      expect(dbPlaylist.collaborators).toHaveLength(1);
      expect(dbPlaylist.songs).toHaveLength(0);
      expect(dbPlaylist.activities).toHaveLength(0);
    });

    test('should return 400 error if bad request body is provided', async () => {
      await request(app)
        .post('/v1/playlists')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/playlists').send(newPlaylistBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 error if owner Id is not registered user Id', async () => {
      await request(app)
        .post('/v1/playlists')
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send(newPlaylistBody)
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/playlists', () => {
    beforeEach(async () => {
      await insertUsers([userOne]);
      await insertPlaylists([playlistOne]);
    });
    test('should return 200 and return all playlists of a user', async () => {
      const res = await request(app)
        .get('/v1/playlists')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0]).toEqual({
        id: playlistOne._id.toHexString(),
        name: playlistOne.name,
        owner: userOne._id.toHexString(),
        collaborators: [userOne._id.toHexString()],
        songs: [],
        activities: [],
      });
    });

    test('should retrun 401 if access token is missing', async () => {
      await request(app).get('/v1/playlists').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should correctly apply filter on name field', async () => {
      const res = await request(app)
        .get('/v1/playlists')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ name: playlistOne.name })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(playlistOne._id.toHexString());
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertPlaylists([playlistTwo]);

      const res = await request(app)
        .get('/v1/playlists')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ sortBy: 'name:desc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);

      const expectedOrder = [playlistOne, playlistTwo].sort((a, b) => {
        return a.name < b.name ? 1 : -1;
      });
      expectedOrder.forEach((playlist, index) => {
        expect(res.body.results[index].id).toBe(playlist._id.toHexString());
      });
    });

    test('should limit the returned array if limit param is specified', async () => {
      await insertPlaylists([playlistTwo, playlistFour]);

      const res = await request(app)
        .get('/v1/playlists')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(playlistOne._id.toHexString());
      expect(res.body.results[1].id).toBe(playlistTwo._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertPlaylists([playlistTwo, playlistFour]);

      const res = await request(app)
        .get('/v1/playlists')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ page: 2, limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(playlistFour._id.toHexString());
    });
  });

  describe('DELETE /v1/playlists/:playlistId', () => {
    beforeEach(async () => {
      await Promise.all([insertUsers([userOne, userTwo]), insertPlaylists([playlistOne])]);
    });
    test('should return 204 if data is ok', async () => {
      await request(app)
        .delete(`/v1/playlists/${playlistOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbPlaylist = await Playlist.findById(playlistOne._id);
      expect(dbPlaylist).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).delete(`/v1/playlists/${playlistOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 error if user trying to delete playlist he doesnt have', async () => {
      await request(app)
        .delete(`/v1/playlists/${playlistOne._id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if playlistId is not a valid mongo id', async () => {
      await request(app)
        .delete(`/v1/playlists/invalidId`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/playlists/:playlistId/songs', () => {
    beforeEach(async () => {
      await Promise.all([insertUsers([userOne]), insertPlaylists([playlistOne])]);
    });
    test('should return 200 and the playlist object with song list if data is ok', async () => {
      await insertSongs([songOne]);

      await request(app)
        .post(`/v1/playlists/${playlistOne._id}/songs`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ songId: songOne._id })
        .expect(httpStatus.CREATED);

      const res = await request(app)
        .get(`/v1/playlists/${playlistOne._id}/songs`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: playlistOne._id.toHexString(),
        songs: [songOne._id.toHexString()],
        collaborators: [userOne._id.toHexString()],
        name: playlistOne.name,
        owner: userOne._id.toHexString(),
        activities: [expect.anything()],
      });
    });

    test('should return 401 error is access token is missing', async () => {
      await request(app).get(`/v1/playlists/${playlistOne._id}/songs`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 error if user trying to get playlist thats not exist in db', async () => {
      await request(app)
        .get(`/v1/playlists/${playlistTwo._id}/songs`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 error is user is trying to get playlist that he doesnt have access to', async () => {
      await insertUsers([userTwo]);

      await request(app)
        .get(`/v1/playlsits/${playlistOne._id}/songs`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if playlistId is not a valid mongo id', async () => {
      await request(app)
        .get(`/v1/playlists/invalidId/songs`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/playlists/:playlistId/songs', () => {
    beforeEach(async () => {
      await Promise.all([insertUsers([userOne]), insertPlaylists([playlistOne]), insertSongs([songOne])]);
    });
    test('should return 201 and successfully add song to playlist and log activities if data is ok', async () => {
      const res = await request(app)
        .post(`/v1/playlists/${playlistOne._id}/songs`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ songId: songOne._id })
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        owner: userOne._id.toHexString(),
        collaborators: [userOne._id.toHexString()],
        songs: [songOne._id.toHexString()],
        name: playlistOne.name,
        activities: expect.anything(),
      });

      const activityDb = await PlaylistActivity.findOne({ playlist: playlistOne._id });
      expect(activityDb.playlist).toEqual(playlistOne._id);
      expect(activityDb.collaborator).toEqual(userOne._id);
      expect(activityDb.song).toEqual(songOne._id);
      expect(activityDb.action).toEqual('add');
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app)
        .post(`/v1/playlists/${playlistOne._id}/songs`)
        .send({ songId: songOne._id })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 error if user trying to insert songs into playlist he doesnt have access to', async () => {
      await insertUsers([userTwo]);

      await request(app)
        .post(`/v1/playlists/${playlistOne._id}/songs`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send({ songId: songOne._id })
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 error if user trying to insert song not exist in db', async () => {
      await request(app)
        .post(`/v1/playlists/${playlistOne._id}/songs`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ songId: songTwo._id })
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if songId is invalid', async () => {
      await request(app)
        .post(`/v1/playlists/${playlistOne._id}/songs`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ songId: 'InvalidId' })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('DELETE /v1/playlists/:playlistId/songs', () => {
    beforeEach(async () => {
      await Promise.all([insertUsers([userOne]), insertPlaylists([playlistOne]), insertSongs([songOne])]);

      // insert songOne to playlistOne
      await request(app)
        .post(`/v1/playlists/${playlistOne._id}/songs`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ songId: songOne._id })
        .expect(httpStatus.CREATED);
    });
    test('should return 200 if data is ok', async () => {
      let dbPlaylist = await Playlist.findById(playlistOne._id);
      expect(dbPlaylist.songs).toHaveLength(1);

      await request(app)
        .delete(`/v1/playlists/${playlistOne._id}/songs`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ songId: songOne._id })
        .expect(httpStatus.OK);

      dbPlaylist = await Playlist.findById(playlistOne._id);
      expect(dbPlaylist.songs).toHaveLength(0);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app)
        .delete(`/v1/playlists/${playlistOne._id}/songs`)
        .send({ songId: songOne._id })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 if user is trying to delete song from a playlist he doesnt have access to', async () => {
      await insertUsers([userTwo]);
      await request(app)
        .delete(`/v1/playlists/${playlistOne._id}/songs`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send({ songId: songOne._id })
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 if user is trying to delete song thats not exist in a playlist', async () => {
      await insertUsers([userTwo]);
      await request(app)
        .delete(`/v1/playlists/${playlistOne._id}/songs`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ songId: songTwo._id })
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error is songId is not a valid mongo id', async () => {
      await request(app)
        .delete(`/v1/playlists/${playlistOne._id}/songs`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ songId: 'invalidId' })
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error is playlistId is not a valid mongo id', async () => {
      await request(app)
        .delete(`/v1/playlists/invalidId/songs`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ songId: songOne._id })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /playlists/:playlistId/collaborations', () => {
    beforeEach(async () => {
      await insertUsers([userOne, userTwo]);
      await insertPlaylists([playlistOne]);
    });

    test('should return 201 and successfully add new collaborator if data is ok', async () => {
      const res = await request(app)
        .post(`/v1/playlists/${playlistOne._id}/collaborations`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ collaboratorId: userTwo._id })
        .expect(httpStatus.CREATED);

      expect(res.body.collaborators).toHaveLength(2);
      expect(res.body.owner).toEqual(userOne._id.toHexString());
      expect(res.body.collaborators[0]).toEqual(userOne._id.toHexString());
      expect(res.body.collaborators[1]).toEqual(userTwo._id.toHexString());
    });

    test('should return 400 error if playlistId is invalid', async () => {
      await request(app)
        .post(`/v1/playlists/invalidId/collaborations`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ collaboratorId: userTwo._id })
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if collaboratorId is invalid', async () => {
      await request(app)
        .post(`/v1/playlists/${playlistOne._id}/collaborations`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ collaboratorId: 'invalidId' })
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app)
        .post(`/v1/playlists/${playlistOne._id}/collaborations`)
        .send({ collaboratorId: userTwo._id })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user trying to add collaborator to a playlist he doesnt have access to', async () => {
      await insertPlaylists([playlistThree]);

      await request(app)
        .post(`/v1/playlists/${playlistThree._id}/collaborations`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ collaboratorId: userTwo._id })
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 404 error if user trying to add collaborator to non-existing playlist', async () => {
      await request(app)
        .post(`/v1/playlists/${playlistThree._id}/collaborations`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ collaboratorId: userTwo._id })
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 error if user trying to add non-existing collaborator to a playlist', async () => {
      await request(app)
        .post(`/v1/playlists/${playlistOne._id}/collaborations`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ collaboratorId: songOne._id })
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /playlists/:playlistId/collaborations', () => {
    beforeEach(async () => {
      await insertUsers([userOne, userTwo]);
      await insertPlaylists([playlistOne]);

      await request(app)
        .post(`/v1/playlists/${playlistOne._id}/collaborations`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ collaboratorId: userTwo._id })
        .expect(httpStatus.CREATED);
    });
    test('should return 200 if data is ok', async () => {
      let playlistDb = await Playlist.findById(playlistOne._id);
      expect(playlistDb.collaborators).toHaveLength(2);

      await request(app)
        .delete(`/v1/playlists/${playlistOne._id}/collaborations`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ collaboratorId: userTwo._id })
        .expect(httpStatus.OK);

      playlistDb = await Playlist.findById(playlistOne._id);
      expect(playlistDb.collaborators).toHaveLength(1);
    });

    test('should return 400 error if playlistId is not a valid mongo id', async () => {
      await request(app)
        .delete(`/v1/playlists/invalidId/collaborations`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ collaboratorId: userTwo._id })
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if collaboratorId is not a valid mongo id', async () => {
      await request(app)
        .delete(`/v1/playlists/${playlistOne._id}/collaborations`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ collaboratorId: 'invalidId' })
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app)
        .delete(`/v1/playlists/${playlistOne._id}/collaborations`)
        .send({ collaboratorId: userTwo._id })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user trying to delete playlist he doesnt have', async () => {
      await insertPlaylists([playlistThree]);

      await request(app)
        .delete(`/v1/playlists/${playlistThree._id}/collaborations`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ collaboratorId: userTwo._id })
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 404 error if playlist is not found', async () => {
      await request(app)
        .delete(`/v1/playlists/${songOne._id}/collaborations`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ collaboratorId: userTwo._id })
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 error if collaborator is not found', async () => {
      await request(app)
        .delete(`/v1/playlists/${playlistOne._id}/collaborations`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ collaboratorId: songOne._id })
        .expect(httpStatus.OK);
    });
  });

  describe('GET /playlists/:playlistId/activities', () => {
    beforeEach(async () => {
      await insertPlaylists([playlistOne]);
      await insertUsers([userOne, userTwo]);
      await insertSongs([songOne, songTwo, songThree]);
    });

    const addSong = async (songId, playlistId) => {
      await request(app)
        .post(`/v1/playlists/${playlistId}/songs`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ songId })
        .expect(httpStatus.CREATED);
    };
    const deleteSong = async (songId, playlistId) => {
      await request(app)
        .delete(`/v1/playlists/${playlistId}/songs`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ songId })
        .expect(httpStatus.OK);
    };

    test('should return 200 and apply the default query options', async () => {
      await addSong(songOne._id, playlistOne._id);
      await addSong(songTwo._id, playlistOne._id);
      await deleteSong(songOne._id, playlistOne._id);

      const res = await request(app)
        .get(`/v1/playlists/${playlistOne._id}/activities`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.results).toHaveLength(3);
      expect(res.body.results).toEqual([
        {
          playlist: {
            name: playlistOne.name,
            id: playlistOne._id.toHexString(),
          },
          collaborator: {
            name: userOne.name,
            id: userOne._id.toHexString(),
          },
          song: {
            title: songOne.title,
            id: songOne._id.toHexString(),
          },
          action: 'add',
          id: expect.anything(),
        },
        {
          playlist: {
            name: playlistOne.name,
            id: playlistOne._id.toHexString(),
          },
          collaborator: {
            name: userOne.name,
            id: userOne._id.toHexString(),
          },
          song: {
            title: songTwo.title,
            id: songTwo._id.toHexString(),
          },
          action: 'add',
          id: expect.anything(),
        },
        {
          playlist: {
            name: playlistOne.name,
            id: playlistOne._id.toHexString(),
          },
          collaborator: {
            name: userOne.name,
            id: userOne._id.toHexString(),
          },
          song: {
            title: songOne.title,
            id: songOne._id.toHexString(),
          },
          action: 'delete',
          id: expect.anything(),
        },
      ]);
    });

    test('should return 400 error if playlist id is not valid mongo id', async () => {
      await request(app)
        .get(`/v1/playlists/invalidId/activities`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).get(`/v1/playlists/${playlistOne._id}/activities`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if non-collaborator user trying to get playlist activities', async () => {
      await request(app)
        .get(`/v1/playlists/${playlistOne._id}/activities`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should correctly apply filter on action field', async () => {
      await addSong(songOne._id, playlistOne._id);
      await addSong(songTwo._id, playlistOne._id);
      await deleteSong(songOne._id, playlistOne._id);

      const res = await request(app)
        .get(`/v1/playlists/${playlistOne._id}/activities`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ action: 'add' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: [
          {
            playlist: {
              name: playlistOne.name,
              id: playlistOne._id.toHexString(),
            },
            collaborator: {
              name: userOne.name,
              id: userOne._id.toHexString(),
            },
            song: {
              title: songOne.title,
              id: songOne._id.toHexString(),
            },
            action: 'add',
            id: expect.anything(),
          },
          {
            playlist: {
              name: playlistOne.name,
              id: playlistOne._id.toHexString(),
            },
            collaborator: {
              name: userOne.name,
              id: userOne._id.toHexString(),
            },
            song: {
              title: songTwo.title,
              id: songTwo._id.toHexString(),
            },
            action: 'add',
            id: expect.anything(),
          },
        ],
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
    });

    test('should limit returned array if limit param is specified', async () => {
      await addSong(songOne._id, playlistOne._id);
      await addSong(songTwo._id, playlistOne._id);
      await addSong(songThree._id, playlistOne._id);

      const res = await request(app)
        .get(`/v1/playlists/${playlistOne._id}/activities`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].action).toEqual('add');
      expect(res.body.results[0].song.title).toEqual(songOne.title);
      expect(res.body.results[1].action).toEqual('add');
      expect(res.body.results[1].song.title).toEqual(songTwo.title);
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await addSong(songOne._id, playlistOne._id);
      await addSong(songTwo._id, playlistOne._id);
      await addSong(songThree._id, playlistOne._id);

      const res = await request(app)
        .get(`/v1/playlists/${playlistOne._id}/activities`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ limit: 2, page: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].song.title).toEqual(songThree.title);
    });
  });
});
