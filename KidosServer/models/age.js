var mongoose = require('mongoose')
   ,Schema = mongoose.Schema;

   var ageSchema = new Schema({
  //  thread: ObjectId,
    from: Number,
    to: Number
});

ageSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
	  return this.collection.findAndModify(query, sort, doc, options, callback);
	};


module.exports = mongoose.model('age', ageSchema);