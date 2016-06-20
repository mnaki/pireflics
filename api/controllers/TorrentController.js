/**
 * TorrentController
 *
 * @description :: Server-side logic for managing Torrents
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const _ = require('lodash')

module.exports = {
    search: function (req, res) {

        var name = req.query.name;
		var queryname = _.join(_.split(name, " "), "%");

		sails.log.info("searching for : " + name);


        // ensure that the name is valid
        if (name == undefined || name.length < 2)
            return res.status(400);

        // try to get a torrent already downloaded
        Torrent.find({ title: { 'like': "%" + queryname + "%"}}).exec(function ( err, results ) {
             // if not crawl it
            if (err || results.length == 0) {
				sails.log.info("No torrent found for title " + name + " start crawling ...")
				CrawlerService.search(name, function ( err, result ) {
                    // if nothing is found send no result
                    if ( err || result == null) {
                        res.notFound(); return ;
                    }

					// set the title to found it next time
					result.title = result.info.title;
					
                    // and register it in the database
					Torrent.create(result, function(err, user) {
						if (err) return res.serverError(err);

						sails.log.info("Crawler has found a torrent for " + name + ", registering it ...")
						res.ok(user);

					});
                });
				
			}
			else {
				sails.log.info("Some torrent has been found for title " + name )
                res.ok(results[0]); return ; 
            }
        });
    }
};

