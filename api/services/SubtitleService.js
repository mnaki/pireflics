/**
 * SubtitleService
 *
 * @description :: Server-side service to search and download subtitles
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const fs            = require("fs-extra");
const OS            = require('opensubtitles-api');
const srt2vtt       = require('srt-to-vtt')

module.exports = {

    /**
    * `SubtitleService.search()`
    *
    *   Function used to call a research on opensubtitles to find a subtitle
    */
    search: function ( torrent, lang ) {
        OpenSubtitles.search({
            sublanguageid: lang,
            filesize: torrent.size, 
            filename: torrent.download ? torrent.path.split('/').pop() : null,
            extensions: ['srt', 'vtt'], 
            limit: 'best',
            query: title
        }).then(function (subtitles) {
            console.log(subtitles);
        });
    }
};

