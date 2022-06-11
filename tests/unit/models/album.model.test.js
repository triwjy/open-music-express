const faker = require('faker');
const { Album } = require('../../../src/models');

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
});
