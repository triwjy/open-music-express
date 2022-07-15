const mongoose = require('mongoose');
const { PlaylistActivity } = require('../../../src/models');

describe('PlaylistActivity model', () => {
  describe('PlaylistActivity validation', () => {
    let newActivity;
    beforeEach(async () => {
      const playlistId = mongoose.Types.ObjectId();
      const collaboratorId = mongoose.Types.ObjectId();
      const songId = mongoose.Types.ObjectId();
      newActivity = {
        playlist: playlistId,
        collaborator: collaboratorId,
        song: songId,
        action: 'add',
      };
    });

    test('should correctly validate a valid playlist activity', async () => {
      await expect(new PlaylistActivity(newActivity).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if playlist is invalid', async () => {
      newActivity.playlist = 'invalid';
      await expect(new PlaylistActivity(newActivity).validate()).rejects.toThrow();
    });

    test('should throw a validation error if collaborator id is invalid', async () => {
      newActivity.collaborator = 'invalid';
      await expect(new PlaylistActivity(newActivity).validate()).rejects.toThrow();
    });

    test('should throw a validation error if song id is invalid', async () => {
      newActivity.song = 'invalid';
      await expect(new PlaylistActivity(newActivity).validate()).rejects.toThrow();
    });

    test('should throw a validation error if action is invalid', async () => {
      newActivity.action = 'invalid';
      await expect(new PlaylistActivity(newActivity).validate()).rejects.toThrow();
    });
  });
});
