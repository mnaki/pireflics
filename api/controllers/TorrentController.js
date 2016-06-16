/**
 * TorrentController
 *
 * @description :: Server-side logic for managing Torrents
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	

    search: function (req, res) {
        var name = req.body.name;

        // ensure that the name is valid
        if (name == undefined || name.length < 2)
            return res.sendStatus(400);

        // try to get a torrent already downloaded
        Torrent.find({ title: { 'like%': name }}).exec(function ( err, torrent) {
             // if not crawl it
            if ( err || torrent == undefined) {
                CrawlerService.search(name, function (err, result) {
                    // if nothing is found send no result
                    if (err) {
                        res.sendStatus(404); return ;
                    }

                    // set the torrent title if found
                    result.title = result.info.title;

                    // and register it in the database
                    Torrent.create(result).exec(function ( err, result ) {
                        if ( err ) { res.sendStatus( 500 ); return ; }

                        console.log("Torrent " + name + " found and registered with id " + result.id);
                    });
                });
            }
        });
    }
};

