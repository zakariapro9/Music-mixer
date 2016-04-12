var db = require('../../config/database.js');
var mongoose = require('mongoose');
var _ = require('lodash');

// Defining Share Schema
var songSchema = mongoose.Schema({
  title: String,
  username: String,
  user: { type : mongoose.Schema.ObjectId, ref : 'User'},
  settings: String,
  comments: [{
    body: String,
    user: { type : mongoose.Schema.ObjectId, ref : 'User' },
    username: String,
    createdAt: { type : Date, default : Date.now }
  }],
  ratings: [{
    rate: Number,
    user: {type: mongoose.Schema.ObjectId, ref: 'User'},
    username: String,
    ratedAt: {type: Date, default: Date.now }
  }],
  createdAt  : { type : Date, default : Date.now },
  shared: {type: Boolean, default: false},
  sharedAt: {type: Date, default: Date.now}
});

songSchema.virtual('avgRating').get(function(){
    if(_.size(this.ratings) === 0) return 0;
    return _.sumBy(this.ratings, 'rate')/_.size(this.ratings);
});

module.exports = mongoose.model('Song', songSchema);
