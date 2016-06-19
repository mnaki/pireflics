/**
 * MovieController
 *
 * @description :: Server-side logic for managing movies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// var readTorrent = require("read-torrent");
// var nameToImdb = require("name-to-imdb");
// var ptn = require('parse-torrent-name');
var imdb = require('imdb');
var omdb = require('omdb');
var PageScraper = require('page-scraper');

module.exports = {
	popular: function (req, res) {
		var selector = '#main > div > span > div > div > div.lister > table > tbody > tr > td.titleColumn > a';
		var pageScraper = new PageScraper({
			baseUrl: 'http://www.imdb.com'
		});
		pageScraper.scrape('/chart/moviemeter', function(error, $) {
			var titles = $(selector).map(function (i, el) {
				return $(el).text();
			}).get();

			console.log(titles)

			if (req.wantsJSON) return res.json(titles);
			else               return res.send(titles);
		});
	},

	/*
	** GET http://localhost:1337/movie/search/naruto?&page=1&itemPerPage=2
	** [
	**	  {
	**	    "title": "Naruto: Shippûden",
	**	    "year": {
	**	      "from": 2007
	**	    },
	**	    "imdb": "tt0988824",
	**	    "type": "series"
	**	  },
	**	  {
	**	    "title": "Naruto",
	**	    "year": {
	**	      "from": 2002,
	**	      "to": 2007
	**	    },
	**	    "imdb": "tt0409591",
	**	    "type": "series"
	**	  }
	**	]
	*/

	search: function (req, res) {
		omdb.search(req.param('name'), function (err, movies) {
			if (err) throw err;

			var page = req.param('page') || 1
			var itemPerPage = req.param('itemPerPage') || 5

			sails.log.debug("movies " + movies)
			movies = _.slice(movies, (page-1) * itemPerPage, (page) * itemPerPage)

			var detailed = [];

            movies.forEach(function (movie) {
				sails.log.debug(movie)

                imdb(movie.imdb, function(err, data) {
                  if (err) sails.log.error(err.stack);

                  if (data) {
					  sails.log.debug("data " + data)
                      detailed.push(data);
                      if (detailed.length == movies.length) {
						  sails.log.debug("sending response")
                            if (req.wantsJSON) res.json(detailed);
        		            else               res.send(detailed);
                      }
                  }
                });
            });


		})
	}
};
