var db = require('../../config/database.js');
var mongoose = require('mongoose');
// Defining User Scheme
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    local            : {
        first        : String,
        last         : String,
        username     : String,
        email        : String,
        password     : String
    },
    follows: [{ type : mongoose.Schema.ObjectId, ref : 'User' }],
    isAdmin: {type: Boolean, default: false}
});

userSchema.virtual('fullname').get(function(){
    return this.local.first + " " + this.local.last;
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
