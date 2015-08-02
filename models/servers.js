var name = 'servers';
var schema = new mongoose.Schema({
	id: mongoose.Schema.ObjectId,
	ref: {type: String},
	name: {type: String},
	created: {type: Date, default: Date.now},
	address: {type: String},
	status: {type: String, enum: ['ok', 'warning', 'danger', 'error', 'unknown'], default: 'unknown', index: true},
	enabled: {type: Boolean, default: true, index: true},
});

module.exports = mongoose.model(name, schema);
