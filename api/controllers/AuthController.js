/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var passport = require('passport');

module.exports = {
    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    },

    login: function(req, res) {

        passport.authenticate('local', function(err, user, info) {
            if ((err) || (!user)) {
                return res.send({
                    message: info.message,
                    user: user
                });
            }
            req.logIn(user, function(err) {
                if (err) res.send(err);

                req.session.user = user;
                res.redirect('/');
            });
        })(req, res);
    },

	facebook: function(req, res) {
        passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/auth/login', scope: ['public_profile','email']}, function(err, user, info) {
            if (err || !user) {
				// handle error 
                return res.send({
                    err: err,
                    info: info,
                    user: user
                });
            }

			// login via passport
            req.logIn(user, function(err) {
                if (err)
                    return res.send(err);
				req.session.user = user;
                return res.redirect('/');
            });
        })(req, res);
    },

    logout: function(req, res) {
        req.session.user = null;
        req.logout();
        res.redirect('/');
    }
};

