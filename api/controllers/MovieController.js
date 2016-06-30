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
		backdrop_url: 'http://image.tmdb.org/t/p/w1280/'+m.backdrop_path,
		poster_url: 'http://image.tmdb.org/t/p/w1280/'+m.poster_path,
	};
	Movie.findOrCreate({imdb_id: m.id}, o).exec(function (err, rec) {
		if (err) return;
		fetchCast(rec, function(){
			// TODO
		});
		return callback(null, rec);
	});
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
	async.map(
		data.results,
		cacheMovies,
		function (err, movies) {
			if (err) res.json({});
			movies = _.flatten(movies, 1);
			res.json(movies);
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
		get(url).asBuffer(function(err, data) {
			if (err) return res.json({});
			sendCachedMovies(JSON.parse(data), res);
		});
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
			get(url).asBuffer(function(err, data) {
				if (err) return res.json({});
				sendCachedMovies(JSON.parse(data), res);
			});
		}
	},

	partial: function (req, res) {
		Movie.findOne({id: req.param('id')}).exec(function (err, movie) {
			if (err) res.json({});
			// pretify the date
			movie.release_date = moment(movie.release_date).fromNow();
			// truncate the synopsis
			movie.synopsis = _.truncate(movie.synopsis, { 'length': 200 });
			User.findOne(req.session.user.id, function (err, user) {
				return res.view({ layout: false, movie: movie, user: user });
			});
		})
	},

	play: function (req, res) {
		movie = Movie.findOne({id: req.param('id')}).exec(function (err,movie) {
			if (err || !movie) return res.serverError({str: 'could not find movie', error: err});
			Comment.find({movie_id: movie.id}, function (err, comments) {
				if (err) return res.json(err);
				User.findOne(req.session.user.id, function (err, user) {
					if (err) return res.json(err);
					if (!user.movies)
						user.movies = [movie.id];
					else
						user.movies.push(movie.id);
					user.save(function (err) {
						if (err) return res.json(err);
						return res.view('movie/play', { video: movie, comments: comments });
					});
				});
			});
		});
	},

	add_comment: function(req, res){
		Comment.create({comment: req.param('comment'), user_id: req.session.user.firstname, movie_id: req.param('id')}).exec(function (err, result){
			if (err) {
				sails.log.debug(err);
				return;
			}
			return res.redirect('/movie/play/'+req.param('id'));
		})
	}
};
