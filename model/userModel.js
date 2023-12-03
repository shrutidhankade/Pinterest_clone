const mongoose = require('mongoose');
const plm = require("passport-local-mongoose")

const userSchema = new mongoose.Schema({
  username:String,
  email: String,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    }
  ],
  password: Number


});
userSchema.plugin(plm);

module.exports = mongoose.model('User', userSchema);