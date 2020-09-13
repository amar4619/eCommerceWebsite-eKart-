const express = require('express');
let router = express.Router();

var passport = require('passport')
var bcrypt = require('bcryptjs')
var User = require('../models/user')


router.get('/register', function (req, res) {
    res.render('register', {
        title: 'register'
    })
})


router.post('/register', function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.confirm;
    var typee = req.body.type;

    //console.log(name + "email: " + email + " pas:" + password2 + " pas:" + password + " uname: " + username);


    req.checkBody('name', 'Name is Required').notEmpty();
    req.checkBody('password', 'Password is Required ').notEmpty();
    req.checkBody('username', 'Username is Required').notEmpty();
    req.checkBody('password', 'Passwords does not match').equals(password2);
    req.checkBody('email', 'Email is Required').isEmail();

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors,
            user:null,
            title: 'register'
        })
    } else {
        User.findOne({
            username: username
        }, function (err, user) {
            if (user) {
                req.flash('danger', 'Username exists');
                res.redirect('/users/register');
            } else {
                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 0
                })
                if(typee == 'Farmer'){
                    user.admin = 2;
                }
             //   console.log(user.admin + " " + typee);
                
                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        if (err) {
                            console.log(err);

                        }
                        user.password = hash;

                        user.save(function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.flash('success', 'Youo are now Registered')
                                res.redirect('/users/login')
                            }
                        })
                    })
                })
            }
        })
    }
})

router.get('/login', function (req, res) {
    if (res.locals.user) res.redirect('/');

    res.render('login', {
        title: 'Log In'
    })
})

router.post('/login', function (req, res, next) {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true

    })(req, res, next);

})

router.get('/logout', function (req, res) {
   req.logout();
   req.flash('success','See you Soon...');
   res.redirect('/login')

})
module.exports = router;