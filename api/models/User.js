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
      pwd: {
          type: 'string'
      },
      firstname: {
          type: 'string',
      },
      lastname: {
          type: 'string',
      },
      sexe:{
          type : 'string'
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
	if (user.pwd == undefined || user.pwd.length == 0){
        cb();
    }

	// if its local strategy, hash it
	else {
        sails.log.debug('PWD define');
        bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash(user.pwd, salt, function(err, hash) {
				if (err) {
					console.log(err);
					cb(err);
				} else {
					user.pwd = hash;
					cb();
				}
			});
		});
	}
  }
};

