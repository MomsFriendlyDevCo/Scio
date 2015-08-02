Scio
====
Open Source modular server status tracking.


**WARNING: This project is still in the beta stage. Use at your own risk**


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

	# Start everything
	gulp


Configuration
-------------
Obviously you will be wanting to specify your own server / sevice combos.

Scio needs *some* plugins to work so either go look for some [Scio tagged modules](https://www.npmjs.com/browse/keyword/scio) or use the below to get started:

	# Install the base ping + http monitoring plugins
	npm install scio-monitor-ping scio-monitor-http

