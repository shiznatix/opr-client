const Promise = require('bluebird'),
	spawn = require('child_process').spawn,
	omxplayerProcessRunning = false,
	omxplayerProcess = null;

class Command {
	construct(type, params = null) {
		this.type = type;
		this.params = params;
	}
}

function runCommand(command) {
	return new Promise((accept, reject) => {
		if (omxplayerProcessRunning) {

		}
	});
}

module.exports = {
	play: function(filePath) {
		return new Promise((accept, reject) => {
			if (!omxplayerProcessRunning) {
				return runCommand(new Command('q'));
			}

			return runCommand(new Command('q'));
		});
	},

	close: function() {
		return new Promise((accept, reject) => {
			if (!omxplayerProcessRunning) {
				return accept();
			}

			return runCommand(new Command('quit'));
		});
	},

	volumeDown: function() {
		return new Promise((accept, reject) => {
			return accept();
		});
	},

	volumeUp: function() {
		return new Promise((accept, reject) => {
			return accept();
		});
	},

	playPause: function() {
		return new Promise((accept, reject) => {
			return accept();
		});
	},

	forward: function() {
		return new Promise((accept, reject) => {
			return accept();
		});
	},

	back: function() {
		return new Promise((accept, reject) => {
			return accept();
		});
	},
};