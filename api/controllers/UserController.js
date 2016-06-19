/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    new_user: function(req, res){
        //https://www.npmjs.com/package/validator
        var validator = require('validator');

        console.log(req.param("email"));
        if(validator.isEmail(req.param('email'))){
            var params = req.params.all()

            User.create({name: params.name}).exec(function createCB(err, created){
                console.log('Created user succesfull with email: ' + req.param('email'));
                return res.redirect('/');
            });
        }
        else
            console.log('c est pas un email');

    },

    get_users: function(req, res){
        console.log('Enter in function get_users');
        User.find().exec(function (err, usersNamedFinn){
            if (err) {
                console.log(res.negotiate(err));
            }
            console.log('Wow, there are %d users.  Check it out:', usersNamedFinn.length, usersNamedFinn);
        });

    }
};

