/**
 * Torrent.js
 *
 * @description :: This model represente a torrent that has been crawled, he may not be fully downloaded
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
	title:  {
		type: 'string'
	},
    // link to the .torrent
    link : {
        type: 'text'
    },
    // size of the torrent
    size : {
        type: 'string'
    },
	source : {
		type: 'string'
	},
	seeds : {
        type: 'string'
    },
    // magnet url
    magnet : {
        type: 'text'
    },
    // any additional information on the torrent
    info : {
        type: 'json'
    }
  }
};

