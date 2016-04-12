var uri = process.env.TESTDB_URL || 'mongodb://localhost:27017/musicmixerdb';
var userModel = ('../app/models/user');
var songModel = ('../app/models/song');
var bcrypt = require('bcrypt-nodejs');

var mongoose = require('mongoose');
mongoose.connect(uri, function(){
    mongoose.connection.db.dropDatabase();
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback){
    console.log('db connected ' + uri);
    //
    // var newUser = userModel({
    //     local: {
    //         first: 'Test',
    //         last: 'User',
    //         username: 'Testname',
    //         email: 'test@gmail.com',
    //         password: bcrypt.hashSync('testpass', bcrypt.genSaltSync(8), null)
    //     },
    //     follows: [],
    //     isAdmin: false
    // });
    // newUser.save(function(err){
    //     if(err) throw err;
    //     console.log('User created!');
    // });
    //
    // var newAdmin = userModel({
    //     local: {
    //         first: 'Admin',
    //         last: 'User',
    //         username: 'Adminos',
    //         email: 'admin@gmail.com',
    //         password: bcrypt.hashSync('admin123', bcrypt.genSaltSync(8), null)
    //     },
    //     follows: [],
    //     isAdmin: true
    // });
    // newAdmin.save(function(err){
    //     if(err) throw err;
    //     console.log('Admin created!');
    // });
});

exports.mongoose = mongoose;
