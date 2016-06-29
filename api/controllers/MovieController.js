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
var moment = require('moment');

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
	return Movie.findOrCreate({imdb_id: m.id}, o).exec(function (err, rec) {
		if (err) return;
		return fetchCast(rec, callback);
	});
	// return Movie.findOrCreate({imdb_id: m.id}, o).exec(callback);
};

var fetchCast = function (m, callback) {
	if (!m) return;
	var query = {
		api_key: api_key
	}
	var url = 'http://api.themoviedb.org/3/movie/'+m.imdb_id+'/credits?'+queryString.stringify(query);
	get(url).asBuffer(function(err, data) {
		if (err) return;
		var cast = JSON.parse(data).cast;
		return Movie.update({imdb_id: m.imdb_id}, {cast: cast}).exec(callback);
	});

};

var sendCachedMovies = function (data, res) {
	try {
		async.map(
			data.results,
			cacheMovies,
			function (err, movies) {
				if (err) return;
				// res.json(_.omitBy(movies, function (o) { return _.isNil(o.title) } ));
				movies = _.flatten(movies, 1);
				res.json(movies);
			}
		);
	}
	catch (e) { return; }
}

module.exports = {
	popular: function (req, res) {
		try {
			var query = {
				api_key: api_key,
				query: req.param('name'),
				page: req.param('page') || 1,
				language: req.param('language') || 'en'
			};
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
				var query = {
					api_key: api_key,
					query: req.param('name'),
					page: req.param('page') || 1,
					language: req.param('language') || 'en'
				};
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
		Movie.findOne({id: req.param('id')}).exec(function (err, movie) {
			// pretify the date
			movie.release_date = moment(movie.release_date).fromNow();
			// truncate the synopsis
			movie.synopsis = _.truncate(movie.synopsis, { 'length': 200 });
			return res.view({ layout: false, movie: movie });
		})
	},

	play: function (req, res) {
		movie = Movie.find({id: req.param('id')}).exec(function (err,results) {
			if (err || results.length == 0) return res.serverError(err);

			return res.view('movie/play', { video: results[0] });
		});
	}
};
