const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Album } = require('../../src/models');
const { insertAlbums, albumOne, albumTwo } = require('../fixtures/album.fixture');

setupTestDB();

describe('Album routes', () => {
  describe('POST /v1/albums', () => {
    let newAlbum;

    beforeEach(() => {
      newAlbum = {
        name: faker.name.findName(),
        year: 2000,
      };
    });

    test('should return 201 and successfully create new album if data is ok', async () => {
      const res = await request(app).post('/v1/albums').send(newAlbum).expect(httpStatus.CREATED);
      expect(res.body).toEqual({
        id: expect.any(String),
        songs: [],
        name: newAlbum.name,
        year: newAlbum.year,
      });

      const dbAlbum = await Album.findById(res.body.id);
      expect(dbAlbum).toBeDefined();
      expect(dbAlbum).toMatchObject({ name: newAlbum.name, year: newAlbum.year });
    });

    test('should return 400 error if name is invalid', async () => {
      newAlbum.email = '';

      const res = await request(app).post('/v1/albums').send(newAlbum).expect(httpStatus.BAD_REQUEST);
      expect(res.body).toEqual({
        code: 400,
        message: expect.any(String),
      });
    });

    test('should return 400 error if year is invalid', async () => {
      newAlbum.year = 'abc';

      const res = await request(app).post('/v1/albums').send(newAlbum).expect(httpStatus.BAD_REQUEST);
      expect(res.body).toEqual({
        code: 400,
        message: expect.any(String),
      });
    });
  });

  describe('GET /v1/albums/:albumId', () => {
    test('should return 200 and the album object if data is ok', async () => {
      await insertAlbums([albumOne]);

      const res = await request(app).get(`/v1/albums/${albumOne._id}`).send().expect(httpStatus.OK);
      expect(res.body).toEqual({
        id: albumOne._id.toHexString(),
        songs: [],
        name: albumOne.name,
        year: albumOne.year,
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
    test('should return 200 and successfully update user if data is ok', async () => {
      await insertAlbums([albumOne]);
      const updateBody = {
        name: faker.name.findName(),
        year: 2020,
      };

      const res = await request(app).patch(`/v1/albums/${albumOne._id}`).send(updateBody).expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: albumOne._id.toHexString(),
        songs: [],
        name: updateBody.name,
        year: updateBody.year,
      });

      const dbAlbum = await Album.findById(albumOne._id);
      expect(dbAlbum).toBeDefined();
      expect(dbAlbum).toMatchObject({ name: updateBody.name, year: updateBody.year });
    });

    test('should return 404 if updating album that is not found', async () => {
      await insertAlbums([albumOne]);
      const updateBody = { name: faker.name.findName() };

      await request(app).patch(`/v1/albums/${albumTwo._id}`).send(updateBody).expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if albumId is not a valid mongo id', async () => {
      await insertAlbums([albumOne]);
      const updateBody = { name: faker.name.findName() };

      await request(app).patch(`/v1/albums/invalidId`).send(updateBody).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if name is invalid', async () => {
      await insertAlbums([albumOne]);
      const updateBody = { name: '' };

      await request(app).patch(`/v1/albums/${albumOne._id}`).send(updateBody).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if year is invalid', async () => {
      await insertAlbums([albumOne]);
      const updateBody = { year: 'abcd' };

      await request(app).patch(`/v1/albums/${albumOne._id}`).send(updateBody).expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('DELETE /v1/albums/:albumId', () => {
    test('should return 204 if data is ok', async () => {
      await insertAlbums([albumOne]);

      await request(app).delete(`/v1/albums/${albumOne._id}`).send().expect(httpStatus.NO_CONTENT);

      const dbAlbum = await Album.findById(albumOne._id);
      expect(dbAlbum).toBeNull();
    });

    test('should return 400 error if albumId is not a valid mongo id', async () => {
      await insertAlbums([albumOne]);

      await request(app).delete('/v1/albums/invalidId').send().expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if album already is not found', async () => {
      await insertAlbums([albumOne]);

      await request(app).delete(`/v1/albums/${albumTwo._id}`).send().expect(httpStatus.NOT_FOUND);
    });
  });
});
