/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var bcrypt = require('bcryptjs');

module.exports = {

  attributes: {
    email: {
      type: 'email',
      required: true,
      unique: true
    },
    password: {
      type: 'string'
    },
    firstname: {
      type: 'string'
    },
    lastname: {
      type: 'string'
    },
    default_language:{
        type: 'string',
        defaultsTo: 'En'
    },
    image : {
        type: 'url'
    }
  },

  beforeCreate: function(user, cb) {
	// if he log via facebook, dont hash the password
	if (user.password == undefined || user.password.length == 0)
		cb();
	// if its local strategy, hash it
	else {
		bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash(user.password, salt, function(err, hash) {
				if (err) {
					console.log(err);
					cb(err);
				} else {
					user.password = hash;
					cb();
				}
			});
		});
	}
  }
};

