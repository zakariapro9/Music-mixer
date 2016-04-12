/* jshint node: true */
'use strict';

var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var songModel = require('../models/song.js');
var userModel = require('../models/user.js');
var helperCtrl = require('./helperController.js');
var bcrypt = require('bcrypt-nodejs');

exports.login = function(req,res){
  res.render('login.ejs', {message:req.flash('loginMessage')});
};

exports.loginpost = function(passport){
   return passport.authenticate('local-login', {
  successRedirect : '/dashboard',
  failureRedirect : '/login',
  failureFlash : true});
};

exports.signupget = function(req,res){
  res.render('signup.ejs',{message:req.flash('signupMessage')});
};

exports.signuppost = function(passport){
  return passport.authenticate('local-signup', {
    successRedirect : '/dashboard',
    failureRedirect : '/signup',
    failureFlash : true
  });
};

exports.getDashboard = function(req, res){
  songModel.find({user: req.user._id}, function(err, songslist){
      res.render('dashboard.ejs', {user: req.user, songs: songslist, message: req.flash('duplicateName')});
  });
};

exports.getUserProfile = function(request, response){
    console.log('Routed to the right function');
    userModel.findOne({'local.username' : request.params.username}, function(err, foundUser){
        songModel.find({'user': foundUser, shared: true}, function(err, foundSongs){
            response.render('profile.ejs', {user: foundUser, songs: foundSongs});
        });
    });
};

exports.getProfile = function(request, response){
    songModel.find({user: request.user._id, shared: true}, function(err, songlist){
        response.render('profile.ejs', {user: request.user, songs: songlist});
    });
};

exports.getProfileSettings = function(request, response){
    response.render('profile-edit.ejs', {user: request.user});
};

exports.saveUserData = function(request, response){
    userModel.findById(request.user._id, function(err, foundUser){
        var body = request.body;
        var firstname = body.firstname;
        var lastname = body.lastname;
        var username = body.username;
        var email = body.email;
        var password = body.password;

        foundUser.local.first = firstname;
        foundUser.local.last = lastname;
        foundUser.local.username = username;
        foundUser.local.email = email;
        foundUser.local.password =  bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
        foundUser.save(function(){
            response.end();
        });
    });
};

exports.logout = function(req,res){
  req.logout();
  res.redirect('/');
};

exports.getUsernameById = function(id){
    User.findOne({_id: id}, function(err, user){
        if(err) throw err;
        if(user !== undefined && user !== null) {
            return user.local.username;
        }
    });
};

exports.search = function(request, response){
    var body = request.body;
    var keyword = body.text;
    userModel.find({'local.username': keyword}, function(err, users){
        songModel.find({title: keyword, shared: true}, function(err, songs){
            response.render('search.ejs', {query: keyword, foundUsers:users , foundSongs:songs});
        });
    });
};
