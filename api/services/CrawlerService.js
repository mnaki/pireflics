/**
 * CrawlerService
 *
 * @description :: Server-side logic for crawling torrent
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const kickass   = require('kickass-api');
const piratebay = require('thepiratebay');
const ptn       = require('parse-torrent-name');
const async2 	= require("async");
const bytesize	= require("byte-size");

module.exports = {

  /**
   * `CrawlerService.search()`
   */
  search: function (name, callback) {
    
    // start both query in parallel, first finish, first choosen
    async2.parallel([
        // search via kickass api
        function(callback){
            kickass.search({
                query: name,
                sort_by: 'seeders',
                order: 'desc',
                language: 'en'
            }).then(function (response) {
                // if we get a result return it
                if (response.results.length > 0) {
                    // set his source to normalise it after
                    response.results[0].source = "kickass";
                    callback(null, response.results[0])
                }
                // if we found nothing
                else 
                    callback(true);
            }).catch(function (error) {
            	callback(true);
            });
        },
        // search via piratebay api
        function(callback) {
            piratebay.search(name, {
                category: 'all',
                filter: {
                    verified: false  
                },
                orderBy: 'seeds',
                sortBy: 'desc' 
            })
            .then(function(response) {
                // if we get a result return it
                if (response.length > 0) {
                    // set his source to normalise it after
                    response[0].source = "piratebay";
                    callback(null, response[0]);
                }
                // if we found nothing
                else 
                    callback(true);
            })
            .catch(function(err) {
                callback(true);
            })
        }
    ],
    function(err, result) {
        // if we got a error, we must have found nothing
        if (err && result[0] == undefined && result[1] == undefined) {
            callback(true, null);
            return ;
        }
        
		var torrent = {};
		if (result[0] == undefined)
			torrent = result[1];
		else if (result[1] == undefined)
			torrent = result[0];
		else if (result[0].seeds > result[1].seeders)
			torrent = result[0];
		else
			torrent = result[1];
		
		// we need to normalise the json return to handle it no matter where it has been crawled
		var returned = {};
		returned.link = torrent.torrentLink || torrent.link;
		returned.seeds = torrent.seeders || torrent.seeds;
		returned.source = torrent.source;
        returned.size = torrent.size;
		returned.magnet = torrent.magnetLink || torrent.magnet;
        returned.info = torrent.title || torrent.name;

		// parse info from name
		returned.info = ptn(returned.info);

		// prettify size if from kickass
		if (torrent.source == "kickass")
       		returned.size = bytesize(torrent.size, { units: 'iec' });

        // and return the torrent with all data inside
        callback(false, returned);
    });
  }
};

