Scio
====
*Latin: "I know" (Usually yelled after someone tells you a server is down)*

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




Plugin Development
==================
Scio is highly configurable via the NPM module system.

When Scio loads it searches its own node_modules path for any of the following plugin formats:

* **scio-monitor** - Monitor plugins. These supply Scio with modules capable of probing a remote service.
* **scio-notifier** - Notifier plugins. When a monitor detects a server or service changes state these plugins alert in some way.
* **scio-parser** - Config format parsers. These plugins extend Scios default config formats.

Each plugin should be in the format `scio-(type)-(name)` (e.g. `scio-notifer-console`).


Scio events
-----------
The main `scio` object will emit the following events:

| Event                | Arguments               | Description |
|----------------------|-------------------------|-------------|
| `ready`              |                         | Emitted when all plugins have loaded and Scio is entering the main event cycle |
| `serverStatus`       | serverObject            | Emitted when the status of a server model changes |
| `serviceStatus`      | serviceObject           | Emitted when the status of a service model changes |
