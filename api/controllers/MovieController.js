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
	sails.log.debug(m.title)
	var o = {
		imdb_id: m.id,
		release_date: m.release_date,
		synopsis: m.overview,
		title: m.title,
		vote_average: m.vote_average,
		popularity: m.popularity
	};

	if (!!m.backdrop_path) o.backdrop_url = 'http://image.tmdb.org/t/p/w1280/'+m.backdrop_path;
	if (!!m.poster_path) o.poster_url = 'http://image.tmdb.org/t/p/w1280/'+m.poster_path;

	Movie.findOrCreate({imdb_id: m.id}, o).exec(function (err, rec) {
		if (err || !rec || rec.length < 1) {
			sails.log.debug([m.title, 'findOrCreate', err])
			return res.redirect('/error', err);
		}
		fetchCast(rec, function (err, data) {
			if (err) {
				sails.log.debug([m.title, 'fetchCast', err])
				return err;
			}
		});
		sails.log.debug([m.title, 'success'])
		return callback(null, rec);
	});
};

var fetchCast = function (m, callback) {
	if (!m) return;
	if (m.cast != null)
		return;
	var query = {
		api_key: api_key
	}
	var url = 'http://api.themoviedb.org/3/movie/'+m.imdb_id+'/credits?'+queryString.stringify(query);
	try
	{
		get(url).asBuffer(function(err, data) {
			if (err) return callback(err, data);
			var cast = JSON.parse(data).cast;
			return Movie.update({imdb_id: m.imdb_id}, {cast: cast}).exec(callback);
		});
	}
	catch (e) { return callback(e); }
};

var sendCachedMovies = function (data, req, res) {
	async.map(
		data.results,
		cacheMovies,
		function (err, movies) {
			if (err) {
				sails.log.debug(['sendCachedMovies', err]);
				return res.redirect('/error', err);
			}
			movies = _.flatten(movies, 1);
			movies = _.sortBy(movies, req.param('sortBy'));
			movies = _.pickBy(movies, function (m) {
				if (m.release_date == undefined || m.release_date == null)
					return false;
				var date = m.release_date.toISOString().split('-')[0];
				return date >= (req.param('yearFrom') || 1900) && date <= (req.param('yearTo') || 2100);
			});
			sails.log.debug('movies.length = ' + movies.length);
			if (req.param('order') == 'desc') movies = _.reverse(movies);
			return res.json(movies);
		}
	);
}

module.exports = {
	popular: function (req, res) {
		var query = {
			api_key: api_key,
			query: req.param('name'),
			page: req.param('page') || 1,
			language: req.param('language') || 'en'
		};
		var url = 'http://api.themoviedb.org/3/movie/popular/?'+queryString.stringify(query);
		try
		{
			get(url).asBuffer(function(err, data) {
				if (err) return res.redirect('/error', err);
				return sendCachedMovies(JSON.parse(data), req, res);
			});
		}
		catch (e) { return res.redirect('/error', e); }
	},

	search: function (req, res) {
		if (!req.wantsJSON) return res.view();
		else
		{
			var query = {
				api_key: api_key,
				query: req.param('name'),
				page: req.param('page') || 1,
				language: req.param('language') || 'en'
			};
			var url = 'http://api.themoviedb.org/3/search/movie/?'+queryString.stringify(query);
			try
			{
				get(url).asBuffer(function(err, data) {
					sails.log.debug(url)
					if (err) return res.redirect('/error', err);
					return sendCachedMovies(JSON.parse(data), req, res);
				});
			}
			catch (e) { return res.redirect('/error', e); }
		}
	},

	partial: function (req, res) {
		Movie.findOne({id: req.param('id')}).exec(function (err, movie) {
			if (err || !movie) return res.redirect('/error', err);
			// pretify the date
			movie.release_date = moment(movie.release_date).fromNow();
			// truncate the synopsis
			movie.synopsis = _.truncate(movie.synopsis, { 'length': 200 });
			User.findOne(req.session.user.id, function (err, user) {
				if (err || !user) return res.redirect('/error', err);
				return res.view({ layout: false, movie: movie, user: user });
			});
		})
	},

	play: function (req, res) {
		Movie.findOne({id: req.param('id')}).exec(function (err, movie) {
			if (err || !movie) return res.redirect('/error', err);
			if (!movie.cast || movie.cast == {})
				return res.forbidden('Movie is still under process, try again later');
			Comment.find({movie_id: movie.id}).populate('user').exec(function (err, comments) {
				if (err || !comments) return res.redirect('/error', err);
				User.findOne(req.session.user.id, function (err, user) {
					if (err || !user) return res.redirect('/error', err);
					if (!user.movies)
						user.movies = [movie.id];
					else
						user.movies.push(movie.id);
					user.save(function (err) {
						if (err) return res.redirect('/error', err);
						// pretify the date
						movie.release_date = moment(movie.release_date).fromNow();
						// truncate the synopsis
						movie.synopsis = _.truncate(movie.synopsis, { 'length': 500 });
						return res.view('movie/play', { video: movie, comments: comments });
					});
				});
			});
		});
	},

	add_comment: function(req, res){
		Comment.create({comment: req.param('comment'), user: req.session.user.id, movie_id: req.param('id')}).exec(function (err, result){
			if (err || !result || result.length < 1) {
				return res.redirect('/error', err);
			}
			return res.redirect('/movie/play/'+req.param('id'));
		})
	}
};
