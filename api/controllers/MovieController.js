/**
 * MovieController
 *
 * @description :: Server-side logic for managing movies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var TheMovieDb = require('themoviedb');
var client = new TheMovieDb('67493736c8511d59d83f70c4b88a72f6');

var paginate = function (list, page, itemPerPage) {
	return _.slice(list, (page-1) * itemPerPage, (page) * itemPerPage);
}

module.exports = {
	popular: function (req, res) {
		client.popularMovies(function(err, movies) {
			movies = paginate(movies, req.param('page') || 1, req.param('itemPerPage') || 5)
			if (req.wantsJSON) return res.json(movies);
			else               return res.send(movies);
		});
	},

	search: function (req, res) {
		client.searchMovies({query: req.param('name'), sortBy: 'popularity.desc'}, function (err, movies) {
			movies = paginate(movies, req.param('page') || 1, req.param('itemPerPage') || 5)
			if (req.wantsJSON) return res.json(movies);
			else               return res.send(movies);
		});
	}
};
