/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    
    my_profil : function (req, res){
        if(req.user)
            res.view('user/my_profil');
        else
            res.redirect('/auth/login');
    }
	
};

