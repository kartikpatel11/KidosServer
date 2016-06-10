var mongoose=require('mongoose'),
Schema=mongoose.Schema;

var UserCounterSchema = new Schema({
    _id: {type: String, required: true},
    seq: { type: Number }
});

module.exports = mongoose.model('usercounter', UserCounterSchema);