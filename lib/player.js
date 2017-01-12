const logger = require('./logger.js'),
	Promise = require('bluebird'),
	spawn = require('child_process').spawn;
// TODO do we need this boolean? Maybe omxplayerProcess goes null on exit?
let omxplayerProcessRunning = false,
	omxplayerProcess = null;

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

	runCommand: function(command) {
		if (omxplayerProcessRunning) {
			logger.info(`Sending command: ${command}`);
			omxplayerProcess.stdin.write(command);
		}
	}
};