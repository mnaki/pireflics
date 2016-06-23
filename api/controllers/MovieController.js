/**
 * MovieController
 *
 * @description :: Server-side logic for managing movies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var TheMovieDb = require('themoviedb');
var client = new TheMovieDb('67493736c8511d59d83f70c4b88a72f6');
var get = require('get');

var paginate = function (list, page, itemPerPage) {
	page = page || 1;
	itemPerPage = itemPerPage || 5;
	return _.slice(list, (page-1) * itemPerPage, (page) * itemPerPage);
}

module.exports = {
	popular: function (req, res) {
		client.popularMovies(function(err, movies) {
			if (err) return;
			movies = paginate(movies, req.param('page'), req.param('itemPerPage'))
			if (req.wantsJSON) return res.json(movies);
			else               return res.send(movies);
		});
	},

	search: function (req, res) {
		client.searchMovies({query: req.param('name'), sortBy: 'popularity.desc'}, function (err, movies) {
			if (err) return;
			movies = paginate(movies, req.param('page'), req.param('itemPerPage'))
			if (req.wantsJSON) return res.json(movies);
			else               return res.send(movies);
		});
	},

	main: function (req, res) {
		return res.view();
	},

	partial: function (req, res) {
		return res.view('movie/partial', { layout: false, data: req.param('data') });
	},

	play: function (req, res) {
		// J'ai du utilise une requete HTTP ici au lieu du module nodejs TMDB a cause d'un bug dedans
		var url = 'http://api.themoviedb.org/3/movie/'+req.param('id')+'?api_key=67493736c8511d59d83f70c4b88a72f6';
		get(url).asBuffer(function(err, data) {
			if (err) return;
			var movie = JSON.parse(data);
			return res.view('movie/play', { video: movie });
		});
	}
};
