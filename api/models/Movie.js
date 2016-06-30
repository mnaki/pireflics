/**
 * Movie.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    imdb_id: {
      required: true,
      type: 'string',
      unique: false
    },
    release_date: {
      type: 'date'
    },
    synopsis: {
      type: 'text'
    },
    poster_url: {
      type: 'string'
    },
    backdrop_url: {
      type: 'string'
    },
    title: {
      type: 'string'
    },
    vote_average: {
      type: 'float'
    },
    popularity: {
      type: 'float'
    },
    cast: {
      type: 'json'
    },
  	torrent: {
  	  model: 'torrent'
  	}
  }
};
