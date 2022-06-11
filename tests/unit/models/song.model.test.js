const faker = require('faker');
const { Song } = require('../../../src/models');
const { albumOne } = require('../../fixtures/album.fixture');

describe('Song model', () => {
  describe('Song validation', () => {
    let newSong;
    beforeEach(() => {
      newSong = {
        title: faker.name.findName(),
        year: Math.floor(Math.random() * 22) + 2000,
        genre: faker.music.genre(),
        performer: 'bac',
        duration: Math.floor(Math.random() * 22) + 2000,
        albumId: albumOne._id,
      };
    });

    test('should correctly validate a valid song', async () => {
      await expect(new Song(newSong).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if title is invalid', async () => {
      newSong.title = '';
      await expect(new Song(newSong).validate()).rejects.toThrow();
    });

    test('should throw a validation error if year is invalid', async () => {
      newSong.year = 'abc';
      await expect(new Song(newSong).validate()).rejects.toThrow();
    });

    test('should throw a validation error if genre is invalid', async () => {
      newSong.genre = '';
      await expect(new Song(newSong).validate()).rejects.toThrow();
    });

    test('should throw a validation error if performer is invalid', async () => {
      newSong.performer = '';
      await expect(new Song(newSong).validate()).rejects.toThrow();
    });
  });
});
