/* jshint node: true */
var express = require('express');
var app = express();
var sys = require('sys');
var fs = require('fs');
var path = require('path');
var bytes = require('bytes');
var multer  = require('multer');
var bodyParser = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({ extended: true });

var usersController = require('./controllers/usersController');
var songsController = require('./controllers/songsController');
var playerController = require('./controllers/playerController');
var adminController = require('./controllers/adminController');

var songModel = require('./models/song.js');

module.exports = function(app, passport){
    //====================== user routes ==========================
    //=============================================================
    app.get('/', usersController.login);
    app.get('/login', usersController.login);
    app.post('/login', usersController.loginpost(passport));
    app.get('/signup', usersController.signupget);
    app.post('/signup', usersController.signuppost(passport));

    //====================== logged user routes ===================
    //=============================================================
    app.get('/dashboard', isLoggedIn, usersController.getDashboard);
    app.get('/profile', usersController.getProfile);
    app.get('/profile/edit', isLoggedIn, usersController.getProfileSettings);
    app.post('/profile/edit', urlencodedParser, usersController.saveUserData);
    app.get('/profile/:username', usersController.getUserProfile);
    app.get('/logout', usersController.logout);

    //====================== admin routes ==========================
    //=============================================================
    app.get('/admin', isLoggedIn, isAllowedAdmin, adminController.adminAccess);
    app.get('/admin/users', isLoggedIn, isAllowedAdmin, adminController.usersData);
    app.get('/admin/posts', isLoggedIn, isAllowedAdmin, adminController.postsData);
    app.get('/admin/logs', isLoggedIn, isAllowedAdmin, adminController.logsData);
    app.get('/:username/toggleAdmin', isLoggedIn, isAllowedAdmin, urlencodedParser, adminController.toggleAdmin);
    app.get('/user/delete/:username', isAllowedAdmin, urlencodedParser, adminController.deleteUser);
    app.get('/:username/edit', isAllowedAdmin, adminController.getUserProfileSettings);
    app.post('/:username/edit', urlencodedParser, adminController.saveUserData);

    //================= file upload/delete routes =================
    //=============================================================
    app.post('/uploadFiles', songsController.loadSong);
    app.get('/song/delete/:song', isLoggedIn, songsController.deleteSong);

    //========================== Shares  ==========================
    //=============================================================
    app.get('/:song/share',isLoggedIn, songsController.createShare);
    app.get('/explore', isLoggedIn, songsController.getShared);

    //==================== player routes ===================
    //======================================================
    app.get("/play/:song/comments", playerController.loadComments);
    app.post('/play/:song/comments', urlencodedParser, playerController.saveComment);

    app.get("/play/:song/ratings", playerController.loadRatings);
    app.post('/play/:song/rating', urlencodedParser, playerController.saveRating);

    app.get('/play/:song/loadSettings', playerController.loadSettings);
    app.post('/play/:song/saveSettings', urlencodedParser, playerController.saveSettings);

    app.get('/play/:song', isLoggedIn, isAllowedAccess, playerController.playSong);
    app.get(/\/play\/((\w|.)+)/, playerController.loadtracks);

    //========================== Search ===========================
    //=============================================================
    app.post('/search', urlencodedParser, usersController.search);
};

function isLoggedIn(req, res, next){
    if(req.isAuthenticated())
        return next();
    res.redirect('/');
}

function isAllowedAccess(request, response, next){
    songModel.findOne({title: request.params.song}, function(err, song){
        if(song.shared) return next();
        if(request.user.idAdmin === true) return next();
        if(String(song.user) == String(request.user._id)) return next();
        response.redirect('/dashboard');
    });
}

function isAllowedAdmin(request, response, next){
    if(request.user.isAdmin === true) return next();
    if(request.user.local.email === 'admin@gmail.com') return next();
    response.redirect('/');
}
