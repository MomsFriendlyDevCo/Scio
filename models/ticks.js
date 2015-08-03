var name = 'ticks';
var schema = new mongoose.Schema({
	id: mongoose.Schema.ObjectId,
	created: {type: Date, default: Date.now},
	serverRef: {type: String, index: true},
	serviceRef: {type: String, index: true},
	status: {type: String, enum: ['ok', 'warning', 'danger', 'error', 'unknown'], default: 'unknown'},
	value: {type: Number},
	response: {type: String},
});

module.exports = mongoose.model(name, schema);
