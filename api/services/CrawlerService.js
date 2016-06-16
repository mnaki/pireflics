/**
 * CrawlerService
 *
 * @description :: Server-side logic for crawling torrent
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const kickass   = require('kickass-api');
const piratebay = require('thepiratebay');

module.exports = {

  /**
   * `CrawlerService.search()`
   */
  search: function (name) {
    
    // start both query in parallel, first finish, first choosen
    async.race([
        // search via kickass api
        function(callback){
            kickass.search({
                query: name,
                category: 'movies',
                verified: 1,
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
                // if we found nothing, wait one second for the other research to complete otherwise return no result
                else 
                    setTimeout(function(){
                        callback(true);
                    }, 1000);
            }).catch(function (error) {
                 // if we got an error, wait one second for the other research to complete otherwise return no result
                 setTimeout(function(){
                        callback(true);
                }, 1000);
            });
        },
        // search via piratebay api
        function(callback){
            piratebay.search(name, {
                category: 'all',
                filter: {
                    verified: true  
                },
                orderBy: 'seeds',
                sortBy: 'desc' 
            })
            .then(function(results) {
                // if we get a result return it
                if (response.length > 0) {
                    // set his source to normalise it after
                    response[0].source = "piratebay";
                    callback(null, response[0])
                }
                // if we found nothing, wait one second for the other research to complete otherwise return no result
                else 
                    setTimeout(function(){
                        callback(true);
                    }, 1000);
            })
            .catch(function(err) {
                // if we got an error, wait one second for the other research to complete otherwise return no result
                 setTimeout(function(){
                        callback(true);
                }, 1000);
            })
        }
    ],
    function(err, result) {
        // if we got a error, we must have found nothing
        if (err) return { found: false };

        // we need to normalise the json return to handle it no matter where it has been crawled  
        var torrent = {};
        if (result.source == "kickass") {
            torrent.name = result.title;
            torrent.size = result.size;
            torrent.magnet = result.magnet;
            torrent.link = result.torrentLink;
            torrent.seeds = result.seeds;
        } else if (result.source == "piratebay") {
            torrent.name = result.name;
            torrent.size = result.size;
            torrent.magnet = result.magnetLink;
            torrent.link = result.link;
            torrent.seeds = result.seeders;
        }

        // and return the torrent with all data inside
        return { found: true, torrent: torrent };
    });
  }
};

