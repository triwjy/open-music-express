const faker = require('faker');
const { Album } = require('../../../src/models');
const { insertAlbums, albumOne } = require('../../fixtures/album.fixture');
const setupTestDB = require('../../utils/setupTestDB');

setupTestDB();

describe('Album model', () => {
  describe('Album validation', () => {
    let newAlbum;
    beforeEach(() => {
      newAlbum = {
        name: faker.name.findName(),
        year: Math.floor(Math.random() * 22) + 2000,
      };
    });
    test('should correctly validate a valid album', async () => {
      await expect(new Album(newAlbum).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if name is invalid', async () => {
      newAlbum.name = '';
      await expect(new Album(newAlbum).validate()).rejects.toThrow();
    });

    test('should throw a validation error if year is invalid', async () => {
      newAlbum.year = 'abc';
      await expect(new Album(newAlbum).validate()).rejects.toThrow();
    });
  });
  describe('Like and unlike instance method', () => {
    let album;
    beforeEach(async () => {
      await insertAlbums(albumOne);
      album = await Album.findById(albumOne);
    });
    test('should increase totalLikes using addLikes method', async () => {
      expect(album.totalLikes).toBe(0);
      await album.addLikes();
      const updatedAlbum = await Album.findById(album);
      expect(updatedAlbum.totalLikes).toBe(1);
    });
    test('should decrease totalLikes using reduceLikes method', async () => {
      album.totalLikes = 2;
      await album.save();
      expect(album.totalLikes).toBe(2);
      await album.reduceLikes();
      const updatedAlbum = await Album.findById(album);
      expect(updatedAlbum.totalLikes).toBe(1);
    });
  });
});
