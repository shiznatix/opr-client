const logger = require('./logger.js'),
	Promise = require('bluebird'),
	spawn = require('child_process').spawn;

class Player {
	constructor() {
		this.omxplayerProcessRunning = false;
		this.omxplayerProcess = null;
		this.playTimeout = null;
	}

	play(filePath, pushToPlayQueue = true) {
		// if we set a timeout to try playing after .kill()
		// we want to make sure that our most recent play()
		// call will be the one that will trigger omxplayer
		// so we don't have a race condition with multiple
		// setTimeout() calls running
		if (this.playTimeout) {
			clearTimeout(this.playTimeout);
		}

		if (this.omxplayerProcessRunning) {
			// what if we send this twice?
			this.runCommand('q');

			this.playTimeout = setTimeout(() => {
				this.play(filePath, false);
			}, 500);
			return;
		}

		this.omxplayerProcessRunning = true;
		this.omxplayerProcess = spawn('omxplayer', ['-b', filePath]);

		this.omxplayerProcess.stdout.on('data', (data) => {
			logger.debug(data.toString('utf8'));
		});

		this.omxplayerProcess.stderr.on('data', (data) => {
			logger.error(data.toString('utf8'));
		});

		this.omxplayerProcess.on('exit', (code) => {
			logger.info(`omxplayer exit code: ${code}`);
			this.omxplayerProcessRunning = false;
			this.omxplayerProcess = null;
		});
	}

	runCommand(command) {
		if (this.omxplayerProcessRunning) {
			logger.info(`Sending command: ${command}`);
			this.omxplayerProcess.stdin.write(command);
		}
	}
}

module.exports = new Player();