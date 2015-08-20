var name = 'services';
var schema = new mongoose.Schema({
	id: mongoose.Schema.ObjectId,
	server: {type: mongoose.Schema.ObjectId, ref: 'servers', index: true},
	created: {type: Date, default: Date.now},
	ref: {type: String},
	name: {type: String},
	plugin: {type: String},
	enabled: {type: Boolean, default: true, index: true},
	status: {type: String, enum: ['ok', 'warning', 'danger', 'error', 'unknown'], default: 'unknown', index: true},
	cronSchedule: {type: String, default: '*/5 * * * *'}, // (Second, Minute, Hour, DayOfMonth, Month, DayOfWeek)
	nextCheck: {
		date: {type: Date, default: Date.now},
		force: {type: Boolean, default: false}, // Force the schedule to run on the next processing cycle
	},
	lastCheck: {
		status: {type: String, enum: ['ok', 'warning', 'danger', 'error', 'unknown'], default: 'unknown', index: true},
		value: {type: Number},
		date: {type: Date},
		response: {type: String},
	},
	options: {type: mongoose.Schema.Types.Mixed},
});

// Pre save hook to alloc .ref {{{
var Servers = require('./servers');
var Services;

/**
* Bind a post save handler to allocate a unique .ref to each service based on the plugin+offset
* This should be unique under each server
* NOTE: This uses a setTimeout() method of setting up a task to run AFTER the record is created as Mongo donsn't like us counting records as a new one is being created
*/
schema.pre('save', function(next) {
	if (!this.ref) {
		var newService = this;
		setTimeout(function() {
			Services.count({server: newService.server._id, plugin: newService.plugin}, function(err, count) {
				if (err) { console.log('ERROR', 'Error allocating ref to', newService._id, err); return };
				var newRef = count > 1 ? newService.plugin + (count+1) : newService.plugin;
				Services.update({_id: newService._id}, {ref: newRef}).exec();
			});
		});
	}
	next();
});
// }}}

Services = module.exports = mongoose.model(name, schema);
