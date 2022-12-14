const path = require('path');
const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Album } = require('../../src/models');
const { insertAlbums, albumOne, albumTwo } = require('../fixtures/album.fixture');
const { adminAccessToken, userOneAccessToken, userTwoAccessToken } = require('../fixtures/token.fixture');
const { insertUsers, admin, userOne, userTwo } = require('../fixtures/user.fixture');
const redisClient = require('../../src/services/redis/redis.init');

setupTestDB();

describe('Album routes', () => {
  describe('POST /v1/albums', () => {
    let newAlbum;

    beforeEach(async () => {
      await insertUsers([admin]);
      newAlbum = {
        name: faker.name.findName(),
        year: 2000,
      };
    });

    test('should return 201 and successfully create new album if data is ok', async () => {
      const res = await request(app)
        .post('/v1/albums')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newAlbum)
        .expect(httpStatus.CREATED);
      expect(res.body).toEqual({
        id: expect.any(String),
        songs: [],
        totalLikes: 0,
        name: newAlbum.name,
        year: newAlbum.year,
        coverUrl: '',
      });

      const dbAlbum = await Album.findById(res.body.id);
      expect(dbAlbum).toBeDefined();
      expect(dbAlbum).toMatchObject({ name: newAlbum.name, year: newAlbum.year });
    });

    test('should return 400 error if name is invalid', async () => {
      newAlbum.name = '';

      const res = await request(app)
        .post('/v1/albums')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newAlbum)
        .expect(httpStatus.BAD_REQUEST);
      expect(res.body).toEqual({
        code: 400,
        message: expect.any(String),
      });
    });

    test('should return 400 error if year is invalid', async () => {
      newAlbum.year = 'abc';

      const res = await request(app)
        .post('/v1/albums')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newAlbum)
        .expect(httpStatus.BAD_REQUEST);
      expect(res.body).toEqual({
        code: 400,
        message: expect.any(String),
      });
    });

    test('should return 401 error if no access token is given', async () => {
      await request(app).post('/v1/albums').send(newAlbum).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 error if wrong access token is given', async () => {
      await request(app)
        .post('/v1/albums')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newAlbum)
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/albums', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertAlbums([albumOne, albumTwo]);

      const res = await request(app).get('/v1/albums').send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0]).toEqual({
        id: albumOne._id.toHexString(),
        songs: [],
        totalLikes: 0,
        name: albumOne.name,
        year: albumOne.year,
        coverUrl: '',
      });
    });

    test('should correctly apply filter on name field', async () => {
      await insertAlbums([albumOne, albumTwo]);

      const res = await request(app).get('/v1/albums').query({ name: albumOne.name }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(albumOne._id.toHexString());
    });

    test('should correctly apply filter on year field', async () => {
      await insertAlbums([albumOne, albumTwo]);

      const res = await request(app).get('/v1/albums').query({ year: 2001 }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(albumOne._id.toHexString());
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertAlbums([albumOne, albumTwo]);

      const res = await request(app).get('/v1/albums').query({ sortBy: 'year:desc' }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(albumTwo._id.toHexString());
      expect(res.body.results[1].id).toBe(albumOne._id.toHexString());
    });

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      await insertAlbums([albumOne, albumTwo]);

      const res = await request(app).get('/v1/albums').query({ sortBy: 'year:asc' }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(albumOne._id.toHexString());
      expect(res.body.results[1].id).toBe(albumTwo._id.toHexString());
    });

    test('should correctly sort the returned array if multiple sorting criteria are specified', async () => {
      await insertAlbums([albumOne, albumTwo]);

      const res = await request(app).get('/v1/albums').query({ sortBy: 'year:desc,name:asc' }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);

      const expectedOrder = [albumOne, albumTwo].sort((a, b) => {
        if (a.year < b.year) {
          return 1;
        }
        if (a.year > b.year) {
          return -1;
        }
        return a.name < b.name ? -1 : 1;
      });

      expectedOrder.forEach((album, index) => {
        expect(res.body.results[index].id).toBe(album._id.toHexString());
      });
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertAlbums([albumOne, albumTwo]);

      const res = await request(app).get('/v1/albums').query({ limit: 1 }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 1,
        totalPages: 2,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(albumOne._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertAlbums([albumOne, albumTwo]);

      const res = await request(app).get('/v1/albums').query({ page: 2, limit: 1 }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 1,
        totalPages: 2,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(albumTwo._id.toHexString());
    });
  });

  describe('GET /v1/albums/:albumId', () => {
    test('should return 200 and the album object if data is ok', async () => {
      await insertAlbums([albumOne]);

      const res = await request(app).get(`/v1/albums/${albumOne._id}`).send().expect(httpStatus.OK);
      expect(res.body).toEqual({
        id: albumOne._id.toHexString(),
        songs: [],
        totalLikes: 0,
        name: albumOne.name,
        year: albumOne.year,
        coverUrl: '',
      });
    });

    test('should return 400 error if albumId is not a valid mongo id', async () => {
      await insertAlbums([albumOne]);

      await request(app).get('/v1/albums/invalidId').send().expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if album is not found', async () => {
      await insertAlbums([albumOne]);

      await request(app).get(`/v1/albums/${albumTwo._id}`).send().expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/albums/:albumId', () => {
    beforeEach(async () => {
      await Promise.all([insertAlbums([albumOne]), insertUsers([admin])]);
    });
    test('should return 200 and successfully update song if data is ok', async () => {
      const updateBody = {
        name: faker.name.findName(),
        year: 2020,
      };

      const res = await request(app)
        .patch(`/v1/albums/${albumOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: albumOne._id.toHexString(),
        songs: [],
        totalLikes: 0,
        name: updateBody.name,
        year: updateBody.year,
        coverUrl: '',
      });

      const dbAlbum = await Album.findById(albumOne._id);
      expect(dbAlbum).toBeDefined();
      expect(dbAlbum).toMatchObject({ name: updateBody.name, year: updateBody.year });
    });

    test('should return 401 error if no access token is given', async () => {
      const updateBody = {
        name: faker.name.findName(),
        year: 2020,
      };

      await request(app).patch(`/v1/albums/${albumOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 error if wrong access token is given', async () => {
      const updateBody = {
        name: faker.name.findName(),
        year: 2020,
      };

      await request(app)
        .patch(`/v1/albums/${albumOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 if updating album that is not found', async () => {
      const updateBody = { name: faker.name.findName() };

      await request(app)
        .patch(`/v1/albums/${albumTwo._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if albumId is not a valid mongo id', async () => {
      const updateBody = { name: faker.name.findName() };

      await request(app)
        .patch(`/v1/albums/invalidId`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if name is invalid', async () => {
      const updateBody = { name: '' };

      await request(app)
        .patch(`/v1/albums/${albumOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if year is invalid', async () => {
      const updateBody = { year: 'abcd' };

      await request(app)
        .patch(`/v1/albums/${albumOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('DELETE /v1/albums/:albumId', () => {
    beforeEach(async () => {
      await Promise.all([insertAlbums([albumOne]), insertUsers([admin])]);
    });
    test('should return 204 if data is ok', async () => {
      await request(app)
        .delete(`/v1/albums/${albumOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbAlbum = await Album.findById(albumOne._id);
      expect(dbAlbum).toBeNull();
    });

    test('should return 401 error if no access token is given', async () => {
      await request(app).delete(`/v1/albums/${albumOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 error if no wrong access token is given', async () => {
      await request(app)
        .delete(`/v1/albums/${albumOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if albumId is not a valid mongo id', async () => {
      await request(app)
        .delete('/v1/albums/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if album already is not found', async () => {
      await request(app)
        .delete(`/v1/albums/${albumTwo._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });

    test('should remove albumId from associated song', async () => {
      const newSong = {
        title: faker.name.findName(),
        year: 2001,
        genre: faker.music.genre(),
        performer: faker.name.findName(),
        duration: Math.floor(Math.random() * 20) + 180,
        albumId: albumOne._id,
      };
      let songRes = await request(app).post('/v1/songs').set('Authorization', `Bearer ${adminAccessToken}`).send(newSong);
      expect(songRes.body.albumId).toEqual(albumOne._id.toHexString());

      await request(app)
        .delete(`/v1/albums/${albumOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      songRes = await request(app).get(`/v1/songs/${songRes.body.id}`);
      expect(songRes.body.albumId).toBeNull();
    });
  });

  describe('POST /v1/albums/albumCover/:albumId', () => {
    beforeEach(async () => {
      await insertAlbums([albumOne]);
      await insertUsers([admin]);
    });
    test('should upload album cover successfully if data is ok and admin is authenticated', async () => {
      const filePath = path.join(__dirname, '..', 'fixtures', 'twilio.png');
      const res = await request(app)
        .post(`/v1/albums/albumCover/${albumOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .attach('albumCover', filePath)
        .expect(httpStatus.OK);

      expect(res.body.fileUrl).toContain('http://');
    });

    test('should return 401 when trying to upload album cover without admin token', async () => {
      const filePath = path.join(__dirname, '..', 'fixtures', 'twilio.png');
      await request(app)
        .post(`/v1/albums/albumCover/${albumOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .attach('albumCover', filePath)
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 when no file was sent', async () => {
      await request(app)
        .post(`/v1/albums/albumCover/${albumOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 when uploading not-supported extension type', async () => {
      const filePath = path.join(__dirname, '..', 'fixtures', 'test.txt');
      await request(app)
        .post(`/v1/albums/albumCover/${albumOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .attach('albumCover', filePath)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
  describe('POST /v1/albums/likes/:albumId', () => {
    beforeEach(async () => {
      if (!redisClient.isReady) {
        await redisClient.connect();
      }
      await insertAlbums([albumOne]);
      await insertUsers([userOne, userTwo]);
    });
    afterEach(async () => {
      await redisClient.quit();
    });
    test('should toggle between like an unlike  on album', async () => {
      await request(app)
        .post(`/v1/albums/likes/${albumOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);
      await request(app)
        .post(`/v1/albums/likes/${albumOne._id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .expect(httpStatus.OK);

      let albumOneLikesResponse = await request(app).get(`/v1/albums/likes/${albumOne._id}`).expect(httpStatus.OK);
      expect(albumOneLikesResponse.body.totalLikes).toBe(2);

      await request(app)
        .post(`/v1/albums/likes/${albumOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      albumOneLikesResponse = await request(app).get(`/v1/albums/likes/${albumOne._id}`).expect(httpStatus.OK);
      expect(albumOneLikesResponse.body.totalLikes).toBe(1);
    });

    test('should use custom header when returning results from cache', async () => {
      await request(app)
        .post(`/v1/albums/likes/${albumOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      const firstAlbumOneLikesResponse = await request(app).get(`/v1/albums/likes/${albumOne._id}`).expect(httpStatus.OK);
      expect(firstAlbumOneLikesResponse.headers['x-data-source']).toBeUndefined();

      const secondAlbumOneLikesResponse = await request(app).get(`/v1/albums/likes/${albumOne._id}`).expect(httpStatus.OK);
      expect(secondAlbumOneLikesResponse.headers['x-data-source']).toBe('cache');
    });
  });
});
