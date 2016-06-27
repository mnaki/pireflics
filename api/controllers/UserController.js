/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    create: function(req, res) {
        User.create(req.body).exec(function(err, result){
            if (err) {
                //Handle Error
            }
            return res.redirect('/auth/login')
        });
    },
    
    my_profil : function (req, res){
        if(req.user)
            res.view('user/my_profil');
        else
            res.redirect('/auth/login');
    },
    edit_picture : function(req,res){
        if(req.user){
            User.update({ id : req.session.user.id }, { image : req.param('picture') }).exec(function afterupdate(err, updated){
                if (err) return res.serverError(err);
                req.session.user.image = req.param('picture');
                res.redirect('user/my_profil');
            });
        }
        else
            res.redirect('/auth/login');
    },
    edit_info : function (req, res){
        if(req.user) {
            User.update({ id : req.session.user.id }, { firstname : req.param('firstname'), lastname : req.param('lastname'), email : req.param('email') }).exec(function afterupdate(err, updated){
                if (err){
                    console.log(err.code);
                    req.session.msg = err.code;
                    res.redirect('user/my_profil');
                }
                else {
                    req.session.user.lastname = req.param('lastname');
                    req.session.user.firstname = req.param('firstname');
                    req.session.user.email = req.param('email');
                    res.redirect('user/my_profil');
                }
            });
        }
        else
            res.redirect('/auth/login');
    },
    reset_pwd: function(req, res) {
        User.findOne({email: req.param('email')}).exec(function(err, user) {
            if (err) {return done(err);}
            if(user.pwd == null){
                req.session.msg = 'Vous n avez pas de mot de passe, connectez vous par l api habituel';
                res.redirect('/auth/login');
            }
            else{
                if(req.param('firstname') == user.firstname && req.param('lastname') == user.lastname){
                    sails.hooks.email.send(
                        "reset_password",
                        {
                            recipientName: req.param('firstname'),
                            senderName: "Admin"
                        },
                        {
                            to: "valentin.klepper@gmail.com",
                            subject: "Hi there"
                        },
                        function(err) {sails.log.debug(err || "Email for reset password sended !");}
                    );
                    req.session.msg = 'You will receved an email to reset you password.';
                    res.redirect('/auth/login');
                }
                else{
                    req.session.msg = 'Mmmh, les informations ne concordent pas...';
                    res.redirect('/lost_password');
                }

            }
        });
    }

	
};

