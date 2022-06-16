const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Song, Album } = require('../../src/models');
const { albumOne, insertAlbums, albumTwo } = require('../fixtures/album.fixture');
const { insertSongs, songOne, songTwo, songThree } = require('../fixtures/song.fixture');

setupTestDB();

describe('Song routes', () => {
  describe('POST /v1/songs', () => {
    let newSong;
    let newSong2;

    beforeEach(() => {
      newSong = {
        title: faker.name.findName(),
        year: 2001,
        genre: faker.music.genre(),
        performer: faker.name.findName(),
        duration: Math.floor(Math.random() * 20) + 180,
        albumId: albumOne._id,
      };
      newSong2 = {
        title: faker.name.findName(),
        year: 2001,
        genre: faker.music.genre(),
        performer: faker.name.findName(),
        duration: Math.floor(Math.random() * 20) + 180,
      };
    });

    test('should return 201 and successfully create new song if data is ok', async () => {
      insertAlbums([albumOne]);

      const res = await request(app).post('/v1/songs').send(newSong).expect(httpStatus.CREATED);
      expect(res.body).toEqual({
        id: expect.any(String),
        title: newSong.title,
        year: newSong.year,
        performer: newSong.performer,
        genre: newSong.genre,
        duration: newSong.duration,
        albumId: albumOne._id.toHexString(),
      });

      const dbSong = await Song.findById(res.body.id);
      expect(dbSong).toBeDefined();
      expect(dbSong).toMatchObject({
        title: newSong.title,
        year: newSong.year,
        performer: newSong.performer,
        genre: newSong.genre,
        duration: newSong.duration,
        albumId: albumOne._id.toHexString(),
      });

      // add song to album-songs
      const dbAlbum = await Album.findById(albumOne._id).populate('songs', 'title');
      expect(dbAlbum.songs[0].title).toBe(newSong.title);
    });

    test('should return 201 and successfully create new song if data is ok and without album Id', async () => {
      const res = await request(app).post('/v1/songs').send(newSong2).expect(httpStatus.CREATED);
      expect(res.body).toEqual({
        id: expect.any(String),
        title: newSong2.title,
        year: newSong2.year,
        performer: newSong2.performer,
        genre: newSong2.genre,
        duration: newSong2.duration,
      });

      const dbSong = await Song.findById(res.body.id);
      expect(dbSong).toBeDefined();
      expect(dbSong).toMatchObject({
        title: newSong2.title,
        year: newSong2.year,
        performer: newSong2.performer,
        genre: newSong2.genre,
        duration: newSong2.duration,
      });
    });

    test('should return 400 error if title is invalid', async () => {
      newSong.title = '';

      const res = await request(app).post('/v1/songs').send(newSong).expect(httpStatus.BAD_REQUEST);
      expect(res.body).toEqual({
        code: 400,
        message: expect.any(String),
      });
    });

    test('should return 400 error if year is invalid', async () => {
      newSong.year = 'abc';

      const res = await request(app).post('/v1/songs').send(newSong).expect(httpStatus.BAD_REQUEST);
      expect(res.body).toEqual({
        code: 400,
        message: expect.any(String),
      });
    });

    test('should return 400 error if genre is invalid', async () => {
      newSong.genre = '';

      const res = await request(app).post('/v1/songs').send(newSong).expect(httpStatus.BAD_REQUEST);
      expect(res.body).toEqual({
        code: 400,
        message: expect.any(String),
      });
    });

    test('should return 400 error if performer is invalid', async () => {
      newSong.performer = '';

      const res = await request(app).post('/v1/songs').send(newSong).expect(httpStatus.BAD_REQUEST);
      expect(res.body).toEqual({
        code: 400,
        message: expect.any(String),
      });
    });

    test('should return 400 error if duration is invalid', async () => {
      newSong.genre = '';

      const res = await request(app).post('/v1/songs').send(newSong).expect(httpStatus.BAD_REQUEST);
      expect(res.body).toEqual({
        code: 400,
        message: expect.any(String),
      });
    });

    test('should return 400 error if albumId is invalid', async () => {
      newSong.albumId = '';

      const res = await request(app).post('/v1/songs').send(newSong).expect(httpStatus.BAD_REQUEST);
      expect(res.body).toEqual({
        code: 400,
        message: expect.any(String),
      });
    });

    test('should return 404 error if albumId is not found', async () => {
      newSong.albumId = mongoose.Types.ObjectId();

      const res = await request(app).post('/v1/songs').send(newSong).expect(httpStatus.NOT_FOUND);
      expect(res.body).toEqual({
        code: 404,
        message: expect.any(String),
      });
    });
  });

  describe('GET /v1/songs', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertSongs([songOne, songTwo, songThree]);

      const res = await request(app).get('/v1/songs').send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0]).toEqual({
        id: songOne._id.toHexString(),
        title: songOne.title,
        year: songOne.year,
        genre: songOne.genre,
        performer: songOne.performer,
        duration: songOne.duration,
        albumId: albumOne._id.toHexString(),
      });
    });

    test('should correctly apply filter on title field', async () => {
      await insertSongs([songOne, songTwo, songThree]);

      const res = await request(app).get('/v1/songs').query({ title: songOne.title }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(songOne._id.toHexString());
    });

    test('should correctly apply filter on year field', async () => {
      await insertSongs([songOne, songTwo, songThree]);

      const res = await request(app).get('/v1/songs').query({ year: songOne.year }).send().expect(httpStatus.OK);
      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(songOne._id.toHexString());
    });

    test('should correctly apply filter on genre field', async () => {
      await insertSongs([songOne, songTwo, songThree]);

      const res = await request(app).get('/v1/songs').query({ genre: songOne.genre }).send().expect(httpStatus.OK);
      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(songOne._id.toHexString());
    });

    test('should correctly apply filter on performer field', async () => {
      await insertSongs([songOne, songTwo, songThree]);

      const res = await request(app).get('/v1/songs').query({ performer: songOne.performer }).send().expect(httpStatus.OK);
      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(songOne._id.toHexString());
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertSongs([songOne, songTwo, songThree]);

      const res = await request(app).get('/v1/songs').query({ sortBy: 'year:desc' }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0].id).toBe(songThree._id.toHexString());
      expect(res.body.results[1].id).toBe(songOne._id.toHexString());
    });

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      await insertSongs([songOne, songTwo, songThree]);

      const res = await request(app).get('/v1/songs').query({ sortBy: 'year:asc' }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0].id).toBe(songOne._id.toHexString());
      expect(res.body.results[1].id).toBe(songTwo._id.toHexString());
    });

    test('should correctly sort the returned array if multiple sorting criteria are specified', async () => {
      await insertSongs([songOne, songTwo, songThree]);

      const res = await request(app).get('/v1/songs').query({ sortBy: 'year:desc,title:asc' }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);

      const expectedOrder = [songOne, songTwo, songThree].sort((a, b) => {
        if (a.year < b.year) {
          return 1;
        }
        if (a.year > b.year) {
          return -1;
        }
        return a.title < b.title ? -1 : 1;
      });

      expectedOrder.forEach((song, index) => {
        expect(res.body.results[index].id).toBe(song._id.toHexString());
      });
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertSongs([songOne, songTwo, songThree]);

      const res = await request(app).get('/v1/songs').query({ limit: 2 }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(songOne._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertSongs([songOne, songTwo, songThree]);

      const res = await request(app).get('/v1/songs').query({ page: 2, limit: 1 }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 1,
        totalPages: 3,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(songTwo._id.toHexString());
    });
  });

  describe('GET /v1/songs/:songId', () => {
    test('should return 200 and the song object if data is ok', async () => {
      await insertAlbums([albumOne]);
      await insertSongs([songOne]);

      const res = await request(app).get(`/v1/songs/${songOne._id}`).send().expect(httpStatus.OK);
      expect(res.body).toEqual({
        id: songOne._id.toHexString(),
        title: songOne.title,
        year: songOne.year,
        genre: songOne.genre,
        performer: songOne.performer,
        duration: songOne.duration,
        albumId: songOne.albumId,
      });
    });

    test('should return 400 error if songId is not a valid mongo id', async () => {
      await insertSongs([songOne]);

      await request(app).get('/v1/songs/invalidId').send().expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if song is not found', async () => {
      await insertSongs([songOne]);

      await request(app).get(`/v1/songs/${songTwo._id}`).send().expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/songs/:songId', () => {
    test('should return 200 and successfully update song if data is ok', async () => {
      await insertAlbums([albumOne]);
      await insertSongs([songOne]);

      const updateBody = {
        title: faker.name.findName(),
        year: 2020,
        albumId: albumOne._id,
      };

      const res = await request(app).patch(`/v1/songs/${songOne._id}`).send(updateBody).expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: songOne._id.toHexString(),
        title: updateBody.title,
        year: updateBody.year,
        genre: songOne.genre,
        performer: songOne.performer,
        duration: songOne.duration,
        albumId: songOne.albumId,
      });

      const dbSong = await Song.findById(songOne._id);
      expect(dbSong).toBeDefined();
      expect(dbSong).toMatchObject({ title: updateBody.title, year: updateBody.year });

      const dbAlbum = await Album.findById(albumOne._id);
      expect(dbAlbum.songs[0]._id).toEqual(songOne._id);
    });

    test('should return 404 if updating song that is not found', async () => {
      await insertSongs([songOne]);
      const updateBody = { title: faker.name.findName() };

      await request(app).patch(`/v1/songs/${songTwo._id}`).send(updateBody).expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if songId is not a valid mongo id', async () => {
      await insertSongs([songOne]);
      const updateBody = { title: faker.name.findName() };

      await request(app).patch(`/v1/songs/invalidId`).send(updateBody).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if title is invalid', async () => {
      await insertSongs([songOne]);
      const updateBody = { title: '' };

      await request(app).patch(`/v1/songs/${songOne._id}`).send(updateBody).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if year is invalid', async () => {
      await insertSongs([songOne]);
      const updateBody = { year: 'abcd' };

      await request(app).patch(`/v1/songs/${songOne._id}`).send(updateBody).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 if updating with invalid album id', async () => {
      await insertAlbums([albumOne]);
      await insertSongs([songOne]);
      const updateBody = { albumId: albumTwo._id };

      await request(app).patch(`/v1/songs/${songOne._id}`).send(updateBody).expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/songs/:songId', () => {
    test('should return 204 if ok', async () => {
      await insertSongs([songOne]);

      await request(app).delete(`/v1/songs/${songOne._id}`).send().expect(httpStatus.NO_CONTENT);

      const dbSong = await Song.findById(songOne._id);
      expect(dbSong).toBeNull();
    });

    test('should return 400 error if songId is not a valid mongo id', async () => {
      await insertSongs([songOne]);

      await request(app).delete('/v1/songs/invalidId').send().expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if song already is not found', async () => {
      await insertSongs([songOne]);

      await request(app).delete(`/v1/songs/${songTwo._id}`).send().expect(httpStatus.NOT_FOUND);
    });

    test('should remove song from album [songs]', async () => {
      await insertAlbums(albumOne);

      const newSong = {
        title: faker.name.findName(),
        year: 2001,
        genre: faker.music.genre(),
        performer: faker.name.findName(),
        duration: Math.floor(Math.random() * 20) + 180,
        albumId: albumOne._id,
      };
      const songRes = await request(app).post('/v1/songs').send(newSong);
      let albumRes = await request(app).get(`/v1/albums/${albumOne._id}`);
      expect(albumRes.body.songs.length).toEqual(1);
      expect(albumRes.body.songs[0].id).toEqual(songRes.body.id);
      await request(app).delete(`/v1/songs/${songRes.body.id}`).send().expect(httpStatus.NO_CONTENT);

      albumRes = await request(app).get(`/v1/albums/${albumOne._id}`);
      expect(albumRes.body.songs.length).toEqual(0);
    });
  });
});
