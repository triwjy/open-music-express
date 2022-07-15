const faker = require('faker');
const mongoose = require('mongoose');
const { Playlist } = require('../../../src/models');

describe('Playlist model', () => {
  describe('Playlist validation', () => {
    let newPlaylist;
    beforeEach(async () => {
      newPlaylist = {
        name: faker.name.findName(),
        owner: mongoose.Types.ObjectId(),
        collaborators: [mongoose.Types.ObjectId()],
        songs: [mongoose.Types.ObjectId()],
        activities: [mongoose.Types.ObjectId()],
      };
    });

    test('should correctly validate a valid playlist', async () => {
      await expect(new Playlist(newPlaylist).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if owner is invalid', async () => {
      newPlaylist.owner = 'invalid';
      await expect(new Playlist(newPlaylist).validate()).rejects.toThrow();
    });

    test('should throw a validation error if collaborator id is invalid', async () => {
      newPlaylist.collaborators[0] = 'invalid';
      await expect(new Playlist(newPlaylist).validate()).rejects.toThrow();
    });

    test('should throw a validation error if song id is invalid', async () => {
      newPlaylist.songs[0] = 'invalid';
      await expect(new Playlist(newPlaylist).validate()).rejects.toThrow();
    });
  });
});
