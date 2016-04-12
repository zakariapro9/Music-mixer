/* jshint node: true */
'use strict';

var fs = require('fs');
var path = require('path');
var songModel = require('../models/song.js');
var userModel = require('../models/user.js');
var usersCtrl = require('./usersController.js');
var helperCtrl = require('./helperController.js');
var mongoose = require('mongoose');
var _ = require('lodash');

exports.playSong = function(req,res){
    var songname = req.params.song;
    songModel.findOne({title: songname}, function(err, song){
        var isSubmitter = false;
        if(String(song.user) == String(req.user._id)) {
            isSubmitter = true;
            console.log("Owner checked");
        }
        function sendTrack(track) {
            if (!track)
                return res.send(404, 'Track not found with id "' + songname + '"');
            var d = JSON.stringify(track).replace(/ /g, '');
            res.render('player.ejs', {songname: songname, ttracks :track , stracks : d, isOwner: isSubmitter});
        }
        getTrack(songname, sendTrack);
    });
};

exports.loadtracks = function (req, res) {
    var songname = req.params[0];
    var mainSongName = songname.split('/')[0];
    songModel.findOne({title: mainSongName}, function(err, song){
        var p = __dirname + "/../../users/" + song.user + "/" + songname;
        var pp = path.resolve(p);

        res.sendfile(pp);
    });
};

function getTrack(songname, callback) {
    var foundSong;
    songModel.findOne({title: songname}, function(err, song){
        if(err) throw err;
        foundSong = song;
        var pp = __dirname + "/../../users/" + foundSong.user + "/" + songname;
        console.log("PP dir: " + pp);
        getFiles(pp, function(fileNames) {
            var track = {
                id: songname,
                instruments: [],
                user: foundSong.user,
                urls : []
            };
            fileNames.sort();
            for (var i = 0; i < fileNames.length; i ++) {
                var instrument = fileNames[i].match(/(.*)\.[^.]+$/, '')[1];
                track.instruments.push({
                    name: instrument,
                    sound: instrument + '.mp3'
                });
                track.urls.push(songname + '/' + instrument + '.mp3');
                console.log("Instrument Url: " + pp + '/' + instrument + '.mp3');
            }
            callback(track);
        });
    });
}

function getFiles(dirName, callback) {
    fs.readdir(dirName, function(error, directoryObject) {
        callback(directoryObject);
    });
}

exports.saveComment = function (request, response){
    var body = request.body;
    var comment = body.comment;
    var songname = body.songname;
    songModel.findOne({title: songname} , function(err, song){
        song.comments.push({
            body: comment,
            user: request.user,
            username: request.user.local.username
        });
        song.save(function(){
            response.end();
        });
    });
};

exports.loadComments = function(request, response){
    var songname = request.params.song;
    songModel.findOne({title: songname}, 'comments', function(err, song){
            response.send(_(song.comments).sortBy(['createdAt']).reverse());
    });
};

exports.saveRating = function (request, response){
    var body = request.body;
    var rating = body.rating;
    var songname = body.songname;
    if(rating === undefined) response.end();
    else {
        songModel.findOne({title: songname} , function(err, song){
            song.ratings = _.remove(song.ratings, function(x){
                if(JSON.stringify(x.user) === JSON.stringify(request.user._id)){
                    return false;
                }
                return true;
            });
            song.ratings.push({
                rate: rating,
                user: request.user,
                username: request.user.local.username
            });
            song.save(function(){
                response.end();
            });
        });
    }
};

exports.loadRatings = function(request, response){
    var songname = request.params.song;
    var myRatings = [];
    songModel.findOne({title: songname}, function(err, song){
            for(var i = 0; i < _.size(song.ratings); i++){
                if(JSON.stringify(song.ratings[i].user) === JSON.stringify(request.user._id)){
                    myRatings.push(song.ratings[i].rate);
                }
            }
            myRatings.push(song.avgRating);
            if(myRatings[0] === undefined) myRatings[0] = 0;
            if(myRatings[1] === undefined) myRatings[1] = 0;
            response.json(myRatings);
    });
};

exports.loadSettings = function(request, response){
    console.log('Load function');
    var songname = request.params.song;
    songModel.findOne({title:songname}, function(err, song){
        response.send(song.settings);
    });
};

exports.saveSettings = function(request, response){
    console.log('Save Settings here');
    var body = request.body;
    var settings = body.settings;
    console.log(settings);
    var songname = request.params.song;
    songModel.findOne({title: songname}, function(err, song){
        song.settings = settings;
        song.save(function(){
            response.end();
        });
    });
};
