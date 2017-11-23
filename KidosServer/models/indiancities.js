var mongoose=require('mongoose'),
Schema=mongoose.Schema;

var indiancitiesSchema= new Schema({
	state: {type:String},
	cities:[{
		city:{type:String},
		areas: [String]

	}]

	});

module.exports = mongoose.model('indiancities', indiancitiesSchema);