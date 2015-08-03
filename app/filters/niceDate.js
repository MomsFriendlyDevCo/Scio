/**
* niceDate - Convert a JavaScript date object epoch into a readable date/time string
*/
var zeroPad = function(no) {
	return (no < 10) ? '0' + no : no;
};
app.filter('niceDate', function() {
	return function(value) {
		if (!value) return;

		var date = new Date(Date.parse(value));
		var now = new Date();
		if (date.getFullYear() != now.getFullYear() || date.getMonth() != now.getMonth() || date.getDate() != now.getDate()) { // Occured on a different date
			return date.getHours() + ':' + zeroPad(date.getMinutes()) + ' ' + date.getDate() + '/' + date.getMonth() + '/' + date.getYear();
		} else if (date.getHours() < 13) { // Occured this morning
			return date.getHours() + ':' + zeroPad(date.getMinutes()) + ' am';
		} else if (date.getHours() >= 13) { // Occurred this afternoon
			return (date.getHours() - 12) + ':' + zeroPad(date.getMinutes()) + ' pm';
		}
		return 'unknown';
	};
});
