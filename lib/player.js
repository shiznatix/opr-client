const logger = require('./logger.js'),
	Promise = require('bluebird'),
	spawn = require('child_process').spawn,
	// TODO do we need this boolean? Maybe omxplayerProcess goes null on exit?
	omxplayerProcessRunning = false,
	omxplayerProcess = null;

function runCommand(command) {
	if (omxplayerProcessRunning) {
		// TODO do we need a new line \n?
		omxplayerProcess.stdin.write(command);
		// TODO do we need this line?
		omxplayerProcess.stdin.end();
	}
}

module.exports = {
	play: function(filePath) {
		if (omxplayerProcessRunning) {
			omxplayerProcess.kill();
			omxplayerProcess = null;
		}

		omxplayerProcessRunning = true;
		omxplayerProcess = spawn('omxplayer', ['-b', filePath]);

		omxplayerProcess.stdout.on('data', (data) => {
			logger.info(data);
		});

		omxplayerProcess.stderr.on('data', (data) => {
			logger.error(data);
		});

		omxplayerProcess.on('exit', (code) => {
			logger.info(`omxplayer exit code: ${code}`);
			omxplayerProcessRunning = false;
		});
	},

	close: function() {
		runCommand('q');
	},

	volumeDown: function() {
		runCommand('-');
	},

	volumeUp: function() {
		runCommand('+');
	},

	playPause: function() {
		runCommand(' ');
	},

	forward: function() {
		runCommand('^[[C');
	},

	back: function() {
		runCommand('^[[D');
	},
};