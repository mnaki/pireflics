/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var bcrypt = require('bcryptjs');

module.exports = {

    create: function(req, res) {
        User.find({ mail: req.body.email }).exec(function ( err, users) {
             if (err) 
                    return res.serverError();
            if (users.length === 0) {
                // if the mail not exist
                User.create(req.body).exec(function(err, result){
                    if (err) 
                        return res.serverError();
                    
                    return res.redirect('/auth/login')
                });
            }
            // else error
            return res.badRequest({ error: " email already used "});
        })
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
            User.update({ id : req.session.user.id }, { firstname : req.param('firstname'),
                                                        lastname : req.param('lastname'),
                                                        email : req.param('email'),
                                                        default_language : req.param('lang')}).exec(function afterupdate(err, updated){
                if (err){
                    console.log(err.code);
                    req.session.msg = err.code;
                    res.redirect('user/my_profil');
                }
                else {
                    req.session.user.lastname = req.param('lastname');
                    req.session.user.firstname = req.param('firstname');
                    req.session.user.email = req.param('email');
                    req.session.user.default_language = req.param('lang');
                    res.redirect('user/my_profil');
                }
            });
        }
        else
            res.redirect('/auth/login');
    },
    send_reset_pwd: function(req, res) {

        User.findOne({email: req.param('email')}).exec(function(err, user) {

            if (err) {return done(err);}
            if(user.pwd == null){
                req.session.msg = 'Vous n avez pas de mot de passe, connectez vous par l api habituel';
                res.redirect('/auth/login');
            }
            else{
                if(req.param('firstname') == user.firstname && req.param('lastname') == user.lastname){
                    var token = Math.random()+'_'+user.email;
                    Token.create({ token : token}).exec(function afterupdate(err, updated){if(err){sails.log.debug(err)}});
                    token = new Buffer(token).toString('base64');
                    sails.hooks.email.send(
                        "reset_password",
                        {
                            recipientName: req.param('firstname'),
                            tokenLink: token,
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
    },
    reset_pwd: function (req, res) {
        var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
        if(base64regex.test(req.param('token'))) {
            var token = new Buffer(req.param('token'), 'base64').toString('utf8');
            Token.findOne({token : token}).exec(function(err, returnToken){
                if(err){return sails.log.debug(err)};

                if(!returnToken){
                    req.session.msg = 'Not a valid token.';
                    res.redirect('/auth/login');
                }
                else {
                    var email = token.split('_');
                    req.session.tmp_email = email[1];
                    Token.destroy({token : token}).exec(function(err, result){if(err){sails.log.debug(err)}})
                    res.view('user/new_password');
                }
            })
        }
        else {
            req.session.msg = 'Not a valid token.';
            res.redirect('/auth/login');
        }
    },
    new_pwd : function (req, res) {
        var pwd = req.param('password');
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(pwd, salt, function (err, hash) {
                if (err) {
                    sails.log.debug(err);
                }
                else {
                    pwd = hash;
                    User.update({email : req.session.tmp_email}, {pwd: pwd}).exec(function (err, result){
                        if(err){
                            sails.log.debug(err)
                        }
                    });
                    req.session.tmp_email = null;
                    res.redirect('/auth/login');

                }
            })
        });
    },

    findOne: function (req, res) {
        var id = req.params.id;

        if (id == undefined)   
            return res.notFound();

        User.find({ id: id }).exec(function (err, records) {
            if (err || records.length == 0)
                return res.notFound();
            else {
                res.view('user/other_profil', { user: records[0] });
            }
        });
    } 
};

