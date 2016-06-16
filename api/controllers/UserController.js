/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    new_user: function(req, res){
        console.log(req.param("pseudo"));
        console.log(req.session);
        req.session.user = req.param('pseudo');
        console.log(req.session);
    }
	
};

