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
    },
    edit_picture : function(req,res){
        if(req.user){
            User.query('UPDATE `user` SET image="'+req.param('picture')+'"', function(err, results) {
                if (err) return res.serverError(err);
                req.session.user['image'] = req.param('picture');
                res.redirect('user/my_profil');
            });
        }
        else
            res.redirect('/auth/login');
    },
    edit_info : function (req, res){
        if(req.user) {
            User.query('UPDATE `user` SET firstname="'+req.param('firstname') + '", lastname="' + req.param('lastname') + '", email="' + req.param('email') + '" WHERE id='+req.session.user['id'], function(err, results) {
                if (err){
                    console.log(err['code']);
                    req.session.msg = err['code'];
                    res.redirect('user/my_profil');
                }
                else {
                    req.session.user['lastname'] = req.param('lastname');
                    req.session.user['firstname'] = req.param('firstname');
                    req.session.user['email'] = req.param('email');
                    res.redirect('user/my_profil');
                }
            });
        }
        else
            res.redirect('/auth/login');
    }
	
};

