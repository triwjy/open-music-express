const faker = require('faker');
const { User } = require('../../../src/models');
const { insertAlbums, albumOne, albumTwo } = require('../../fixtures/album.fixture');
const { userOne } = require('../../fixtures/user.fixture');
const setupTestDB = require('../../utils/setupTestDB');

setupTestDB();

describe('User model', () => {
  describe('User validation', () => {
    let newUser;
    beforeEach(() => {
      newUser = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password1',
        role: 'user',
      };
    });

    test('should correctly validate a valid user', async () => {
      await expect(new User(newUser).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if email is invalid', async () => {
      newUser.email = 'invalidEmail';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if password length is less than 8 characters', async () => {
      newUser.password = 'passwo1';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if password does not contain numbers', async () => {
      newUser.password = 'password';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if password does not contain letters', async () => {
      newUser.password = '11111111';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if role is unknown', async () => {
      newUser.role = 'invalid';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });
  });

  describe('User toJSON()', () => {
    test('should not return user password when toJSON is called', () => {
      const newUser = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password1',
        role: 'user',
      };
      expect(new User(newUser).toJSON()).not.toHaveProperty('password');
    });
  });

  describe('Toggle album likes', () => {
    let user;
    beforeEach(async () => {
      await insertAlbums(albumOne, albumTwo);
      user = await User.create(userOne);
    });

    test('should add an album into likedAlbums', async () => {
      expect(user.likedAlbums).toEqual([]);

      await user.toggleLikes(albumOne._id);
      await user.toggleLikes(albumTwo._id);

      const updatedUser = await User.findById(user);
      expect(updatedUser.likedAlbums).toEqual([albumOne._id, albumTwo._id]);

      await user.toggleLikes(albumOne._id);

      const finalStateUser = await User.findById(user);
      expect(finalStateUser.likedAlbums).toEqual([albumTwo._id]);
    });
  });
});
