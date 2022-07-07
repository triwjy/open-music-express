const faker = require('faker');
const mongoose = require('mongoose');
const { Playlist } = require('../../../src/models');

describe('Playlist model', () => {
  describe('Playlist validation', () => {
    let newPlaylist;
    let newActivity;
    beforeEach(() => {
      newActivity = {
        collaboratorId: mongoose.Types.ObjectId(),
        songId: mongoose.Types.ObjectId(),
        action: 'add',
      };
      newPlaylist = {
        name: faker.name.findName(),
        owner: mongoose.Types.ObjectId(),
        collaborators: [mongoose.Types.ObjectId()],
        songs: [mongoose.Types.ObjectId()],
        activities: [newActivity],
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

    test('should throw a validation error if activity collaborator is invalid', async () => {
      newPlaylist.activities[0].collaboratorId = 'invalid';
      await expect(new Playlist(newPlaylist).validate()).rejects.toThrow();
    });

    test('should throw a validation error if activity songId is invalid', async () => {
      newPlaylist.activities[0].songId = 'invalid';
      await expect(new Playlist(newPlaylist).validate()).rejects.toThrow();
    });

    test('should throw a validation error if activity action is invalid', async () => {
      newPlaylist.activities[0].action = 'singing';
      await expect(new Playlist(newPlaylist).validate()).rejects.toThrow();
    });
  });
});
