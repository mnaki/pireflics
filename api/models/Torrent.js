/**
 * Torrent.js
 *
 * @description :: This model represente a torrent that has been crawled, he may not be fully downloaded
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    id : {
        type: 'text',
        defaultsTo: function() {
          return uuid.v4();
        },
        unique: true,
        required: true
    },
    // name of the torrent file
    title : {
        type: 'string'
    },
    // link to the .torrent
    link : {
        type: 'string'
    },
    // size of the torrent
    size : {
        type: 'string'
    },
    // magnet url
    magnet : {
        type: 'string'
    },
    // any additional information on the torrent
    info : {
        type: 'json'
    },
    // date of creation
    created : {
        type: 'date',
        defaultsTo: Date.now()
    },
    // if the torrent is already download
    downloaded: {
        type: 'boolean',
        defaultsTo: false
    }
  }
};

