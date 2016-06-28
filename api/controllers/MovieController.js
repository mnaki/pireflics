/**
 * MovieController
 *
 * @description :: Server-side logic for managing movies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var TheMovieDb = require('themoviedb');
var client = new TheMovieDb('67493736c8511d59d83f70c4b88a72f6');
var get = require('get');
var _ = require('lodash');
var api_key = '67493736c8511d59d83f70c4b88a72f6';
var queryString = require('query-string');
var async = require('async');
/*
var paginate = function (list, page, itemPerPage) {
	page = page || 1;
	itemPerPage = itemPerPage || 5;
	return _.slice(list, (page-1) * itemPerPage, (page) * itemPerPage);
}
*/

/*var cacheMovies = function (m, callback) {
	var o = {
		imdb_id: m.id,
		release_date: m.release_date,
		synopsis: m.overview,
		title: m.title,
		vote_average: m.vote_average,
		popularity: m.popularity,
		backdrop_url: 'http://image.tmdb.org/t/p/w185/'+m.backdrop_path,
		poster_url: 'http://image.tmdb.org/t/p/w185/'+m.poster_path,
	};
	Movie.findOrCreate(o, o).exec(callback);
}*/

module.exports = {
	popular: function (req, res) {
		try {
			var page = req.param('page') || 1;
			var query = {
				api_key: api_key,
				query: req.param('name'),
				page: page
			}
			var url = 'http://api.themoviedb.org/3/movie/popular/?'+queryString.stringify(query);
			get(url).asBuffer(function(err, data) {
				data = JSON.parse(data);

				if (err) sails.log.debug(err);
				else sails.log.debug(data);

				async.map(
					data.results,
					cacheMovies,
					function (err, movies) {
						sails.log.debug(err);
						if (req.wantsJSON) res.json(movies);
						else               res.send(movies);
					}
				);

			});
		} catch (e) {
			sails.log.debug(e);
		}
	},

	search: function (req, res) {
		if (!req.wantsJSON)
		{
			return res.view();
		}
		else
		{
			try {
				var page = req.param('page') || 1;
				var query = {
					api_key: api_key,
					query: req.param('name'),
					page: page
				}
				var url = 'http://api.themoviedb.org/3/search/movie/?'+queryString.stringify(query);
				get(url).asBuffer(function(err, data) {
					data = JSON.parse(data);

					if (err) sails.log.debug(err);
					else sails.log.debug(data);

					async.map(
						data.results,
						cacheMovies,
						function (err, movies) {
							sails.log.debug(err);
							res.json(movies);
						}
					);
				});
			} catch (e) {
				sails.log.debug(e);
			}
		}

	},

	main: function (req, res) {
		return res.view();
	},

	partial: function (req, res) {
		return res.view('movie/partial', { layout: false, data: req.param('data') });
	},

	play: function (req, res) {
		// J'ai du utilise une requete HTTP ici au lieu du module nodejs TMDB a cause d'un bug dedans
		var url = 'http://api.themoviedb.org/3/movie/'+req.param('id')+'?api_key='+api_key;
		get(url).asBuffer(function(err, data) {
			if (err) return res.send({});
			var movie = JSON.parse(data);
			return res.view('movie/play', { video: movie });
		});
	}
};
