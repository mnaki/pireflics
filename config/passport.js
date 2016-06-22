var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy;
    bcrypt = require('bcryptjs');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findOne({ id: id } , function (err, user) {
        done(err, user);
    });
});

passport.use(new FacebookStrategy({
        clientID: 1740667796150987,
        clientSecret: '28007b588dca84fb8b51a11f4cc26a35',
        callbackURL: "/auth/facebook/callback",
		profileFields: ['id', 'displayName', 'name', 'emails']
    },
    function(accessToken, refreshToken, profile, done) {
		// handle register via facebook
        User.findOrCreate({ email: profile.emails[0].value }, function(err, user) {
            if (err) { return done(err); }

			// if we created it, just update the name from facebook
			user.lastname = profile.name.familyName;
			user.firstname = profile.name.givenName;
			user.save();

            done(null, user);
        });
    }
));

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function(email, password, done) {

        User.findOne({ email: email }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect email.' });
            }

            bcrypt.compare(password, user.password, function (err, res) {
                if (!res)
                    return done(null, false, {
                        message: 'Invalid Password'
                    });
                var returnUser = {
                    email: user.email,
                    createdAt: user.createdAt,
                    id: user.id
                };
                return done(null, returnUser, {
                    message: 'Logged In Successfully'
                });
            });
        });
    }
));
