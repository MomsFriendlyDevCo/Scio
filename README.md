Scio
====
Open Source modular server status tracking.

**Features**:

* **Highly modular architecture** - Look on NPM for other [Scio](https://www.npmjs.com/browse/keyword/scio) tagged modules
* **Matrial design** - no more vomit inducing status screens that look like they were designed in 1994
* **Highly asyncronous** - Uses Nodes multi-threaded architecture to montior lots of servers and services simultaniously
* **Not Nagios** - 'nuf said


Installation
------------

Run the following:

	# Download via Git
	git clone https://github.com/MomsFriendlyDevCo/Scio.git

	# Change to its directory
	cd Scio

	# Grab all dependencies
	npm install
	bower install

	# Build the database
	gulp db

	# Start everything
	gulp
