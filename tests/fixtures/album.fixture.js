const mongoose = require('mongoose');
const faker = require('faker');
const { Album } = require('../../src/models');

const albumOne = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  year: 2001,
};

const albumTwo = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  year: 2002,
};

const insertAlbums = async (albums) => {
  await Album.insertMany(albums);
};

module.exports = {
  albumOne,
  albumTwo,
  insertAlbums,
};
