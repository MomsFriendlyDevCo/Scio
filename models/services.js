var name = 'services';
var schema = new mongoose.Schema({
	id: mongoose.Schema.ObjectId,
	server: {type: mongoose.Schema.ObjectId, ref: 'servers', index: true},
	created: {type: Date, default: Date.now},
	name: {type: String},
	plugin: {type: String},
	enabled: {type: Boolean, default: true, index: true},
	status: {type: String, enum: ['ok', 'warning', 'danger', 'error', 'unknown'], default: 'unknown', index: true},
	cronSchedule: {type: String, default: '0 * * * *'}, // (Second, Minute, Hour, DayOfMonth, Month, DayOfWeek)
	nextCheck: {
		date: {type: Date, default: Date.now},
		force: {type: Boolean, default: false}, // Force the schedule to run on the next processing cycle
	},
	lastCheck: {
		status: {type: String, enum: ['ok', 'warning', 'danger', 'error', 'unknown'], default: 'unknown', index: true},
		date: {type: Date},
		response: {type: String},
	},
});

module.exports = mongoose.model(name, schema);
