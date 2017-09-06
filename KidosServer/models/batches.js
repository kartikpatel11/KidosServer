var mongoose = require('mongoose')
   ,Schema = mongoose.Schema;


var batchesSchema = new Schema({
	days: [String], 
	starttime: {type: String},
	endtime: {type: String}
});

batchesSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
	  return this.collection.findAndModify(query, sort, doc, options, callback);
	};


module.exports = mongoose.model('batch', batchesSchema);
