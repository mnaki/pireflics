/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    new_user: function(req, res){
        var validator = require('validator');

        console.log(req.param("email"));
        if(validator.isEmail(req.param('email'))){
            console.log('c est un email');
        }
        else
            console.log('c est pas un email');
    }
	
};

