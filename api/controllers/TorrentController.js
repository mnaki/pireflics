/**
 * TorrentController
 *
 * @description :: Server-side logic for managing Torrents
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	

    search: function (req, res) {

        var name = req.query.name;
		sails.log.info("name : " + name);

        // ensure that the name is valid
        if (name == undefined || name.length < 2)
            return res.status(400);

        // try to get a torrent already downloaded
        Torrent.find({ title: { 'like%': name }}).exec(function ( err, results ) {
             // if not crawl it
            if ( err || results.length == 0) {
				CrawlerService.search(name, function ( err, result ) {
                    // if nothing is found send no result
                    if ( err || result == null) {
                        res.notFound(); return ;
                    }

					res.ok(result);

                    // and register it in the database
                    /*Torrent.create(result).exec(function ( err, result ) {
						sails.log.info("toto");
                        if ( err ) { res.status( 500 ); return ; }

                        sails.log.info("Torrent " + name + " found and registered with id " + result.id);
						res.ok();
                    });*/
                });
				
			}
			else {
                res.status( 500 ); return ; 
            }
        });
    }
};

