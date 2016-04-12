/* jshint node: true */
'use strict';

var userModel = require('../models/user.js');
var songModel = require('../models/song.js');
var bcrypt = require('bcrypt-nodejs');

exports.adminAccess = function(request, response){
    response.render('admin/admin.ejs');
};

exports.usersData = function(request, response){
    userModel.find({}, function(err, users){
        response.render('admin/users.ejs', {users: users});
    });
};

exports.postsData = function(request, response){
    songModel.find({}, function(err, songs){
        response.render('admin/posts.ejs', {songs: songs});
    });
};

exports.statsData = function(request, response){
    response.render('admin/stats.ejs');
};

exports.toggleAdmin = function(request, response){
    userModel.findOne({'local.username': request.params.username}, function(err, foundUser){
        if(err) throw err;
        foundUser.isAdmin = !foundUser.isAdmin;
        foundUser.save(function(){
            response.redirect('/admin/users');
        });
    });
};

exports.getUserProfileSettings = function(request, response){
    var username = request.params.username;
    userModel.findOne({'local.username': username}, function(err, foundUser){
        if(err) throw err;
        console.log("Here found ");
        console.log(foundUser);
        response.render('admin/profile-edit.ejs', {user: foundUser});
    });
};

exports.saveUserData = function(request, response){
    var usernameReceived = request.params.username;
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

exports.deleteUser = function(request, response){
    userModel.remove({'local.username': request.params.username}, function(err, foundUser){
        if(err) throw err;
        response.redirect('/admin/users');
    });
};

exports.logsData = function(request, response){
    response.render("admin/logs.ejs");
};
