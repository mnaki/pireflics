/**
 * DownloadWorker
 *
 * @description :: Server-side logic for crawling torrent
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const fs            = require("fs-extra");
const torrentStream = require('torrent-stream');
const mkdirp        = require("mkdirp");

/**
 * A list of video format :
 */
const videoFormat = ["mkv", "avi", "mp4", "ogg", "webm", "wmv"]

module.exports = {

    /**
    * `DownloadWorker.download()`
    */
    download: function (torrent) {
        var engine = torrentStream(torrent.magnet);

        engine.on('ready', function() {
            // for each file in the torrent
            engine.files.forEach(function(file) {
                // get the extention
                var ext = file.name.split(".").pop();

                // if the file is not video or its a sample
                if (videoFormat.indexOf(ext) === -1 || file.name.indexOf("sample") !== -1) {
                    return ;
                }

                // else start the download
                var stream = file.createReadStream();
                var path = process.cwd() + '/.tmp/public/videos/' + torrent.id + '/';

                // make the folders that will receive the torrent file
                fs.mkdirs(path, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        // update with the torrent path
                        torrent.path = '/videos/' + torrent.id + '/' + file.name;
                        torrent.save();

                        var writer = fs.createWriteStream(path + '/' + file.name);

                        stream.on('data', function (data) {
                            writer.write(data);
                        });
                        stream.on('end', function () {
                            sails.log.info("Download of torrent " + torrent.id + " is finished");
                            torrent.download = true;
                            torrent.save();
                        });
                    }
                });
            });
        });
    }
};

