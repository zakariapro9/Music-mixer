/* jshint expr: true */
process.env.TESTDB_URL = 'mongodb://localhost:27017/musicmixerdbtest';

var chai = require('chai');
var chaiHttp = require('chai-http');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var server = require('../server');
var userModel = require('../app/models/user');
var songModel = require('../app/models/song');

var should  = chai.should();
chai.use(chaiHttp);

describe('Home Page & authentication', function(){
    it('should redirect to a login form on / GET', function(done){
        chai.request(server)
        .get('/')
        .end(function(err, res){
            res.should.have.status(200);
            done();
        });
    });
    it('should have a login form on /login GET', function(done){
        chai.request(server)
        .get('/login')
        .end(function(err, res){
            res.should.have.status(200);
            res.should.be.html;
            done();
        });
    });
});

describe('Users', function(){

    userModel.collection.drop();

    beforeEach(function(done){
        var newUser = new userModel({
            'local.first': 'Karim',
            'local.last': 'Gawish',
            'local.username': 'kagawish',
            'local.email': 'karimgawish@gmail.com',
            'local.password': bcrypt.hashSync('password123', bcrypt.genSaltSync(8), null)
        });
        newUser.save(function(err){
            done();
        });
    });
    afterEach(function(done){
        userModel.collection.drop();
        done();
    });

    it('should enable user to login on /login POST and redirect to dashboard', function(done){
        chai.request(server)
        .post('/login')
        .field('email', 'karimgawish.1@gmail.com')
        .field('password', 'password123')
        .end(function(err, res){
            res.should.have.status(302);
            done();
        });
    });
    it('should list ALL user\'s songs on /dashboard GET', function(done){
        chai.request(server)
        .get('/dashboard')
        .end(function(err, res){
            res.should.have.status(200);
            done();
        });
    });
});
