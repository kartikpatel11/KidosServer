// The category model

var mongoose = require('mongoose')
   ,Schema = mongoose.Schema;
  // ,ObjectId = Schema.ObjectId;

var categorymasterSchema = new Schema({
  //  thread: ObjectId,
    catId: Number,
    catName: String,
    catImg: String
});

module.exports = mongoose.model('categorymaster', categorymasterSchema);
