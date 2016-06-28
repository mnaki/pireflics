/**
 * MovieController
 *
 * @description :: Server-side logic for managing movies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var get = require('get');
var _ = require('lodash');
var api_key = '67493736c8511d59d83f70c4b88a72f6';
var queryString = require('query-string');
var async = require('async');

var cacheMovies = function (m, callback) {
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
};

var sendCachedMovies = function (data, res) {
	try {
		async.map(
			data.results,
			cacheMovies,
			function (err, movies) {
				if (err) return ;
				res.json(_.omitBy(movies, function (o) {
					return _.isNil(o.title);
				}));
			}
		);
	}
	catch (e) { return; }
}

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
				if (err) return res.json({});
				sendCachedMovies(JSON.parse(data), res);
			});
		}
		catch (e) { return; }
	},

	search: function (req, res) {
		if (!req.wantsJSON) return res.view();
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
					if (err) return res.json({});
					sendCachedMovies(JSON.parse(data), res);
				});
			}
			catch (e) { return; }
		}
	},

	partial: function (req, res) {
		return res.view({ layout: false, data: req.param('data') });
	},

	play: function (req, res) {
		movie = Movie.find({id: req.param('id')}).exec(function (err, rec) {
			if (err || rec.length == 0) return;
			return res.view('movie/play', { video: movie[0] });
		});
	}
};
