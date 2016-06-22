/**
 * TorrentController
 *
 * @description :: Server-side logic for managing Torrents
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const _             = require('lodash')
const fs            = require("fs-extra");
const torrentStream = require('torrent-stream');
const throttle      = require('throttle');

const videoFormat   = ["mkv", "avi", "mp4", "ogg", "webm", "wmv"]

module.exports = {
    /**
    *   `TorrentController.search()`
    *   /torrent/search/:name
    *
    *   Route used to search for a torrent, it will search in the database if its already here or start crawling it
    */
    search: function (req, res) {

        var name = req.params.name;
		var queryname = _.join(_.split(name, " "), "%");

		sails.log.debug("TorrentController | search |  searching for : " + name);

        // ensure that the name is valid
        if (name == undefined || name.length < 2)
            return res.status(400);

        // try to get a torrent already downloaded
        Torrent.find({ title: { 'like': "%" + queryname + "%" } }).exec(function ( err, results ) {
             // if not crawl it
            if (err || results.length == 0) {
				sails.log.debug("TorrentController | search |  No torrent found for title " + name + " start crawling ...")

				CrawlerService.search(name, function ( err, result ) {
                    // if nothing is found send no result
                    if ( err || result == null) {
                        res.notFound(); return ;
                    }

					// set the title to search it next time
					result.title = result.info.title;
                    result.download = false;
					
                    // and register it in the database
					Torrent.create(result, function(err, model) {
						if (err) 
                            return res.serverError(err);
                        else {
					        sails.log.debug("TorrentController | search |  Crawler has found a torrent for " + name + ", registering it under id " + model.id);
						    res.ok(model.toJSON());
                        }
					});
                });			
			}
			else {
				sails.log.debug("TorrentController | search |  A torrent has been found for title " + name )
                res.ok(results[0]);
            }
        });
    },

    /**
    *   `TorrentController.download()`
    *   /torrent/:id/download
    *
    *   Route used to start the download of a torrent that has been prevsiouly crawled
    */
    download: function (req, res) {
        Torrent.find({ id: req.params.id }).exec(function ( err, results ) {
             // check if we found the torrent to start the download
             if ( err || results.length == 0) {
                 res.notFound();
             } else {
                var torrent = results[0];


                if (torrent.download) {
                    res.json({ error: "already downloaded" });
                    return ;
                }

                 // start the download
                var engine = torrentStream(torrent.magnet);

                engine.on('ready', function() {    
                    var target = null;

                    // find the video that interest us
                    async.each(engine.files, function( file, callback ) {
                        // get the extention
                        var ext = file.name.split(".").pop();

                        // if the file is not video or its a sample
                        if (videoFormat.indexOf(ext) === -1 || file.name.indexOf("sample") !== -1) {
                            callback()
                            return ;
                        }

                        // if we didnt have yet found video, set this one and continue
                        if (target == null) 
                            target = file;
                        // if the file is bigger that the one already get, get this one
                        else if (file.length > target.length) {
                            target = file;
                        }

                        callback();
                    }, function( err ) {

                        sails.log.debug("TorrentController | download | File choosen for torrent " + torrent.id + " is " + target.name);

                        var stream = target.createReadStream();
                        var path = process.cwd() + '/.tmp/private/videos/' + torrent.id + '/';

                        // make the folders that will receive the torrent file
                        fs.mkdirs(path, function (err) {
                            if (err)
                                res.serverError(err);
                            else {
                                // update with the torrent path
                                torrent.path = '/videos/' + torrent.id + '/' + target.name;
                                torrent.size = target.length;
                                torrent.save();
                                
                                // send the model with the path
                                res.ok(torrent.toJSON());

                                var writer = fs.createWriteStream(path + '/' + target.name);
                                stream.pipe(new throttle(10000000)).pipe(writer);

                                stream.on('end', function () {
                                    sails.log.debug("TorrentController | download | Download of torrent " + torrent.id + " is finished");
                                    torrent.download = true;
                                    torrent.save();
                                });
                            }
                        });
                    });
                });
             }
        });
    },

    /**
    *   `TorrentController.stream()`
    *   /torrent/:id/stream
    *
    *   Route used to start the download of a torrent that has been prevsiouly crawled
    */
    stream: function (req, res) {
        Torrent.find({ id: req.params.id }).exec(function ( err, results ) {
             // check if we found the torrent to start the download
             if ( err || results.length == 0) {
                 res.notFound();
             } else {
                var torrent = results[0];

                var path = process.cwd() + '/.tmp/private' + torrent.path;
                var total = torrent.size;

                if (req.headers['range']) {
                    var parts = req.headers.range.replace(/bytes=/, "").split("-");

                    var start = parseInt(parts[0], 10);
                    var tmp = start + 1000000 - 1;
                    var end = tmp;
                    var chunksize = (end-start)+1;
                    console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

                    var file = fs.createReadStream(path, {start: start, end: end});
                    res.writeHead(206, { 
                        'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 
                        'Accept-Ranges': 'bytes', 
                        'Content-Length': chunksize, 
                        'Content-Type': 'video/mp4' 
                    });
                    file.pipe(res);
                } else {
                    console.log('ALL: ' + torrent.size);
                    res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
                    fs.createReadStream(path).pipe(res);
                }
             }
        });
    }

};

