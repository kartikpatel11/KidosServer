var mongoose=require('mongoose'),
Schema=mongoose.Schema;

var ActivityCounterSchema = new Schema({
    _id: {type: String, required: true},
    seq: { type: Number }
});

module.exports = mongoose.model('activitycounter', ActivityCounterSchema);